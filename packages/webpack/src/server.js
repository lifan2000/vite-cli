import WebpackDevServer from "webpack-dev-server";
import configFactory from "./webpackConfig.js";
process.env.NODE_ENV = "development";
// const webpackConfig = configFactory("dev");
// const compiler = webpack(webpackConfig);

export function createServer(params) {
  const webpackConfig = configFactory(params);
  console.log(222);
  //   const { host = "127.0.0.1", port = "30003" } = params;
  //   const devServer = new WebpackDevServer(
  //     {
  //       client: {
  //         overlay: false,
  //         progress: true,
  //         logging: "none",
  //       },
  //       compress: true,
  //       hot: true,
  //       historyApiFallback: true,
  //       host,
  //       port,
  //       open: true,
  //     },
  //     compiler
  //   );
  //   devServer.startCallback((err) => {
  //     if (err) {
  //       return console.log(chalk.bold.red("devServer failed:"), "\n" + err);
  //     }
  //   });
}
