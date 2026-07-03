import { copyFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dest = resolve(__dirname, "../public/vad");

mkdirSync(dest, { recursive: true });

function resolvePackageDir(pkg) {
  try {
    return dirname(require.resolve(`${pkg}/package.json`));
  } catch {
    return null;
  }
}

const vadBase = resolvePackageDir("@ricky0123/vad-web");
const ortBase = resolvePackageDir("onnxruntime-web");

if (!vadBase || !ortBase) {
  console.log("VAD packages not found — skipping copy-vad-assets");
  process.exit(0);
}

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
    if (existsSync(src)) {
      copyFileSync(src, resolve(dest, name));
      console.log(`✓ ${name}`);
    } else {
      console.warn(`⚠ skip ${name} (not found)`);
    }
  } catch (e) {
    console.warn(`⚠ skip ${name}: ${e.message}`);
  }
}
