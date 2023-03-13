import Module from "node:module";
import path from "node:path";

const createRequire =
  Module.createRequire ||
  Module.createRequireFromPath ||
  function (filename) {
    const mod = new Module(filename, null);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));

    mod._compile(`module.exports = require;`, filename);

    return mod.exports;
  };

export function loadModule(request, context = process.cwd()) {
  try {
    return createRequire(context)(request);
  } catch (e) {
    console.log("loadModule failed!", request);
  }
}

export function resolveModule(path, context = import.meta.url) {
  const require = createRequire(context);
  return require.resolve(path);
}
