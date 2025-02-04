import path from "path";

import react from "@vitejs/plugin-react";
import postCssPresetEnv from "postcss-preset-env"

/**
 * @type {import('vite').UserConfig}
 */
const config = {
  envDir: "../../",
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  },
  plugins: [
    react(),
    postCssPresetEnv({
      stage: 3,
    }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
};

export default config;
