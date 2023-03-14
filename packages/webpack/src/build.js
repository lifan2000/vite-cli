const webpack = require("webpack");
const chalk = require("chalk");
const configFactory = require("./webpackConfig.js");

process.env.NODE_ENV = "production";

exports.build = function build(params) {
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
};
