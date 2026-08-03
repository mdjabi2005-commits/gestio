import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { X509Certificate } from "node:crypto";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

export function localHttpsOptions() {
  const configured = process.env.GESTIO_TLS_KEY_FILE !== undefined || process.env.GESTIO_TLS_CERT_FILE !== undefined;
  const keyPath = process.env.GESTIO_TLS_KEY_FILE ?? ".local/localhost-key.pem";
  const certPath = process.env.GESTIO_TLS_CERT_FILE ?? ".local/localhost-cert.pem";
  const keyExists = existsSync(keyPath);
  const certExists = existsSync(certPath);
  const validTo = certExists ? new X509Certificate(readFileSync(certPath)).validToDate : undefined;

  if (configured) {
    if (!keyExists) throw new Error(`Configured TLS file not found: ${keyPath}`);
    if (!certExists) throw new Error(`Configured TLS file not found: ${certPath}`);
    if (validTo! <= new Date()) throw new Error(`Configured TLS certificate expired at ${validTo!.toISOString()}: ${certPath}`);
  } else if (!keyExists || !certExists || validTo! <= new Date()) {
    mkdirSync(dirname(keyPath), { recursive: true });
    mkdirSync(dirname(certPath), { recursive: true });
    const result = spawnSync("openssl", [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-sha256",
      "-days",
      "365",
      "-subj",
      "/CN=localhost",
      "-addext",
      "subjectAltName=DNS:localhost,IP:127.0.0.1",
      "-keyout",
      keyPath,
      "-out",
      certPath
    ], { stdio: "ignore" });

    if (result.status !== 0) {
      throw new Error("OpenSSL is required to create the local HTTPS certificate");
    }
  }

  return {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath)
  };
}
