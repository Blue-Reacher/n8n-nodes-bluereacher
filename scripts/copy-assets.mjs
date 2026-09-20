// tsc compiles .ts only; node icons ship next to the compiled node file.
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist/nodes/BlueReacher", { recursive: true });
copyFileSync(
  "nodes/BlueReacher/bluereacher.svg",
  "dist/nodes/BlueReacher/bluereacher.svg"
);
console.log("copied node icon");
