import path from "node:path";
import fs from "node:fs";
export const moduleFileExtensions = [
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
export const resolveApp = (relativePath) =>
  path.resolve(appDirectory, relativePath);
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
  appPath: resolveApp("."),
  publicUrlOrPath: "/",
  appIndexJs: resolveModule(resolveApp, "src/index"),
  appPublic: resolveApp("public"),
  appHtml: resolveApp("public/index.html"),
  appNodeModules: resolveApp("node_modules"),
  appTsConfig: resolveApp("tsconfig.json"),
  appJsConfig: resolveApp("jsconfig.json"),
  appWebpackCache: resolveApp("node_modules/.cache"),
  appTsBuildInfoFile: resolveApp("node_modules/.cache/tsconfig.tsbuildinfo"),
  overWriteFile: resolveApp("lf.config.ts"),
};
