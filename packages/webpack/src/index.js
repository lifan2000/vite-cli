const { cac } = require("cac");
const chalk = require("chalk");
const cli = cac("lfCli");

cli
  .command("dev", "start dev server")
  .option("--host [host]", `[string] specify hostname`)
  .option("--port <port>", `[number] specify port`)
  .option("--config <string>", "Custom webpack configuration filename")
  .action(async (options) => {
    try {
      const { createServer } = await import("./server.js");
      createServer(options);
    } catch (error) {
      console.log(chalk.bold.red("start server err!"));
      console.log(error);
      process.exit(1);
    }
  });

cli
  .command("build", "build for production")
  .option("--outDir <dir>", `[string] output directory (default: build)`)
  .option("--analyzer <boolean>", `bundle analyzer`)
  .option("--dropConsole <boolean>", `remove console`)
  .option("--dropDebugger <boolean>", `remove console`)
  .option("--esbuild <boolean>", `esbuild minify`)

  .action(async (options) => {
    console.log("options", options);
    try {
      const { build } = await import("./build.js");
      build(options);
    } catch (error) {
      console.log(chalk.bold.red("build err!"));
      console.log(error);
      process.exit(1);
    }
  });

cli.help();
cli.parse();
