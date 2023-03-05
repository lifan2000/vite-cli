import path from "node:path";
import loaderUtils from "loader-utils";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import sass from "sass";
import paths from "./paths";

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
  // let _loader = "style-loader";
  // if (isDev) {
  //   _loader = {
  //     loader: MiniCssExtractPlugin.loader,
  //   };
  // }
  const loaders = [
    "style-loader",
    {
      loader: "css-loader",
      options: cssOptions,
    },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          ident: "postcss",
          plugins: [
            "postcss-flexbugs-fixes",
            [
              "postcss-preset-env",
              {
                autoprefixer: {
                  flexbox: "no-2009",
                },
                stage: 3,
              },
            ],
            "postcss-normalize",
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
