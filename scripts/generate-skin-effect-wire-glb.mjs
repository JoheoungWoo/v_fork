/**
 * Fallback GLB if Blender is unavailable: Skin_Copper + Skin_Insulation.
 * Run: cd frontend && node scripts/generate-skin-effect-wire-glb.mjs
 */
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    result = null;
    onloadend = null;
    readAsArrayBuffer(blob) {
      Promise.resolve()
        .then(() => blob.arrayBuffer())
        .then((buf) => {
          this.result = buf;
          this.onloadend?.();
        });
    }
  };
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copperMat() {
  return new THREE.MeshStandardMaterial({
    color: "#b87333",
    metalness: 1,
    roughness: 0.32,
  });
}

function glassMat() {
  return new THREE.MeshPhysicalMaterial({
    color: "#c5d4e0",
    metalness: 0,
    roughness: 0.08,
    transmission: 0.88,
    thickness: 0.35,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
}

async function main() {
  const scene = new THREE.Scene();

  const cu = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 2, 64),
    copperMat(),
  );
  cu.name = "Skin_Copper";
  cu.rotation.x = Math.PI / 2;
  scene.add(cu);

  const jacket = new THREE.Mesh(
    new THREE.CylinderGeometry(1.14, 1.14, 2.18, 48),
    glassMat(),
  );
  jacket.name = "Skin_Insulation";
  jacket.rotation.x = Math.PI / 2;
  scene.add(jacket);

  const exporter = new GLTFExporter();
  const buffer = await exporter.parseAsync(scene, { binary: true });
  const outDir = path.join(__dirname, "..", "public", "models");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "skin_effect_wire.glb");
  fs.writeFileSync(outPath, Buffer.from(buffer));
  console.log("Wrote", outPath, `(${buffer.byteLength} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
