import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
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

  return {
    target: ["browserslist"],
    mode: process.env.NODE_ENV || "development",
    bail: !isDev, //出错时中止打包，开发时在终端显示错误信息
    ...(isDev ? { devtool: "cheap-module-source-map" } : {}),
    entry: paths.appIndexJs,
    output: {
      clean: true,
      path: resolveApp(outDir),
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
  };
};
