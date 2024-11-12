const react = require("@vitejs/plugin-react");
const postCssPresetEnv = require("postcss-preset-env");

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

module.exports = config;
