import assert from "node:assert/strict";
import { X509Certificate } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { localHttpsOptions } from "./tls.js";

test("replaces an expired local HTTPS certificate", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "gestio-tls-"));
  const keyPath = join(dir, "localhost-key.pem");
  const certPath = join(dir, "localhost-cert.pem");
  const generated = spawnSync("openssl", [
    "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-sha256", "-days", "1",
    "-subj", "/CN=localhost", "-keyout", keyPath, "-out", certPath
  ], { stdio: "ignore" });
  assert.equal(generated.status, 0, "OpenSSL is required to create the expired certificate fixture");

  const expiredCertificate = readFileSync(certPath);
  const expiredAt = new X509Certificate(expiredCertificate).validToDate;
  t.mock.timers.enable({ apis: ["Date"], now: expiredAt.getTime() + 1_000 });
  process.env.GESTIO_TLS_KEY_FILE = keyPath;
  process.env.GESTIO_TLS_CERT_FILE = certPath;
  t.after(() => {
    delete process.env.GESTIO_TLS_KEY_FILE;
    delete process.env.GESTIO_TLS_CERT_FILE;
    rmSync(dir, { recursive: true, force: true });
  });

  const options = localHttpsOptions();
  assert.notDeepEqual(options.cert, expiredCertificate);
  assert.ok(new X509Certificate(options.cert).validToDate > new Date());
});
