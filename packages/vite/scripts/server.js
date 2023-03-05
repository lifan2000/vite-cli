import WebpackDevServer from "webpack-dev-server";
import chalk from "@lf/utils";
import configFactory from "./webpackConfig";
// const webpackConfig = configFactory("dev");
// const compiler = webpack(webpackConfig);

export function createServer(params) {
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
