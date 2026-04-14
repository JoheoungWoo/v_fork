/**
 * Builds frontend/public/models/induction_motor.glb (Motor_Stator / Motor_Rotor graph)
 * matching scripts/blender_induction_motor.py naming for InductionMotorWidget.
 *
 * Run from repo: cd frontend && node scripts/generate-induction-motor-glb.mjs
 */
/* GLTFExporter uses FileReader; Node has Blob but not FileReader. */
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

function mat(color, metalness = 0.45, roughness = 0.5) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    emissive: 0x000000,
    emissiveIntensity: 0,
  });
}

function addCylinderZ(parent, name, radius, height, material, position) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 48),
    material,
  );
  mesh.name = name;
  mesh.rotation.x = Math.PI / 2;
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
}

function addTorusCoil(parent, name, major, minor, material, zAngleDeg) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(major, minor, 12, 48),
    material,
  );
  mesh.name = name;
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = THREE.MathUtils.degToRad(90 + zAngleDeg);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
}

async function main() {
  const scene = new THREE.Scene();

  const mStator = mat(0x474f57, 0.42, 0.52);
  const mEnd = mat(0x38424a, 0.48, 0.48);
  const mA = mat(0xd9382e, 0.55, 0.35);
  const mB = mat(0x2eb852, 0.55, 0.35);
  const mC = mat(0x3361e6, 0.55, 0.35);
  const mRotor = mat(0x9e5914, 0.4, 0.42);
  const mBar = mat(0xc78c1e, 0.58, 0.36);
  const mShaft = mat(0x6b6b73, 0.6, 0.38);

  const statorRoot = new THREE.Group();
  statorRoot.name = "Motor_Stator";
  scene.add(statorRoot);

  addCylinderZ(statorRoot, "Stator_Body", 0.92, 1.05, mStator, new THREE.Vector3(0, 0, 0));
  const capZ = 0.52 + 0.04;
  addCylinderZ(
    statorRoot,
    "Stator_End_Front",
    0.22,
    0.08,
    mEnd,
    new THREE.Vector3(0, 0, capZ),
  );
  addCylinderZ(
    statorRoot,
    "Stator_End_Back",
    0.22,
    0.08,
    mEnd,
    new THREE.Vector3(0, 0, -capZ),
  );

  addTorusCoil(statorRoot, "Stator_Coil_0", 0.78, 0.065, mA, 0);
  addTorusCoil(statorRoot, "Stator_Coil_1", 0.78, 0.065, mB, 120);
  addTorusCoil(statorRoot, "Stator_Coil_2", 0.78, 0.065, mC, 240);

  const rotorRoot = new THREE.Group();
  rotorRoot.name = "Motor_Rotor";
  scene.add(rotorRoot);

  addCylinderZ(rotorRoot, "Rotor_Core", 0.48, 0.88, mRotor, new THREE.Vector3(0, 0, 0));

  const nBars = 6;
  const barLen = 0.75;
  const barR = 0.38;
  for (let i = 0; i < nBars; i += 1) {
    const a = (i / nBars) * Math.PI * 2;
    const bx = Math.cos(a) * barR;
    const by = Math.sin(a) * barR;
    const bmesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, barLen),
      mBar,
    );
    bmesh.name = `Rotor_Bar_${i}`;
    bmesh.position.set(bx, by, 0);
    bmesh.castShadow = true;
    bmesh.receiveShadow = true;
    rotorRoot.add(bmesh);
  }

  addCylinderZ(
    rotorRoot,
    "Rotor_Shaft",
    0.12,
    1.35,
    mShaft,
    new THREE.Vector3(0, 0, 0),
  );

  const exporter = new GLTFExporter();
  const buffer = await exporter.parseAsync(scene, { binary: true });

  const outDir = path.join(__dirname, "..", "public", "models");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "induction_motor.glb");
  fs.writeFileSync(outPath, Buffer.from(buffer));
  console.log("Wrote", outPath, `(${buffer.byteLength} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
