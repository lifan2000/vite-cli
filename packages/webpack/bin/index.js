#!/usr/bin/env node
import { getCliEnv, chalk } from "@lf/utils";
chalk.bold.red(`未知的script`);
const args = getCliEnv();
const scripts = ["build", "dev"];

const scriptList = Object.keys(args).filter((key) => {
  return args[key] === true && scripts.includes(key);
});

let script = scriptList[0];

if (script) {
  function start() {
    return import(`../scripts/${script}.js`);
  }
  const inspector = await import("node:inspector").then((r) => r.default);
  const session = new inspector.Session();
  session.connect();
  session.post("Profiler.enable", () => {
    session.post("Profiler.start", start);
  });
} else {
  console.log(chalk.red(`未知的script!`));
  console.log(chalk.green(`可使用的的script: [${scripts}]。`));
}
