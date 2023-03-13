import { defineConfig, splitVendorChunkPlugin } from "vite";
import loadCssModulePlugin from "vite-plugin-load-css-module/dist/index.mjs";
import postcssFlexbugsFixes from "postcss-flexbugs-fixes";
import { createHtmlPlugin } from "vite-plugin-html";
import postcssPresetEnv from "postcss-preset-env";
import viteImagemin from "vite-plugin-imagemin";
import { getHashDigest } from "loader-utils";
import legacy from "@vitejs/plugin-legacy";
import { manualChunksPlugin } from "vite-plugin-webpackchunkname";
import react from "@vitejs/plugin-react";
import dayjs from "dayjs";
import path from "path";
const cssRegex = /\.(sa|sc)ss(\?used)?$/;
const env = {
  CI_PIPELINE_ID: process.env["CI_PIPELINE_ID"],
  CI_COMMIT_SHA: process.env["CI_COMMIT_SHA"],
  CI_COMMIT_REF_NAME: process.env["CI_COMMIT_REF_NAME"],
};

const paths = {
  src: path.join(__dirname, "src"),
  pages: path.join(__dirname, "src/pages"),
  common: path.join(__dirname, "src/common"),
  assets: path.join(__dirname, "src/assets"),
  app: path.join(__dirname, "src/app"),
  theme: path.join(__dirname, "src/theme"),
  components: path.join(__dirname, "src/common/components"),
  images: path.join(__dirname, "/images"),
  proto: path.join(__dirname, "src/types/proto.d.ts"),
};

export default defineConfig(({ command }) => {
  const isPro = command === "build";
  const plugins = [
    react(),
    loadCssModulePlugin({
      include: (id) =>
        cssRegex.test(id) &&
        !id.includes("node_modules") &&
        !id.includes("global"),
    }),
  ];
  let postcssConfig = {};
  let esbuild = {};
  if (isPro) {
    const productionPlugins = [
      splitVendorChunkPlugin(),
      viteImagemin({
        // 无损压缩配置，无损压缩下图片质量不会变差
        optipng: {
          optimizationLevel: 7,
        },
        // 有损压缩配置，有损压缩下图片质量可能会变差
        pngquant: {
          quality: [0.8, 0.9],
        },
        // svg 优化
        svgo: {
          plugins: [
            {
              name: "removeViewBox",
            },
            {
              name: "removeEmptyAttrs",
              active: false,
            },
          ],
        },
      }),
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
      //   manualChunksPlugin(),
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
        "@pages": paths.pages,
        "@common": paths.common,
        "@assets": paths.assets,
        "@app": paths.app,
        "@theme": paths.theme,
        "@images": paths.images,
        "@components": paths.components,
        "@proto": paths.proto,
      },
    },
    esbuild,
  };
});
