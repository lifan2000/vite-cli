import paths from "./paths";
export default [
  {
    test: /\.(j|t)sx?$/,
    include: paths.appSrc,
    exclude: /node_modules/,
    use: [
      {
        loader: require.resolve("babel-loader"),
        options: {
          babelrc: false,
          presets: [
            [
              "@babel/preset-env",
              {
                targets: { browsers: ["chrome >= 47"] },
                useBuiltIns: "usage",
                corejs: 3,
              },
            ],
            "@babel/preset-typescript",
            "@babel/preset-react",
          ],
          plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
            ["@babel/plugin-proposal-private-methods", { loose: true }],
            [
              "@babel/plugin-proposal-private-property-in-object",
              { loose: true },
            ],
            "@babel/plugin-syntax-dynamic-import",
          ],
        },
      },
    ],
  },
];
