const paths = require("./paths.js");
const resolveModule = require.resolve;
module.exports = [
  {
    test: /\.(j|t)sx?$/,
    include: paths.appSrc,
    exclude: /node_modules/,
    use: [
      {
        loader: resolveModule("babel-loader"),
        options: {
          babelrc: false,
          presets: [
            [
              resolveModule("@babel/preset-env"),
              {
                targets: { browsers: ["chrome >= 47"] },
                useBuiltIns: "usage",
                corejs: 3,
              },
            ],
            resolveModule("@babel/preset-typescript"),
            resolveModule("@babel/preset-react"),
          ],
          plugins: [
            [
              resolveModule("@babel/plugin-proposal-decorators"),
              { legacy: true },
            ],
            [
              resolveModule("@babel/plugin-proposal-class-properties"),
              { loose: true },
            ],
            [
              resolveModule("@babel/plugin-proposal-private-methods"),
              { loose: true },
            ],
            [
              resolveModule(
                "@babel/plugin-proposal-private-property-in-object"
              ),
              { loose: true },
            ],
            resolveModule("@babel/plugin-syntax-dynamic-import"),
          ],
        },
      },
    ],
  },
];
