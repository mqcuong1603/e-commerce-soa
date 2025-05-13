import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginNode from "eslint-plugin-node";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js, node: pluginNode },
    extends: ["js/recommended", "plugin:node/recommended"],
    rules: {
      "node/exports-style": ["error", "module.exports"],
      "node/file-extension-in-import": ["error", "always"],
      "node/prefer-global/buffer": ["error", "always"],
      "node/prefer-global/console": ["error", "always"],
      "node/prefer-global/process": ["error", "always"],
      "node/prefer-global/url-search-params": ["error", "always"],
      "node/prefer-global/url": ["error", "always"],
      "node/prefer-promises/dns": "error",
      "node/prefer-promises/fs": "error",
    },
  },
  pluginReact.configs.flat.recommended,
]);
