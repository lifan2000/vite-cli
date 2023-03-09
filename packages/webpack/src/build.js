import webpack from "webpack";
import chalk from "chalk";
import configFactory from "./webpackConfig.js";
process.env.NODE_ENV = "production";

export function build(params) {
  const webpackConfig = configFactory(params);
  const compiler = webpack(webpackConfig);
  console.log(chalk.bold.green("lfWebpack build start..."));
  compiler.run((err) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }
  });
}
