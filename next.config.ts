import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";

import "./src/env.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
};

export default config;
