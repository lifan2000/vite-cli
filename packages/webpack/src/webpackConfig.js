const path = require("path");
const fs = require("fs");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const nodeLibs = require("node-libs-browser");
const WebpackBar = require("webpackbar");
const dayjs = require("dayjs");
const chalk = require("chalk");
const { merge } = require("webpack-merge");
const loadModule = require("@lfff/lf-cli-utils");
const paths = require("./paths.js");
const jsRules = require("./jsConfig.js");
const cssRules = require("./cssConfig.js");
const fileRules = require("./fileCong.js");
const resolveModule = require.resolve;
module.exports = (params = {}) => {
  const {
    outDir = "build",
    esbuild = "true",
    config: configFileName,
    analyzer = "false",
    dropConsole = "true",
    dropDebugger = "true",
  } = params;

  const isDev = process.env.NODE_ENV === "development";

  const removeConsole = dropConsole === "true";
  const removeDebugger = dropDebugger === "true";
  const drops = [];
  if (removeConsole) {
    drops.push("console");
  }
  if (removeDebugger) {
    drops.push("debugger");
  }
  const overWriteConfigPath = configFileName
    ? paths.resolveApp(configFileName)
    : paths.overWriteFile;
  let _terserPluginOptions = {
    minify:
      esbuild === "true"
        ? TerserPlugin.esbuildMinify
        : TerserPlugin.terserMinify,
    terserOptions:
      esbuild === "false"
        ? {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              comparisons: false,
              inline: 2,
              drop_console: removeConsole,
              drop_debugger: !isDev && removeDebugger,
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
        : { drop: drops },
  };
  const outPutPath = paths.resolveApp(outDir);
  let config = {
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
        new TerserPlugin(_terserPluginOptions),
        new CssMinimizerPlugin(),
      ],
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          oneOf: [...jsRules, ...cssRules(), ...fileRules],
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
        inject: "body",
        buildTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
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
            new ForkTsCheckerWebpackPlugin({
              typescript: {
                typescriptPath: resolveModule("typescript"),
                configOverwrite: {
                  compilerOptions: {
                    sourceMap: true,
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
            }),
          ]),
    ],
    resolve: {
      symlinks: true,
      extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
      alias: {
        "@public": path.join(paths.appPath, "./public"),
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
      const overwriteConfig = loadModule(overWriteConfigPath);
      if (overwriteConfig) {
        config = merge(config, overwriteConfig);
      }
    } catch (error) {
      console.log(chalk.bold.red("merger webpack config failed!"));
      console.log(error);
    }
  }

  if (!isDev && analyzer === "true") {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
};
