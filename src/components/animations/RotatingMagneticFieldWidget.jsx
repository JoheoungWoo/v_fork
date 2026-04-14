import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const RotatingMagneticFieldWidget = () => {
  const mountRef = useRef(null);
  const [frequency, setFrequency] = useState(60);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 15);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);

    // 조명
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    // 3상 코일 표현 (고정자)
    const coilGeo = new THREE.TorusGeometry(5, 0.2, 16, 100);
    const colors = [0xff4444, 0x44ff44, 0x4444ff]; // R, S, T상
    const coils = colors.map((col, i) => {
      const mesh = new THREE.Mesh(
        coilGeo,
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.3,
        }),
      );
      mesh.rotation.x = Math.PI / 2;
      mesh.rotation.y = (Math.PI * i) / 1.5;
      scene.add(mesh);
      return mesh;
    });

    // 합성 자기장 벡터 (중앙 화살표)
    const dir = new THREE.Vector3(1, 0, 0);
    const arrow = new THREE.ArrowHelper(
      dir,
      new THREE.Vector3(0, 0, 0),
      4,
      0xffff00,
      1.5,
      0.8,
    );
    scene.add(arrow);

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = Date.now() * 0.002 * (frequency / 60);
      const angle = t;
      arrow.setDirection(
        new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
      );
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
    };
  }, [frequency]);

  return (
    <div className="relative w-full h-[600px] bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-4 left-4 w-64 bg-white/95 p-5 rounded-2xl shadow-xl z-10">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          🌀 3상 회전자기장
        </h2>
        <label className="text-xs font-bold text-gray-500">
          주파수 (Hz): {frequency}
        </label>
        <input
          type="range"
          min="10"
          max="120"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full mt-2"
        />
      </div>
      <div className="absolute top-4 right-4 bg-white/95 p-5 rounded-2xl shadow-xl z-10 w-72 text-center">
        <div className="text-xl font-serif mb-2">
          B<sub>net</sub> = 1.5 B<sub>m</sub>
        </div>
        <p className="text-xs text-gray-500 font-bold">
          합성 자기장의 크기는 일정하며
          <br />
          주파수에 비례하여 회전합니다.
        </p>
      </div>
    </div>
  );
};
export default RotatingMagneticFieldWidget;
