import react from "@vitejs/plugin-react";
import postCssPresetEnv from "postcss-preset-env"

/**
 * @type {import('vite').UserConfig}
 */
const config = {
  plugins: [
    react(),
    postCssPresetEnv({
      stage: 3,
    }),
  ],
};

export default config;
