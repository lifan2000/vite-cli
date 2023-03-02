//静态文件loader
const imageInlineSizeLimit = 10000;
export default [
  {
    test: [/\.avif$/],
    type: "asset",
    mimetype: "image/avif",
    parser: {
      dataUrlCondition: {
        maxSize: imageInlineSizeLimit,
      },
    },
  },
  {
    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
    type: "asset",
    parser: {
      dataUrlCondition: {
        maxSize: imageInlineSizeLimit,
      },
    },
  },
  {
    test: /\.svg$/,
    use: [
      {
        loader: "@svgr/webpack",
        options: {
          prettier: false,
          svgo: false,
          svgoConfig: {
            plugins: [{ removeViewBox: false }],
          },
          titleProp: true,
          ref: true,
        },
      },
      {
        loader: "file-loader",
        options: {
          name: "static/media/[name].[hash].[ext]",
        },
      },
    ],
    issuer: {
      and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
    },
  },
  {
    exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
    type: "asset/resource",
  },
];
