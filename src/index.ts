import { buildApp } from "./server.js";
import { localHttpsOptions } from "./tls.js";

const port = Number(process.env.GESTIO_PORT ?? 3443);
const host = process.env.GESTIO_HOST ?? "127.0.0.1";

const app = buildApp({ https: localHttpsOptions() });

await app.listen({ port, host });
