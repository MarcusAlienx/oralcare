import { defineConfig } from "orval";
import path from "path";

const root = path.resolve(__dirname, "..", "..");
const apiClientReactSrc = path.resolve(root, "lib", "api-client-react", "src");
const apiZodSrc = path.resolve(root, "lib", "api-zod", "src");

export default defineConfig({
  "api-client-react": {
    input: path.resolve(__dirname, "openapi.yaml"),
    output: {
      workspace: apiClientReactSrc,
      target: "generated/api.ts",
      client: "react-query",
      mode: "split",
      baseUrl: "/api",
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: path.resolve(apiClientReactSrc, "custom-fetch.ts"),
          name: "customFetch",
        },
      },
    },
  },
  zod: {
    input: path.resolve(__dirname, "openapi.yaml"),
    output: {
      workspace: apiZodSrc,
      target: "generated/api.ts",
      client: "zod",
      mode: "split",
      clean: true,
    },
  },
});
