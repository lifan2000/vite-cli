import { cac } from "cac";

const cli = cac("lfCli");

cli
  .command("dev", "start dev server")
  .option("--host [host]", `[string] specify hostname`)
  .option("--port <port>", `[number] specify port`)
  .option("--config <string>", "Custom webpack configuration filename")
  .option("--analyzer <boolean>", "Performance analysis of production environment")
  .action(async (options) => {
    try {
      const { createServer } = await import("./server.js");
      createServer(options);
    } catch (error) {
      console.log("ssssssssss", error);
      process.exit(1);
    }
  });

cli
  .command("build", "build for production")
  .option("--outDir <dir>", `[string] output directory (default: build)`)
  .action((options) => {
    try {
      console.log("options", options);
    } catch (error) {
      process.exit(1);
    }
  });

cli.help();
cli.parse();
