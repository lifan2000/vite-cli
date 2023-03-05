import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import fs from "node:fs";
import chalk from "@lf/utils";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import FriendlyErrorsWebpackPlugin from "friendly-errors-webpack-plugin";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";
import TerserPlugin from "terser-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import WebpackBar from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import paths, { resolveApp, moduleFileExtensions } from "./paths.js";
import jsRules from "./jsConfig.js";
import cssRules from "./cssConfig.js";
import fileRules from "./fileCong.js";

const isDev = process.env.NODE_ENV === "development";
const __filename = fileURLToPath(import.meta.url);
const nodeModulesRequire = createRequire(paths.appNodeModules);

export default (params = {}) => {
  const { outDir = "build", esBuild = true, configFile } = params;

  const overWriteConfigPath = configFile
    ? resolveApp(configFile)
    : paths.overWriteFile;

  let terserPluginOptions = {
    minify: esBuild
      ? terserPluginOptions.esbuildMinify
      : terserPluginOptions.terserMinify,
    terserOptions: !esBuild
      ? {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        }
      : {},
  };

  const outPutPath = resolveApp(outDir);
  const config = {
    target: ["browserslist"],
    mode: process.env.NODE_ENV || "development",
    bail: !isDev, //出错时中止打包，开发时在终端显示错误信息
    ...(isDev ? { devtool: "cheap-module-source-map" } : {}),
    entry: paths.appIndexJs,
    output: {
      clean: true,
      path: outPutPath,
      filename: !isDev
        ? `static/js/[name].[contenthash:8].js`
        : "static/js/bundle.js",
      chunkFilename: !isDev
        ? `static/js/[name].[contenthash:8].chunk.js`
        : "static/js/[name].chunk.js",
      assetModuleFilename: "static/media/[name].[contenthash:8][ext]",
      publicPath: paths.publicUrlOrPath,
      pathinfo: false,
    },
    cache: {
      type: "filesystem",
      cacheDirectory: paths.appWebpackCache,
      store: "pack",
      buildDependencies: {
        config: [__filename],
        tsconfig: [paths.appTsConfig, paths.appJsConfig].filter((f) =>
          fs.existsSync(f)
        ),
      },
    },
    optimization: {
      minimize: !isDev,
      minimizer: [
        new TerserPlugin(terserPluginOptions),
        new CssMinimizerPlugin(),
      ],
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          oneOf: [...jsRules, ...cssRules, ...fileRules],
        },
      ],
    },
    plugins: [
      new FriendlyErrorsWebpackPlugin(),
      new WebpackBar(),
      new WebpackManifestPlugin({
        fileName: "asset-manifest.json",
        publicPath: paths.publicUrlOrPath,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: paths.appPublic,
            to: outPutPath,
            globOptions: {
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        template: paths.appHtml,
        minify: {
          removeComments: false,
        },
      }),
      ...(!isDev
        ? [
            //css文件提取
            new MiniCssExtractPlugin({
              filename: "static/css/[name].[contenthash:8].css",
              chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
            }),
          ]
        : [
            //ts类型检查,待商榷:生产模式不打开?
            new ForkTsCheckerWebpackPlugin({
              async: isDev,
              typescript: {
                typescriptPath: nodeModulesRequire("typescript"),
                configOverwrite: {
                  compilerOptions: {
                    sourceMap: true,
                    skipLibCheck: true,
                    inlineSourceMap: false,
                    declarationMap: false,
                    noEmit: true,
                    incremental: true,
                    tsBuildInfoFile: paths.appTsBuildInfoFile,
                  },
                },
                context: paths.appPath,
                diagnosticOptions: {
                  syntactic: true,
                },
                mode: "write-references",
              },
              issue: {
                include: [
                  { file: "../**/src/**/*.{ts,tsx}" },
                  { file: "**/src/**/*.{ts,tsx}" },
                ],
                exclude: [
                  { file: "**/src/**/__tests__/**" },
                  { file: "**/src/**/?(*.){spec|test}.*" },
                  { file: "**/src/setupProxy.*" },
                  { file: "**/src/setupTests.*" },
                  { file: "**/node_modules/**/*" },
                ],
              },
              logger: {
                infrastructure: "silent",
              },
            }),
          ]),
    ],
    resolve: {
      symlinks: true,
      extensions: moduleFileExtensions.map((ext) => `.${ext}`),
      alias: {
        "@public": path.join(paths.appPath, "./public"),
        "@pages": path.join(paths.appPath, "./src/pages"),
      },
      fallback: {
        ...Object.keys(nodeLibs).reduce((memo, key) => {
          if (nodeLibs[key]) {
            memo[key] = nodeLibs[key];
          } else {
            memo[key] = false;
          }
          return memo;
        }, {}),
      },
    },
  };

  if (fs.existsSync(overWriteConfigPath)) {
    
    try {
    } catch (error) {
      console.log(chalk.bold.red("merger webpack config failed!"));
      console.log(error);
    }
  }

  return config;
};
