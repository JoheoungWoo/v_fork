import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * 전자기 유도 DC 발전기 3D 위젯
 * - 자석: X축 좌우 배치 (N=-X, S=+X), 자기장 방향 X축
 * - 코일: Z축(회전축)으로 좌우 회전 → Y방향 도선이 자기장 절단
 * - 밝은 배경
 * DB lecture_id: 'electromagnetic_induction'
 */
export default function EMInductionWidget() {
  const mountRef = useRef(null);
  const stateRef = useRef({
    angle: 0,
    speed: 1.0,
    bField: 1.0,
    paused: false,
    showFlux: false,
    showCurrent: true,
  });
  const sceneRef = useRef({});

  const [speed, setSpeed] = useState(1.0);
  const [bField, setBField] = useState(1.0);
  const [paused, setPaused] = useState(false);
  const [showFlux, setShowFlux] = useState(false);
  const [showCurrent, setShowCurrent] = useState(true);
  const [hudAngle, setHudAngle] = useState(0);
  const [hudEmf, setHudEmf] = useState("0.0");
  const [hudDir, setHudDir] = useState("대기중");

  useEffect(() => {
    stateRef.current.speed = speed;
  }, [speed]);
  useEffect(() => {
    stateRef.current.bField = bField;
  }, [bField]);
  useEffect(() => {
    stateRef.current.paused = paused;
  }, [paused]);
  useEffect(() => {
    stateRef.current.showFlux = showFlux;
    if (sceneRef.current.fluxGroup)
      sceneRef.current.fluxGroup.visible = showFlux;
  }, [showFlux]);
  useEffect(() => {
    stateRef.current.showCurrent = showCurrent;
    sceneRef.current.arrows?.forEach((a) => {
      a.visible = showCurrent;
    });
  }, [showCurrent]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); // 밝은 slate
    scene.fog = new THREE.Fog(0xf1f5f9, 16, 28);

    // ── Camera ────────────────────────────────────────────────
    // 자석: X축 좌우, 코일: Z축 회전
    // 카메라는 약간 위/뒤에서 사선으로 → 자석+코일 모두 잘 보임
    const cam = new THREE.PerspectiveCamera(
      40,
      el.clientWidth / el.clientHeight,
      0.1,
      80,
    );
    cam.position.set(0, 5.5, 9.0);
    cam.lookAt(0, 0.3, 0);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(5, 10, 6);
    sun.castShadow = true;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xe0e8ff, 0.4);
    fill.position.set(-4, 2, -4);
    scene.add(fill);
    const nGlow = new THREE.PointLight(0xff4444, 0.6, 6);
    nGlow.position.set(-3.5, 0, 0);
    scene.add(nGlow);
    const sGlow = new THREE.PointLight(0x4466ff, 0.6, 6);
    sGlow.position.set(3.5, 0, 0);
    scene.add(sGlow);

    // ── Grid ──────────────────────────────────────────────────
    const grid = new THREE.GridHelper(16, 32, 0xc8d6e0, 0xdde6ee);
    grid.position.y = -2.3;
    scene.add(grid);

    // ── Helpers ───────────────────────────────────────────────
    function addTube(from, to, radius, mat) {
      const dir = new THREE.Vector3().subVectors(to, from);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, len, 14),
        mat,
      );
      mesh.position.copy(mid);
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.normalize(),
      );
      return mesh;
    }

    // ── MAGNETS: X축 좌우 (N=-X, S=+X) ──────────────────────
    // 자기장 방향: N(−X) → S(+X), 즉 +X 방향
    // 코일이 Z축으로 회전하면 Y방향 도선이 자기장(X)을 끊음 → EMF 발생
    function makeMagnet(color, x, labelText, labelColor) {
      const g = new THREE.Group();

      // 메인 블록
      const bodyMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.2,
      });
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 2.8, 2.0),
        bodyMat,
      );
      g.add(body);

      // 극면 (안쪽 면, 코일 쪽)
      const faceMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.18),
        roughness: 0.2,
        metalness: 0.1,
      });
      const face = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 2.6, 1.8),
        faceMat,
      );
      face.position.x = x < 0 ? 0.51 : -0.51;
      g.add(face);

      // 극 레이블
      const cv = document.createElement("canvas");
      cv.width = 128;
      cv.height = 128;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = labelColor;
      ctx.font = "bold 100px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labelText, 64, 64);
      const lbl = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.7),
        new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(cv),
          transparent: true,
          side: THREE.DoubleSide,
        }),
      );
      lbl.position.set(x < 0 ? 0.55 : -0.55, 0.4, 1.05);
      g.add(lbl);

      g.position.x = x;
      scene.add(g);
      return g;
    }
    makeMagnet(0xdc2626, -3.6, "N", "#ff8888"); // N극 왼쪽
    makeMagnet(0x1d4ed8, 3.6, "S", "#88aaff"); // S극 오른쪽

    // ── AXLE: Z축 방향 회전축 ─────────────────────────────────
    // 코일이 Z축으로 회전하므로 axle은 Z방향 수평봉
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 7.0, 14),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.15,
      }),
    );
    axle.rotation.x = Math.PI / 2; // Z축으로 눕힘
    scene.add(axle);

    // ── COIL GROUP (Z축 회전) ─────────────────────────────────
    // 코일은 XY 평면의 사각형, Z축 회전 → 좌우 도선(Y방향, x=±CW/2)이 자기장 절단
    const coilGroup = new THREE.Group();
    scene.add(coilGroup);

    const CW = 1.7; // 코일 X폭
    const CH = 1.9; // 코일 Y높이

    const wireMatL = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0xeab308,
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.4,
    });
    const wireMatR = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0xeab308,
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.4,
    });
    const wireMatConn = new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      emissive: 0xca8a04,
      emissiveIntensity: 0.05,
      metalness: 0.3,
      roughness: 0.5,
    });

    // 유효 도선: 좌(x=-CW/2), 우(x=+CW/2) → Y방향으로 뻗음
    const wireL = addTube(
      new THREE.Vector3(-CW / 2, -CH / 2, 0),
      new THREE.Vector3(-CW / 2, CH / 2, 0),
      0.058,
      wireMatL,
    );
    const wireR = addTube(
      new THREE.Vector3(CW / 2, -CH / 2, 0),
      new THREE.Vector3(CW / 2, CH / 2, 0),
      0.058,
      wireMatR,
    );
    // 연결 도선: 상하
    const wireTop = addTube(
      new THREE.Vector3(-CW / 2, CH / 2, 0),
      new THREE.Vector3(CW / 2, CH / 2, 0),
      0.04,
      wireMatConn.clone(),
    );
    const wireBot = addTube(
      new THREE.Vector3(-CW / 2, -CH / 2, 0),
      new THREE.Vector3(CW / 2, -CH / 2, 0),
      0.04,
      wireMatConn.clone(),
    );
    coilGroup.add(wireL, wireR, wireTop, wireBot);

    // ── COMMUTATOR (Z축 회전, X축 끝에 배치 → 실제론 Z축 끝) ─
    // 회전축이 Z이므로 commutator는 Z ±2.6에 배치
    const commMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      emissive: 0xea580c,
      emissiveIntensity: 0.1,
      metalness: 0.65,
      roughness: 0.25,
    });
    for (let s = 0; s < 2; s++) {
      const half = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.22,
          0.22,
          0.2,
          16,
          1,
          false,
          s * Math.PI,
          Math.PI * 0.88,
        ),
        commMat,
      );
      // Z축이 회전축 → cylinder를 X축으로 세운 뒤 Z방향 배치
      half.rotation.x = Math.PI / 2;
      half.position.set(0, 0, s === 0 ? 2.7 : -2.7);
      coilGroup.add(half);
    }

    // ── CARBON BRUSHES ────────────────────────────────────────
    const brushMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.8,
    });
    [
      [0, 0.28, 2.7],
      [0, -0.28, 2.7],
      [0, 0.28, -2.7],
      [0, -0.28, -2.7],
    ].forEach(([x, y, z]) => {
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.38, 0.13),
        brushMat,
      );
      b.position.set(x, y - 0.25, z);
      scene.add(b);
      // 스프링
      const sp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8),
        new THREE.MeshStandardMaterial({ color: 0x64748b }),
      );
      sp.position.set(x, y + 0.07, z);
      scene.add(sp);
    });

    // ── CURRENT ARROWS ────────────────────────────────────────
    const arrowGeo = new THREE.ConeGeometry(0.072, 0.21, 8);
    const makeArrow = (pos) => {
      const m = new THREE.Mesh(
        arrowGeo,
        new THREE.MeshBasicMaterial({ color: 0x16a34a }),
      );
      m.position.copy(pos);
      coilGroup.add(m);
      return m;
    };
    const arrL1 = makeArrow(new THREE.Vector3(-CW / 2, -0.32, 0));
    const arrL2 = makeArrow(new THREE.Vector3(-CW / 2, 0.32, 0));
    const arrR1 = makeArrow(new THREE.Vector3(CW / 2, 0.32, 0));
    const arrR2 = makeArrow(new THREE.Vector3(CW / 2, -0.32, 0));
    const arrows = [arrL1, arrL2, arrR1, arrR2];
    sceneRef.current.arrows = arrows;

    // ── MAGNETIC FLUX LINES (X축 방향: N→S) ──────────────────
    const fluxGroup = new THREE.Group();
    const fluxLineMat = new THREE.LineBasicMaterial({
      color: 0xef4444,
      opacity: 0.22,
      transparent: true,
    });
    const fluxArrowMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      opacity: 0.35,
      transparent: true,
    });
    for (let y = -0.65; y <= 0.65; y += 0.325) {
      for (let z = -0.55; z <= 0.55; z += 0.55) {
        const pts = [];
        for (let x = -2.9; x <= 2.9; x += 0.18)
          pts.push(new THREE.Vector3(x, y, z));
        fluxGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            fluxLineMat,
          ),
        );
        // 화살표
        for (let x = -1.5; x <= 1.5; x += 1.5) {
          const ah = new THREE.Mesh(
            new THREE.ConeGeometry(0.038, 0.11, 6),
            fluxArrowMat.clone(),
          );
          ah.rotation.z = -Math.PI / 2; // X축 방향
          ah.position.set(x, y, z);
          fluxGroup.add(ah);
        }
      }
    }
    fluxGroup.visible = false;
    scene.add(fluxGroup);
    sceneRef.current.fluxGroup = fluxGroup;

    // ── PULLEY (상단, Z축 방향) ───────────────────────────────
    const pulleyGroup = new THREE.Group();
    const pRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.053, 8, 24),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.75,
        roughness: 0.3,
      }),
    );
    pRing.rotation.x = Math.PI / 2; // XY면에 눕힘
    pulleyGroup.add(pRing);
    const pHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: 0x64748b }),
    );
    pHub.rotation.x = Math.PI / 2;
    pulleyGroup.add(pHub);
    pulleyGroup.position.set(0, 2.4, 2.7);
    scene.add(pulleyGroup);

    // 벨트
    const beltMat = new THREE.LineBasicMaterial({ color: 0x78716c });
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0.12, 2.7),
          new THREE.Vector3(0, 2.04, 2.7),
        ]),
        beltMat,
      ),
    );
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 2.4, 3.06),
          new THREE.Vector3(0, 3.1, 0),
          new THREE.Vector3(0, 0, 0),
        ]),
        new THREE.LineBasicMaterial({ color: 0x64748b }),
      ),
    );

    // ── BATTERY (하단 중앙) ───────────────────────────────────
    const battGroup = new THREE.Group();
    battGroup.position.set(0, -2.55, 0);
    const battBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.5, 0.68),
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.45,
        metalness: 0.1,
      }),
    );
    battGroup.add(battBody);
    [
      [-0.45, 0xfacc15],
      [0.45, 0x94a3b8],
    ].forEach(([dx, col]) => {
      const t = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.13, 8),
        new THREE.MeshStandardMaterial({ color: col }),
      );
      t.position.set(dx, 0.32, 0);
      battGroup.add(t);
    });
    scene.add(battGroup);

    // 회로 와이어 (Z축 양쪽 commutator → 배터리)
    const addWire = (pts, color) => {
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(
            pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
          ),
          new THREE.LineBasicMaterial({ color, linewidth: 2 }),
        ),
      );
    };
    addWire(
      [
        [0, -0.5, 2.7],
        [0, -2.3, 2.7],
        [0, -2.3, 0.4],
      ],
      0xdc2626,
    );
    addWire(
      [
        [0, -2.3, -0.4],
        [0, -2.3, -2.7],
        [0, -0.5, -2.7],
      ],
      0x2563eb,
    );
    // 배터리 연결 짧은 선
    addWire(
      [
        [-0.45, -2.3, 0],
        [-0.45, -2.4, 0],
      ],
      0xdc2626,
    );
    addWire(
      [
        [0.45, -2.4, 0],
        [0.45, -2.3, 0],
      ],
      0x2563eb,
    );

    // ── ANIMATION LOOP ────────────────────────────────────────
    let lastT = performance.now();
    let rafId;

    function animate(now) {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      const { speed, bField, paused, showCurrent } = stateRef.current;
      if (!paused) stateRef.current.angle += speed * dt * 1.5;
      const angle = stateRef.current.angle;

      // 코일 Z축 회전
      coilGroup.rotation.z = angle;
      pulleyGroup.rotation.x -= speed * dt * 0.85;

      // EMF: 자기장 X축, 코일 법선 처음 X축
      // Φ = B·cos(angle), EMF ∝ B·sin(angle)
      const emf = bField * Math.sin(angle);
      const emfV = (emf * 120).toFixed(1);

      // 전류 방향 화살표
      const dir = Math.sign(emf) || 1;
      arrL1.rotation.z = dir > 0 ? 0 : Math.PI;
      arrL2.rotation.z = dir > 0 ? 0 : Math.PI;
      arrR1.rotation.z = dir > 0 ? Math.PI : 0;
      arrR2.rotation.z = dir > 0 ? Math.PI : 0;
      const alpha = Math.min(1, Math.abs(emf) * 1.2);
      arrows.forEach((a) => {
        a.material.opacity = 0.12 + alpha * 0.88;
        a.material.transparent = true;
        a.visible = showCurrent;
      });

      // 코일 도선 발광 색
      const abs = Math.abs(emf);
      wireMatL.emissive.set(
        emf >= 0
          ? new THREE.Color(0.0, 0.35 * abs, 0.0)
          : new THREE.Color(0.5 * abs, 0.0, 0.0),
      );
      wireMatL.emissiveIntensity = 0.08 + abs * 0.55;
      wireMatR.emissive.copy(wireMatL.emissive);
      wireMatR.emissiveIntensity = wireMatL.emissiveIntensity;

      // HUD
      const deg = Math.round(((((angle * 180) / Math.PI) % 360) + 360) % 360);
      setHudAngle(deg);
      setHudEmf(emfV);
      setHudDir(abs < 0.05 ? "전환점 (0V)" : emf > 0 ? "→ 정방향" : "← 역방향");

      renderer.render(scene, cam);
    }
    rafId = requestAnimationFrame(animate);

    // Resize
    const ro = new ResizeObserver(() => {
      if (!el) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  const emfAbs = Math.abs(parseFloat(hudEmf));
  const emfPct = Math.min(100, emfAbs / 1.2);
  const emfColor = parseFloat(hudEmf) >= 0 ? "#16a34a" : "#dc2626";

  const btnStyle = (active) => ({
    padding: "4px 13px",
    fontSize: 12,
    cursor: "pointer",
    border: `0.5px solid ${active ? "#3b82f6" : "#cbd5e1"}`,
    borderRadius: 8,
    background: active ? "#eff6ff" : "#ffffff",
    color: active ? "#1d4ed8" : "#64748b",
    transition: "all 0.15s",
  });

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "system-ui, sans-serif",
        padding: "12px 0",
      }}
    >
      {/* 3D Canvas */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          maxHeight: 420,
          border: "0.5px solid #e2e8f0",
          borderRadius: 12,
          overflow: "hidden",
          background: "#f1f5f9",
        }}
      >
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

        {/* HUD */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 12,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {[
            ["각도", `${hudAngle}°`],
            ["EMF", `${hudEmf} V`],
            ["전류", hudDir],
          ].map(([label, val]) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.88)",
                border: "0.5px solid #e2e8f0",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                color: "#1e293b",
                fontVariantNumeric: "tabular-nums",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <span style={{ color: "#94a3b8" }}>{label} </span>
              <span style={{ fontWeight: 500 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* EMF Bar */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(280px,76%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <span style={{ fontSize: 10, color: "#64748b" }}>
            유도 기전력 (EMF)
          </span>
          <div
            style={{
              width: "100%",
              height: 5,
              background: "rgba(0,0,0,0.08)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${emfPct}%`,
                background: emfColor,
                borderRadius: 3,
                transition: "width 0.05s, background 0.1s",
              }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          padding: "10px 0",
          alignItems: "center",
        }}
      >
        {[
          ["회전 속도", 0, 3, 0.05, speed, setSpeed, `${speed.toFixed(1)}×`],
          [
            "자기장 세기",
            0.3,
            2,
            0.05,
            bField,
            setBField,
            `${bField.toFixed(1)} T`,
          ],
        ].map(([label, min, max, step, val, setter, out]) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "#64748b",
              flex: 1,
              minWidth: 180,
            }}
          >
            <label style={{ minWidth: 76, color: "#475569" }}>{label}</label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={val}
              onChange={(e) => setter(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span
              style={{
                minWidth: 36,
                textAlign: "right",
                fontSize: 12,
                color: "#1e293b",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {out}
            </span>
          </div>
        ))}

        <div style={{ display: "flex", gap: 6 }}>
          {[
            ["일시정지", () => setPaused((p) => !p), paused],
            ["자속선", () => setShowFlux((v) => !v), showFlux],
            ["전류 표시", () => setShowCurrent((v) => !v), showCurrent],
          ].map(([label, fn, active]) => (
            <button key={label} onClick={fn} style={btnStyle(active)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          fontSize: 11,
          color: "#64748b",
          paddingTop: 2,
        }}
      >
        {[
          ["#dc2626", "N극"],
          ["#1d4ed8", "S극"],
          ["#eab308", "Wire Coil"],
          ["#ea580c", "Commutator / Brush"],
          ["#16a34a", "전류 방향"],
          ["#ef4444", "자속선 (Magnetic Flux)"],
        ].map(([color, label]) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
              }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
