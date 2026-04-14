/**
 * Fallback GLB if Blender is unavailable.
 * Run: cd frontend && node scripts/generate-dc-coil-motor-glb.mjs
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

function addEdgeCylinder(group, p0, p1, radius, mat) {
  const v0 = new THREE.Vector3(...p0);
  const v1 = new THREE.Vector3(...p1);
  const d = new THREE.Vector3().subVectors(v1, v0);
  const len = Math.max(d.length(), 1e-6);
  const mid = new THREE.Vector3().addVectors(v0, v1).multiplyScalar(0.5);
  const g = new THREE.CylinderGeometry(radius, radius, len, 20);
  const m = new THREE.Mesh(g, mat);
  m.position.copy(mid);
  const z = new THREE.Vector3(0, 0, 1);
  m.quaternion.setFromUnitVectors(z, d.clone().normalize());
  group.add(m);
}

function main() {
  const scene = new THREE.Scene();

  const matN = new THREE.MeshStandardMaterial({
    color: "#d95a62",
    metalness: 0.15,
    roughness: 0.45,
  });
  const matS = new THREE.MeshStandardMaterial({
    color: "#5a8ce8",
    metalness: 0.12,
    roughness: 0.48,
  });
  const matCu = new THREE.MeshStandardMaterial({
    color: "#8c8980",
    metalness: 0.65,
    roughness: 0.35,
  });

  const boxS = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1.9, 1.9), matS);
  boxS.name = "Magnet_South";
  boxS.position.set(-0.72, 0, 0);
  scene.add(boxS);

  const boxN = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1.9, 1.9), matN);
  boxN.name = "Magnet_North";
  boxN.position.set(0.72, 0, 0);
  scene.add(boxN);

  const root = new THREE.Group();
  root.name = "Motor_Coil_Root";

  const wy = 0.52;
  const wz = 0.36;
  const y0 = -wy / 2;
  const y1 = wy / 2;
  const z0 = -wz / 2;
  const z1 = wz / 2;
  const corners = [
    [0, y0, z0],
    [0, y1, z0],
    [0, y1, z1],
    [0, y0, z1],
  ];
  for (let i = 0; i < 4; i += 1) {
    addEdgeCylinder(root, corners[i], corners[(i + 1) % 4], 0.028, matCu);
  }
  scene.add(root);

  const exporter = new GLTFExporter();
  exporter
    .parseAsync(scene, { binary: true })
    .then((buffer) => {
      const outDir = path.join(__dirname, "..", "public", "models");
      fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, "dc_coil_motor.glb");
      fs.writeFileSync(outPath, Buffer.from(buffer));
      console.log("Wrote", outPath, `(${buffer.byteLength} bytes)`);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

main();
