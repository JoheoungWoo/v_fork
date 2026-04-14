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

function addEdgeCylinder(group, p0, p1, radius, mat) {
  const v0 = new THREE.Vector3(...p0);
  const v1 = new THREE.Vector3(...p1);
  const d = new THREE.Vector3().subVectors(v1, v0);
  const len = Math.max(d.length(), 1e-6);
  const mid = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);
  const g = new THREE.CylinderGeometry(radius, radius, len, 20);
  const m = new THREE.Mesh(g, mat);
  m.position.copy(mid);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d.clone().normalize());
  group.add(m);
}

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
  const matCu = new THREE.MeshStandardMaterial({ color: "#8c8980", metalness: 0.65, roughness: 0.35 });
  const root = new THREE.Group();
  root.name = "Motor_Coil_Root";
  const wy = 0.52;
  const wz = 0.36;
  const corners = [
    [0, -wy / 2, -wz / 2],
    [0, wy / 2, -wz / 2],
    [0, wy / 2, wz / 2],
    [0, -wy / 2, wz / 2],
  ];
  for (let i = 0; i < 4; i += 1) {
    addEdgeCylinder(root, corners[i], corners[(i + 1) % 4], 0.028, matCu);
  }
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
