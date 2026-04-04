import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  adapter: cloudflare({
    imageService: "passthrough"
  }),
  integrations: [react()],
  output: "server"
});
