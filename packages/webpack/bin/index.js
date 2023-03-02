#!/usr/bin/env node
function start() {
  return import(`../src/index.js`);
}
const inspector = await import("node:inspector").then((r) => r.default);
const session = new inspector.Session();
session.connect();
session.post("Profiler.enable", () => {
  session.post("Profiler.start", start);
});

