import fs from "fs";
import path from "path";

const dir = path.join(import.meta.dirname, "../public/models");

function inspectGlb(filename) {
  const fp = path.join(dir, filename);
  const buf = fs.readFileSync(fp);
  const le = (o) => buf.readUInt32LE(o);
  if (buf.toString("ascii", 0, 4) !== "glTF") {
    return { error: "not glTF" };
  }
  // glTF 바이너리: 12바이트 헤더 뒤 chunkLength(4) + chunkType(4) → JSON은 오프셋 20부터
  const jsonChunkLen = le(12);
  const jsonStart = 20;
  const rawJson = buf.slice(jsonStart, jsonStart + jsonChunkLen).toString("utf8").replace(/\0+$/g, "");
  const json = JSON.parse(rawJson);
  const nodes = (json.nodes || []).map((n, i) => ({
    index: i,
    name: n.name ?? null,
    mesh: n.mesh ?? null,
    children: n.children ?? null,
  }));
  return {
    file: filename,
    byteLength: buf.length,
    nodeCount: nodes.length,
    nodeNames: nodes.map((n) => n.name),
    sceneRoots: json.scenes?.[0]?.nodes,
    nodes,
  };
}

const a = inspectGlb("dc_motor_full.glb");
const b = inspectGlb("dc_motor_full_v2.glb");
console.log(JSON.stringify({ dc_motor_full: a, dc_motor_full_v2: b }, null, 2));
