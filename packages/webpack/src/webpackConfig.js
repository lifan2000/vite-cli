import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import FriendlyErrorsWebpackPlugin from "friendly-errors-webpack-plugin";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";
import TerserPlugin from "terser-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import WebpackBar from "webpack";
import { resolveApp } from "./paths.js";
import jsRules from "./jsConfig.js";
import cssRules from "./cssConfig.js";
import fileRules from "./fileCong.js";

const isDev = process.env.NODE_ENV === "development";

export default (params = {}) => {
  const { outDir = "build", esBuild = true } = params;
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

  return {
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
        defaultWebpack: ["webpack/lib/"],
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
    ],
  };
};
