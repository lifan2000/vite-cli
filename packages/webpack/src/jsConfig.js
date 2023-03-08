import { resolveModule } from "@lf/utils";
import paths from "./paths.js";
export default [
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
