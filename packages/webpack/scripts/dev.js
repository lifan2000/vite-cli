import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
const configFactory = function () {};
const webpackConfig = configFactory("development");
const compiler = webpack(webpackConfig);
const devServer = new WebpackDevServer(
  {
    client: {
      overlay: false,
      progress: true,
      logging: "none",
    },
    compress: true,
    hot: true,
    historyApiFallback: true,
    host: HOST,
    port: PORT,
  },
  compiler
);
