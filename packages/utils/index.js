export { default as chalk } from "chalk";

export function getCliEnv() {
  const userEnv = {};
  const argv = process.argv;
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.includes("=")) {
      const args = arg.split("=");
      userEnv[args[0]] = args[1];
      continue;
    }
    userEnv[arg] = true;
  }
  return userEnv;
}
