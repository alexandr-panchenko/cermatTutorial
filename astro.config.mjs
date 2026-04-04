import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  adapter: cloudflare({
    imageService: "passthrough",
    workerEntryPoint: {
      path: "./src/worker.ts",
      namedExports: ["ProgressHub"]
    }
  }),
  integrations: [react()],
  output: "server"
});
