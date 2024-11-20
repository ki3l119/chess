import react from "@vitejs/plugin-react";
import postCssPresetEnv from "postcss-preset-env"

/**
 * @type {import('vite').UserConfig}
 */
const config = {
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
};

export default config;
