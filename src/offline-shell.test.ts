import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import test from "node:test";

function buildServiceWorker() {
  const vite = fileURLToPath(new URL("./bin/vite.js", import.meta.resolve("vite/package.json")));
  const result = spawnSync(process.execPath, [vite, "build", "--config", "vite.config.ts"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const source = readFileSync("dist/web/sw.js", "utf8");
  const build = JSON.parse(source.slice(source.indexOf("=") + 1, source.indexOf(";")));
  return { build, source } as { build: { cache: string; shell: string[] }; source: string };
}

test("preloads, replaces and serves the latest application shell offline", async () => {
  const first = buildServiceWorker();
  const second = buildServiceWorker();
  assert.notEqual(first.build.cache, second.build.cache);
  assert.ok(second.build.shell.includes("/"));
  assert.ok(second.build.shell.some(file => /^\/assets\/index-.*\.js$/.test(file)));

  const listeners: Record<string, (event: any) => void> = {};
  const stores = new Map<string, Map<string, Response>>([[first.build.cache, new Map([["/", new Response("ancienne coque")]])]]);
  const requestKey = (request: string | { url: string }) => new URL(typeof request === "string" ? request : request.url, "https://gestio.test").pathname;
  const caches = {
    open: async (name: string) => {
      const store = stores.get(name) ?? new Map<string, Response>();
      stores.set(name, store);
      return {
        addAll: async (files: string[]) => files.forEach(file => store.set(file, new Response(`${name}:${file}`))),
        put: async (request: { url: string }, response: Response) => { store.set(requestKey(request), response); }
      };
    },
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
    match: async (request: string | { url: string }) => {
      for (const store of stores.values()) {
        const response = store.get(requestKey(request));
        if (response) return response.clone();
      }
    }
  };
  let skipped = false;
  let claimed = false;
  const self = {
    addEventListener: (name: string, listener: (event: any) => void) => { listeners[name] = listener; },
    skipWaiting: async () => { skipped = true; }
  };
  const context = {
    self, caches, clients: { claim: async () => { claimed = true; } }, location: { origin: "https://gestio.test" },
    URL, Response, fetch: async (): Promise<Response> => { throw new Error("offline"); }
  };
  runInNewContext(second.source, context);

  let lifecycle: Promise<unknown> | undefined;
  listeners.install({ waitUntil: (promise: Promise<unknown>) => { lifecycle = promise; } });
  await lifecycle;
  assert.equal(skipped, true);
  listeners.activate({ waitUntil: (promise: Promise<unknown>) => { lifecycle = promise; } });
  await lifecycle;
  assert.equal(claimed, true);
  assert.deepEqual(await caches.keys(), [second.build.cache]);

  const request = { url: "https://gestio.test/", method: "GET", destination: "document" };
  let reply: Promise<Response> | undefined;
  listeners.fetch({ request, respondWith: (response: Promise<Response>) => { reply = response; } });
  assert.equal(await (await reply!).text(), `${second.build.cache}:/`);

  stores.get(second.build.cache)!.clear();
  listeners.fetch({ request, respondWith: (response: Promise<Response>) => { reply = response; } });
  const unavailable = await reply!;
  assert.equal(unavailable.status, 503);
  assert.match(await unavailable.text(), /pas encore disponible hors connexion/);

  context.fetch = async () => new Response("coque réseau");
  listeners.fetch({ request, respondWith: (response: Promise<Response>) => { reply = response; } });
  assert.equal(await (await reply!).text(), "coque réseau");
  assert.equal(await stores.get(second.build.cache)!.get("/")!.text(), "coque réseau");
});
