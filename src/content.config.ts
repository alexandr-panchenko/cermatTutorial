import { defineCollection, z } from "astro:content";

const tutorials = defineCollection({
  type: "data",
  schema: z.any()
});

export const collections = {
  tutorials
};
