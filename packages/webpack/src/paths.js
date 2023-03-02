import path from "node:path";
import fs from "node:fs";
const moduleFileExtensions = [
  "web.mjs",
  "mjs",
  "web.js",
  "js",
  "web.ts",
  "ts",
  "web.tsx",
  "tsx",
  "json",
  "web.jsx",
  "jsx",
];
const appDirectory = fs.realpathSync(process.cwd());
export const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );
  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }
  return resolveFn(`${filePath}.js`);
};
export default {
  appSrc: resolveApp("src"),
  publicUrlOrPath: "/",
  appIndexJs: resolveModule(resolveApp, "src/index"),
};
