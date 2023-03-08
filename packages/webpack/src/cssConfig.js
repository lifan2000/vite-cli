import path from "node:path";
import loaderUtils from "loader-utils";
import sass from "sass";
import postcssPresetEnv from "postcss-preset-env"
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
  const loaders = [
    resolveModule("style-loader"),
    {
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
              "postcss-preset-env",//css 语法降级, 与样式前缀，
              {
                autoprefixer: {
                  flexbox: "no-2009",
                },
                stage: 3,//根据browserslist的浏览器版本确定 是否降级语法
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
    loader: "resolve-url-loader",
    options: {
      sourceMap: true,
      root: paths.appSrc,
    },
  },
  {
    loader: "sass-loader",
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
        mode: "icss",
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
