export function getUserCliEnv() {
  const argv = process.argv;
  const DefaultArgs = ["build", "dev", "--port"];
  const userEnv = {
    build: false,
    dev: false,
    "--port": "30003",
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.includes("=")) {
      const args = arg.split("=");
      if (DefaultArgs.includes(args[0])) {
        userEnv[args[0]] = args[1];
      }
      continue;
    }
    userEnv[arg] = true;
  }
  return userEnv;
}
