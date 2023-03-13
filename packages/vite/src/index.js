import { cac } from "cac";
import chalk from "chalk";
const cli = cac("lfCli");

cli
  .command("dev", "start dev server")
  .option("--host [host]", `[string] specify hostname`)
  .option("--port <port>", `[number] specify port`)
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
  .option("--outDir <dir>", `[string] output directory (default: dist)`)
  .action((options) => {
    try {
      console.log("options", options);
    } catch (error) {
      process.exit(1);
    }
  });

cli.help();
cli.parse();
