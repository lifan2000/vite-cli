import path from "node:path";
import loaderUtils from "loader-utils";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import sass from "sass";
import { resolveModule } from "@lf/utils";
import paths from "./paths.js";

const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassGlobalRegex = /\.global\.(scss|sass)$/;

const getCSSModuleLocalIdent = (context, _, localName, options) => {
  const fileNameOrFolder = context.resourcePath.match(
    /index\.module\.(css|scss|sass)$/
  )
    ? "[folder]"
    : "[name]";
  const hash = loaderUtils.getHashDigest(
    path.posix.relative(context.rootContext, context.resourcePath) + localName,
    "md5",
    "base64",
    5
  );
  const className = loaderUtils.interpolateName(
    context,
    fileNameOrFolder + "_" + localName + "__" + hash,
    options
  );
  return className.replace(".module_", "_").replace(/\./g, "_");
};

const getCssLoaders = (cssOptions) => {
  const isDev = process.env.NODE_ENV === "development";
  const loaders = [
    !isDev
      ? {
          loader: MiniCssExtractPlugin.loader, //生成单独的css 文件,webpack的plugins也有MiniCssExtractPlugin,目前不知道起作用的条件
          options: paths.publicUrlOrPath.startsWith(".")
            ? { publicPath: "../../" }
            : {},
        }
      : resolveModule("style-loader"), // 将 JS 字符串生成为 style 节点
    {
      // 将 CSS 转化成 CommonJS 模块
      loader: resolveModule("css-loader"),
      options: cssOptions,
    },
    {
      loader: resolveModule("postcss-loader"),
      options: {
        postcssOptions: {
          ident: "postcss",
          plugins: [
            resolveModule("postcss-flexbugs-fixes"), //修复flex的bug
            [
              "postcss-preset-env", //css 语法降级, 与样式前缀，
              {
                autoprefixer: {
                  flexbox: "no-2009",
                },
              },
            ],
            "postcss-normalize", //要在项目里 @import "normalize.css @import "sanitize.css";才有用
          ],
        },
        sourceMap: true,
      },
    },
  ];
  return loaders;
};

const scssLoaders = [
  {
    loader: resolveModule("resolve-url-loader"),
    options: {
      sourceMap: true,
      root: paths.appSrc,
    },
  },
  {
    // 将 Sass 编译成 CSS
    loader: resolveModule("sass-loader"),
    options: {
      sourceMap: true,
      implementation: sass,
    },
  },
];

export default [
  {
    test: cssRegex,
    use: getCssLoaders({
      importLoaders: 1, //在 css-loader 之前有多少 loader
      sourceMap: true,
      modules: {
        mode: "icss", //css 不开启 css module
      },
    }),
    sideEffects: true, //tree shaking
  },
  {
    test: sassRegex,
    exclude: /node_modules|\.global\.(scss|sass)$/,
    use: [
      ...getCssLoaders({
        importLoaders: 3,
        sourceMap: true,
        modules: {
          mode: "local",
          getLocalIdent: getCSSModuleLocalIdent,
        },
      }),
      ...scssLoaders,
    ],
  },
  {
    test: sassGlobalRegex,
    use: [
      ...getCssLoaders({
        importLoaders: 3,
        sourceMap: true,
        modules: {
          mode: "icss",
        },
      }),
      ...scssLoaders,
    ],
    sideEffects: true,
  },
];
