import { fileURLToPath } from 'url'
import { defineConfig, splitVendorChunkPlugin } from "vite";
import postcssFlexbugsFixes from "postcss-flexbugs-fixes";
import { createHtmlPlugin } from "vite-plugin-html";
import postcssPresetEnv from "postcss-preset-env";
import { getHashDigest } from "loader-utils";
import legacy from "@vitejs/plugin-legacy";
import { manualChunksPlugin } from "vite-plugin-webpackchunkname";
import react from "@vitejs/plugin-react";
import dayjs from "dayjs";
import path from "path";
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const env = {
  CI_PIPELINE_ID: process.env["CI_PIPELINE_ID"],
  CI_COMMIT_SHA: process.env["CI_COMMIT_SHA"],
  CI_COMMIT_REF_NAME: process.env["CI_COMMIT_REF_NAME"],
};

export default defineConfig(({ command }) => {
  const isPro = command === "build";
  const plugins = [react()];
  let postcssConfig = {};
  let esbuild = {};
  if (isPro) {
    const productionPlugins = [
      splitVendorChunkPlugin(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            buildTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            branch: env["CI_COMMIT_REF_NAME"],
            version: env["CI_PIPELINE_ID"],
            commit: env["CI_COMMIT_SHA"],
          },
        },
      }),
      legacy({
        targets: ["ie >= 11"],
      }),
        manualChunksPlugin(),
    ];
    plugins.push(...productionPlugins);

    postcssConfig = {
      plugins: [
        postcssFlexbugsFixes,
        postcssPresetEnv({
          autoprefixer: {
            flexbox: "no-2009",
          },
          stage: 3,
        }),
      ],
    };
    esbuild = { drop: ["console", "debugger"] };
  }
  return {
    server: {
      port: 32003,
      strictPort: false,
    },
    plugins,
    css: {
      modules: {
        generateScopedName: (classname, filePath) => {
          const baseFilename = path.basename(filePath).split(".")[0];
          const hash = getHashDigest(
            filePath + classname,
            undefined,
            "base62",
            5
          );
          if (baseFilename && hash) {
            return `${baseFilename}_${classname}_${hash}`;
          }
          return classname;
        },
      },
      postcss: postcssConfig,
    },
    resolve: {
      alias: {
        "@pages": path.join(__dirname, "src/pages"),
      },
    },
    esbuild,
  };
});
