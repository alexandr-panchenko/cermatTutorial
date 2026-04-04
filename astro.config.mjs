import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  adapter: cloudflare(),
  integrations: [react()],
  output: "server",
  image: {
    service: {
      entrypoint: "astro/assets/services/noop"
    }
  }
});
