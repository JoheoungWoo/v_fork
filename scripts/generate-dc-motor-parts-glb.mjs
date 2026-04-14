/**
 * Generate independent GLB parts for DC motor.
 * Run: cd frontend && node scripts/generate-dc-motor-parts-glb.mjs
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
const outDir = path.join(__dirname, "..", "public", "models");

async function exportScene(scene, filename) {
  const exporter = new GLTFExporter();
  const buffer = await exporter.parseAsync(scene, { binary: true });
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, Buffer.from(buffer));
  console.log("Wrote", outPath, `(${buffer.byteLength} bytes)`);
}

function buildCoilScene() {
  const scene = new THREE.Scene();
  const matCu = new THREE.MeshStandardMaterial({
    color: "#f2b567",
    metalness: 0.78,
    roughness: 0.18,
    emissive: "#6a3d12",
    emissiveIntensity: 0.45,
  });
  const matShaft = new THREE.MeshStandardMaterial({ color: "#a7a7a7", metalness: 0.95, roughness: 0.2 });
  const root = new THREE.Group();
  root.name = "Motor_Coil_Root";

  // Make a clearly visible rectangular coil frame in YZ plane.
  const outerY = 1.35;
  const outerZ = 1.05;
  const bar = 0.12;
  const frameDepth = 0.12;

  const top = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, outerY, bar), matCu);
  top.position.set(0, 0, outerZ / 2);
  root.add(top);

  const bottom = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, outerY, bar), matCu);
  bottom.position.set(0, 0, -outerZ / 2);
  root.add(bottom);

  const left = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, bar, outerZ), matCu);
  left.position.set(0, -outerY / 2, 0);
  root.add(left);

  const right = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, bar, outerZ), matCu);
  right.position.set(0, outerY / 2, 0);
  root.add(right);

  // Center shaft to make the motor axis explicit.
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.1, 20), matShaft);
  shaft.rotation.x = Math.PI / 2;
  root.add(shaft);

  scene.add(root);
  return scene;
}

function buildMagnetScene(name, color) {
  const scene = new THREE.Scene();
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.15, roughness: 0.45 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1.9, 1.9), mat);
  mesh.name = name;
  scene.add(mesh);
  return scene;
}

async function main() {
  await exportScene(buildCoilScene(), "dc_coil_only.glb");
  await exportScene(buildMagnetScene("Magnet_North", "#d95a62"), "dc_magnet_n.glb");
  await exportScene(buildMagnetScene("Magnet_South", "#5a8ce8"), "dc_magnet_s.glb");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
