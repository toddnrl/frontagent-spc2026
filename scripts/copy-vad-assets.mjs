import { copyFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dest = resolve(__dirname, "../public/vad");

mkdirSync(dest, { recursive: true });

const vadBase = dirname(require.resolve("@ricky0123/vad-web/package.json"));
const ortBase = dirname(require.resolve("onnxruntime-web/package.json"));

const files = [
  [resolve(vadBase, "dist/silero_vad_v5.onnx"), "silero_vad_v5.onnx"],
  [resolve(vadBase, "dist/silero_vad_legacy.onnx"), "silero_vad_legacy.onnx"],
  [resolve(vadBase, "dist/vad.worklet.bundle.min.js"), "vad.worklet.bundle.min.js"],
  [resolve(ortBase, "dist/ort-wasm-simd-threaded.wasm"), "ort-wasm-simd-threaded.wasm"],
  [resolve(ortBase, "dist/ort-wasm-simd-threaded.mjs"), "ort-wasm-simd-threaded.mjs"],
  [resolve(ortBase, "dist/ort-wasm-simd-threaded.asyncify.wasm"), "ort-wasm-simd-threaded.asyncify.wasm"],
  [resolve(ortBase, "dist/ort-wasm-simd-threaded.asyncify.mjs"), "ort-wasm-simd-threaded.asyncify.mjs"],
  [resolve(ortBase, "dist/ort-wasm-simd-threaded.jsep.wasm"), "ort-wasm-simd-threaded.jsep.wasm"],
];

for (const [src, name] of files) {
  try {
    copyFileSync(src, resolve(dest, name));
    console.log(`✓ ${name}`);
  } catch {
    console.warn(`⚠ skip ${name} (not found)`);
  }
}
