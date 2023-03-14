const WebpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");
const configFactory = require("./webpackConfig.js");
process.env.NODE_ENV = "development";

function createServer(params) {
  const webpackConfig = configFactory(params);
  const compiler = webpack(webpackConfig);
  const { host = "127.0.0.1", port = "30003" } = params;
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
      host,
      port,
      open: true,
    },
    compiler
  );
  devServer.startCallback((err) => {
    if (err) {
      return console.log(chalk.bold.red("devServer failed:"), "\n" + err);
    }
  });
}

module.exports.createServer = createServer;
