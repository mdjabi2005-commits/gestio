import assert from "node:assert/strict";
import { X509Certificate } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { localHttpsOptions } from "./tls.js";

function createCertificate(keyPath: string, certPath: string) {
  const generated = spawnSync("openssl", [
    "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-sha256", "-days", "1",
    "-subj", "/CN=localhost", "-keyout", keyPath, "-out", certPath
  ], { stdio: "ignore" });
  assert.equal(generated.status, 0, "OpenSSL is required to create the expired certificate fixture");
  return readFileSync(certPath);
}

test("replaces an expired default local HTTPS certificate", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "gestio-tls-"));
  const localDir = join(dir, ".local");
  const keyPath = join(localDir, "localhost-key.pem");
  const certPath = join(localDir, "localhost-cert.pem");
  mkdirSync(localDir);
  const expiredCertificate = createCertificate(keyPath, certPath);

  const expiredAt = new X509Certificate(expiredCertificate).validToDate;
  t.mock.timers.enable({ apis: ["Date"], now: expiredAt.getTime() + 1_000 });
  const previousCwd = process.cwd();
  process.chdir(dir);
  t.after(() => {
    process.chdir(previousCwd);
    rmSync(dir, { recursive: true, force: true });
  });

  const options = localHttpsOptions();
  assert.notDeepEqual(options.cert, expiredCertificate);
  assert.ok(new X509Certificate(options.cert).validToDate > new Date());
});

test("never writes configured TLS files", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "gestio-tls-"));
  const keyPath = join(dir, "server-key.pem");
  const certPath = join(dir, "server-cert.pem");
  process.env.GESTIO_TLS_KEY_FILE = keyPath;
  process.env.GESTIO_TLS_CERT_FILE = certPath;
  t.after(() => {
    delete process.env.GESTIO_TLS_KEY_FILE;
    delete process.env.GESTIO_TLS_CERT_FILE;
    rmSync(dir, { recursive: true, force: true });
  });

  assert.throws(() => localHttpsOptions(), new RegExp(keyPath.replaceAll("\\", "\\\\")));

  const expiredCertificate = createCertificate(keyPath, certPath);
  const expiredAt = new X509Certificate(expiredCertificate).validToDate;
  t.mock.timers.enable({ apis: ["Date"], now: expiredAt.getTime() + 1_000 });

  assert.throws(() => localHttpsOptions(), (error: Error) => {
    assert.match(error.message, new RegExp(certPath.replaceAll("\\", "\\\\")));
    assert.match(error.message, new RegExp(expiredAt.toISOString()));
    return true;
  });
  assert.deepEqual(readFileSync(certPath), expiredCertificate);
});
