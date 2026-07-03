import { copyFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dest = resolve(root, "public/vad");

mkdirSync(dest, { recursive: true });

// pnpm symlink 경로와 직접 경로 모두 시도
const vadCandidates = [
  resolve(root, "node_modules/@ricky0123/vad-web/dist"),
  resolve(root, "node_modules/.pnpm/@ricky0123+vad-web@0.0.30/node_modules/@ricky0123/vad-web/dist"),
];
const ortCandidates = [
  resolve(root, "node_modules/onnxruntime-web/dist"),
  resolve(root, "node_modules/.pnpm/onnxruntime-web@1.27.0/node_modules/onnxruntime-web/dist"),
];

const vadBase = vadCandidates.find((p) => existsSync(p));
const ortBase = ortCandidates.find((p) => existsSync(p));

if (!vadBase || !ortBase) {
  console.log("VAD packages not found — skipping copy-vad-assets");
  process.exit(0);
}

const files = [
  [resolve(vadBase, "silero_vad_v5.onnx"), "silero_vad_v5.onnx"],
  [resolve(vadBase, "silero_vad_legacy.onnx"), "silero_vad_legacy.onnx"],
  [resolve(vadBase, "vad.worklet.bundle.min.js"), "vad.worklet.bundle.min.js"],
  [resolve(ortBase, "ort-wasm-simd-threaded.wasm"), "ort-wasm-simd-threaded.wasm"],
  [resolve(ortBase, "ort-wasm-simd-threaded.mjs"), "ort-wasm-simd-threaded.mjs"],
  [resolve(ortBase, "ort-wasm-simd-threaded.asyncify.wasm"), "ort-wasm-simd-threaded.asyncify.wasm"],
  [resolve(ortBase, "ort-wasm-simd-threaded.asyncify.mjs"), "ort-wasm-simd-threaded.asyncify.mjs"],
  [resolve(ortBase, "ort-wasm-simd-threaded.jsep.wasm"), "ort-wasm-simd-threaded.jsep.wasm"],
];

for (const [src, name] of files) {
  try {
    if (existsSync(src)) {
      copyFileSync(src, resolve(dest, name));
      console.log(`✓ ${name}`);
    } else {
      console.warn(`⚠ skip ${name} (not found at ${src})`);
    }
  } catch (e) {
    console.warn(`⚠ skip ${name}: ${e.message}`);
  }
}
