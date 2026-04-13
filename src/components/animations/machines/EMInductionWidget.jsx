import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * 전자기 유도 DC 발전기 3D 위젯
 * - 코일(Wire Coil)이 Y축 기준으로 좌우 회전
 * - N-S 자극 사이에서 코일이 자기장(Z축)을 끊음
 * - Split Ring Commutator + Carbon Brush + Battery 회로
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
  const sceneRef = useRef(null);

  const [speed, setSpeed] = useState(1.0);
  const [bField, setBField] = useState(1.0);
  const [paused, setPaused] = useState(false);
  const [showFlux, setShowFlux] = useState(false);
  const [showCurrent, setShowCurrent] = useState(true);
  const [hudAngle, setHudAngle] = useState(0);
  const [hudEmf, setHudEmf] = useState(0);
  const [hudDir, setHudDir] = useState("대기중");

  // sync refs
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
    if (sceneRef.current?.fluxGroup)
      sceneRef.current.fluxGroup.visible = showFlux;
  }, [showFlux]);
  useEffect(() => {
    stateRef.current.showCurrent = showCurrent;
    if (sceneRef.current?.arrows)
      sceneRef.current.arrows.forEach((a) => {
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

    // ── Scene / Camera ────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b14);
    scene.fog = new THREE.Fog(0x060b14, 14, 24);

    const cam = new THREE.PerspectiveCamera(
      42,
      el.clientWidth / el.clientHeight,
      0.1,
      80,
    );
    // 카메라: 자석이 Z축(-Z=N, +Z=S)에 배치, 코일 Y축 회전
    // 정면에서 보면 코일의 좌우 회전이 잘 보임
    cam.position.set(0, 3.8, 9.5);
    cam.lookAt(0, 0.2, 0);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x1e3a5f, 1.8));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(4, 8, 4);
    sun.castShadow = true;
    scene.add(sun);
    const nLight = new THREE.PointLight(0xff3030, 1.2, 7);
    nLight.position.set(0, 0, -3.2);
    scene.add(nLight);
    const sLight = new THREE.PointLight(0x3060ff, 1.2, 7);
    sLight.position.set(0, 0, 3.2);
    scene.add(sLight);

    // ── Grid ──────────────────────────────────────────────────
    const grid = new THREE.GridHelper(14, 28, 0x1e293b, 0x0f172a);
    grid.position.y = -2.2;
    scene.add(grid);

    // ── Helper: tube from point A to B ────────────────────────
    const tubeMat = (color, emissive = color, ei = 0.1) =>
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: ei,
        metalness: 0.3,
        roughness: 0.4,
      });

    function addTube(from, to, radius = 0.05, mat) {
      const dir = new THREE.Vector3().subVectors(to, from);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, len, 12),
        mat,
      );
      mesh.position.copy(mid);
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.normalize(),
      );
      return mesh;
    }

    // ── MAGNETS (자석 N=-Z, S=+Z) ────────────────────────────
    // 코일이 Y축 회전 → 자기장은 Z축 방향(N→S: -Z→+Z)
    function makeMagnet(color, z) {
      const g = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.25,
      });
      // 메인 블록
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 2.6, 0.75),
        bodyMat,
      );
      g.add(body);
      // 극면 (안쪽)
      const faceMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).addScalar(0.12),
        roughness: 0.25,
        metalness: 0.1,
      });
      const face = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 2.4, 0.18),
        faceMat,
      );
      face.position.z = z < 0 ? 0.46 : -0.46;
      g.add(face);
      g.position.set(0, 0, z);
      scene.add(g);
      return g;
    }
    makeMagnet(0xcc2222, -3.0); // N
    makeMagnet(0x1144cc, 3.0); // S

    // 극 레이블 (Canvas texture)
    function makeLabel(text, color, pos) {
      const cv = document.createElement("canvas");
      cv.width = 128;
      cv.height = 128;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = color;
      ctx.font = "bold 96px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 64, 64);
      const tex = new THREE.CanvasTexture(cv);
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.8),
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          side: THREE.DoubleSide,
        }),
      );
      mesh.position.set(...pos);
      scene.add(mesh);
    }
    makeLabel("N", "#ff7777", [0, 0.5, -3.05]);
    makeLabel("S", "#7799ff", [0, 0.5, 3.05]);

    // ── AXLE (Y축 회전축 → X방향 수평봉) ────────────────────
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 6.5, 16),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.15,
      }),
    );
    axle.rotation.z = Math.PI / 2; // X축으로 눕힘 (좌우)
    scene.add(axle);

    // ── COIL GROUP (Y축 기준 회전) ────────────────────────────
    const coilGroup = new THREE.Group();
    scene.add(coilGroup);

    // 코일: XZ 평면의 사각형 루프, Y축 회전
    // 코일 좌측(x=-W/2), 우측(x=+W/2) 도선이 자기장을 끊음
    const CW = 1.7; // 코일 폭 (X방향)
    const CH = 1.9; // 코일 높이 (Y방향)
    const coilYellowMat = tubeMat(0xfacc15, 0xfacc15, 0.2);
    const coilDimMat = tubeMat(0xe2b800, 0xe2b800, 0.05);

    // 좌우 유효 도선 (자기장 끊는 쪽)
    const wireL = addTube(
      new THREE.Vector3(-CW / 2, -CH / 2, 0),
      new THREE.Vector3(-CW / 2, CH / 2, 0),
      0.058,
      coilYellowMat.clone(),
    );
    const wireR = addTube(
      new THREE.Vector3(CW / 2, -CH / 2, 0),
      new THREE.Vector3(CW / 2, CH / 2, 0),
      0.058,
      coilYellowMat.clone(),
    );
    // 상하 연결 도선
    const wireTop = addTube(
      new THREE.Vector3(-CW / 2, CH / 2, 0),
      new THREE.Vector3(CW / 2, CH / 2, 0),
      0.042,
      coilDimMat.clone(),
    );
    const wireBot = addTube(
      new THREE.Vector3(-CW / 2, -CH / 2, 0),
      new THREE.Vector3(CW / 2, -CH / 2, 0),
      0.042,
      coilDimMat.clone(),
    );
    coilGroup.add(wireL, wireR, wireTop, wireBot);

    // ── COMMUTATOR (Split Ring, Y축 회전) ─────────────────────
    const commMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 0.08,
      metalness: 0.7,
      roughness: 0.2,
    });
    for (let s = 0; s < 2; s++) {
      // X축 방향으로 배치, Y축 회전이므로 commutator도 같이 회전
      const half = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.22,
          0.22,
          0.2,
          16,
          1,
          false,
          s * Math.PI,
          Math.PI * 0.9,
        ),
        commMat,
      );
      // commutator는 축 끝에 배치 (X ±2.5)
      half.rotation.z = Math.PI / 2;
      half.position.set(s === 0 ? 2.5 : -2.5, 0, 0);
      coilGroup.add(half);
    }

    // ── CARBON BRUSHES (고정, 정류자 접촉) ───────────────────
    const brushMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.7,
    });
    [
      [2.5, 0.28],
      [2.5, -0.28],
      [-2.5, 0.28],
      [-2.5, -0.28],
    ].forEach(([x, z]) => {
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.38, 0.22),
        brushMat,
      );
      b.position.set(x, -0.26, z);
      scene.add(b);
    });

    // ── CURRENT ARROWS ────────────────────────────────────────
    const arrowGeo = new THREE.ConeGeometry(0.075, 0.22, 8);
    const arrowMatL = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const arrowMatR = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const arrL1 = new THREE.Mesh(arrowGeo, arrowMatL.clone());
    const arrL2 = new THREE.Mesh(arrowGeo, arrowMatL.clone());
    const arrR1 = new THREE.Mesh(arrowGeo, arrowMatR.clone());
    const arrR2 = new THREE.Mesh(arrowGeo, arrowMatR.clone());
    const arrows = [arrL1, arrL2, arrR1, arrR2];
    arrL1.position.set(-CW / 2, -0.35, 0);
    arrL2.position.set(-CW / 2, 0.35, 0);
    arrR1.position.set(CW / 2, 0.35, 0);
    arrR2.position.set(CW / 2, -0.35, 0);
    arrows.forEach((a) => coilGroup.add(a));
    sceneRef.current = { ...sceneRef.current, arrows };

    // ── MAGNETIC FLUX LINES (Z축 방향: N→S) ──────────────────
    const fluxGroup = new THREE.Group();
    const fluxMat = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      opacity: 0.3,
      transparent: true,
    });
    for (let x = -0.8; x <= 0.8; x += 0.4) {
      for (let y = -0.7; y <= 0.7; y += 0.35) {
        const pts = [];
        for (let z = -2.2; z <= 2.2; z += 0.15)
          pts.push(new THREE.Vector3(x, y, z));
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        fluxGroup.add(new THREE.Line(geo, fluxMat));
        // 화살표 헤드
        const ah = new THREE.Mesh(
          new THREE.ConeGeometry(0.04, 0.12, 6),
          new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            opacity: 0.4,
            transparent: true,
          }),
        );
        ah.position.set(x, y, 0.3);
        // Z방향으로 회전 (Y→Z)
        ah.rotation.x = Math.PI / 2;
        fluxGroup.add(ah);
      }
    }
    fluxGroup.visible = false;
    scene.add(fluxGroup);
    sceneRef.current = { ...sceneRef.current, fluxGroup };

    // ── PULLEY (상단, X축 방향) ────────────────────────────────
    const pulleyGroup = new THREE.Group();
    const pRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.055, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75 }),
    );
    // Pulley는 Y축 회전이므로 XZ면에 배치
    pRing.rotation.y = Math.PI / 2;
    pulleyGroup.add(pRing);
    const pHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: 0x64748b }),
    );
    pHub.rotation.z = Math.PI / 2;
    pulleyGroup.add(pHub);
    pulleyGroup.position.set(2.5, 2.3, 0);
    scene.add(pulleyGroup);

    // 벨트 와이어
    const beltMat = new THREE.LineBasicMaterial({ color: 0x78716c });
    const beltPts1 = [
      new THREE.Vector3(2.5, 0.12, 0),
      new THREE.Vector3(2.5, 1.92, 0),
    ];
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(beltPts1),
        beltMat,
      ),
    );
    const beltPts2 = [
      new THREE.Vector3(2.5, 2.3, 0.38),
      new THREE.Vector3(0, 2.9, 0),
      new THREE.Vector3(0, 0, 0),
    ];
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(beltPts2),
        new THREE.LineBasicMaterial({ color: 0x57534e }),
      ),
    );

    // ── BATTERY (하단) ────────────────────────────────────────
    const battGroup = new THREE.Group();
    battGroup.position.set(0, -2.5, 0);
    const battBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.5, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }),
    );
    battGroup.add(battBody);
    [
      [-0.5, "+", 0xfacc15],
      [0.5, "−", 0x94a3b8],
    ].forEach(([dx, label, col]) => {
      const t = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.14, 8),
        new THREE.MeshStandardMaterial({ color: col }),
      );
      t.position.set(dx, 0.32, 0);
      battGroup.add(t);
    });
    scene.add(battGroup);

    // 회로 와이어 (Y축 배치된 commutator와 연결 → X축 끝에서 수직으로 내려와 배터리로)
    const wireMat = new THREE.LineBasicMaterial({ color: 0xef4444 });
    const wireMat2 = new THREE.LineBasicMaterial({ color: 0x3b82f6 });
    const makeWire = (pts, mat) => {
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(
            pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
          ),
          mat,
        ),
      );
    };
    makeWire(
      [
        [-2.5, -0.5, 0],
        [-2.5, -2.3, 0],
        [-0.8, -2.3, 0],
      ],
      wireMat,
    );
    makeWire(
      [
        [0.8, -2.3, 0],
        [2.5, -2.3, 0],
        [2.5, -0.5, 0],
      ],
      wireMat2,
    );

    // ── ANIMATION LOOP ────────────────────────────────────────
    let lastT = performance.now();
    let rafId;
    let camT = 0;

    function animate(now) {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      const {
        angle: prevAngle,
        speed,
        bField,
        paused,
        showCurrent,
      } = stateRef.current;
      let angle = prevAngle;
      if (!paused) angle += speed * dt * 1.4;
      stateRef.current.angle = angle;

      // ── 코일 Y축 회전 ────────────────────────────────────────
      coilGroup.rotation.y = angle;
      pulleyGroup.rotation.y -= speed * dt * 0.9;

      // ── EMF 계산 ──────────────────────────────────────────────
      // 코일 법선이 Z축(자기장 방향)과 이루는 각 = angle
      // Φ = B·A·cos(angle), EMF = -dΦ/dt ∝ sin(angle)
      const emf = bField * Math.sin(angle); // -1 ~ +1 정규화
      const emfV = (emf * 120).toFixed(1); // 스케일된 전압

      // ── 전류 방향 화살표 ──────────────────────────────────────
      const dir = Math.sign(emf) || 1;
      arrL1.rotation.x = dir > 0 ? 0 : Math.PI;
      arrL2.rotation.x = dir > 0 ? 0 : Math.PI;
      arrR1.rotation.x = dir > 0 ? Math.PI : 0;
      arrR2.rotation.x = dir > 0 ? Math.PI : 0;
      const alpha = Math.min(1, Math.abs(emf) * 1.3);
      arrows.forEach((a) => {
        a.material.opacity = 0.15 + alpha * 0.85;
        a.material.transparent = true;
        a.visible = showCurrent;
      });

      // ── 코일 발광 ─────────────────────────────────────────────
      const emissiveCol =
        emf >= 0
          ? new THREE.Color(0.05, 0.45 * Math.abs(emf), 0.05)
          : new THREE.Color(0.45 * Math.abs(emf), 0.05, 0.05);
      [wireL, wireR].forEach((w) => {
        w.material.emissive = emissiveCol;
        w.material.emissiveIntensity = 0.05 + Math.abs(emf) * 0.6;
      });

      // ── HUD 업데이트 ──────────────────────────────────────────
      const deg = Math.round(((((angle * 180) / Math.PI) % 360) + 360) % 360);
      setHudAngle(deg);
      setHudEmf(parseFloat(emfV));
      setHudDir(
        Math.abs(emf) < 0.05
          ? "전환점 (0V)"
          : emf > 0
            ? "→ 정방향"
            : "← 역방향",
      );

      renderer.render(scene, cam);
    }
    rafId = requestAnimationFrame(animate);

    // ── Resize ────────────────────────────────────────────────
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

  const emfPct = Math.min(100, Math.abs(hudEmf) / 1.2);
  const emfColor = hudEmf >= 0 ? "#22c55e" : "#ef4444";

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
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          background: "#060b14",
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
                background: "rgba(6,11,20,0.80)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                color: "#e2e8f0",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span style={{ color: "#64748b" }}>{label} </span>
              {val}
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
            width: "min(280px,78%)",
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
              background: "rgba(255,255,255,0.07)",
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--color-text-secondary)",
            flex: 1,
            minWidth: 180,
          }}
        >
          <label style={{ minWidth: 76 }}>회전 속도</label>
          <input
            type="range"
            min={0}
            max={3}
            step={0.05}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <output
            style={{
              minWidth: 36,
              textAlign: "right",
              fontSize: 12,
              color: "var(--color-text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {speed.toFixed(1)}×
          </output>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--color-text-secondary)",
            flex: 1,
            minWidth: 180,
          }}
        >
          <label style={{ minWidth: 76 }}>자기장 세기</label>
          <input
            type="range"
            min={0.3}
            max={2}
            step={0.05}
            value={bField}
            onChange={(e) => setBField(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <output
            style={{
              minWidth: 36,
              textAlign: "right",
              fontSize: 12,
              color: "var(--color-text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {bField.toFixed(1)} T
          </output>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {[
            ["일시정지", () => setPaused((p) => !p), paused],
            ["자속선", () => setShowFlux((v) => !v), showFlux],
            ["전류 표시", () => setShowCurrent((v) => !v), showCurrent],
          ].map(([label, fn, active]) => (
            <button
              key={label}
              onClick={fn}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                cursor: "pointer",
                border: `0.5px solid ${active ? "var(--color-border-info, #3b82f6)" : "var(--color-border-secondary, rgba(255,255,255,0.2))"}`,
                borderRadius: 8,
                background: active ? "rgba(59,130,246,0.15)" : "transparent",
                color: active
                  ? "var(--color-text-info, #60a5fa)"
                  : "var(--color-text-secondary, #94a3b8)",
                transition: "all 0.15s",
              }}
            >
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
          color: "var(--color-text-secondary, #94a3b8)",
          paddingTop: 2,
        }}
      >
        {[
          ["#cc2222", "N극"],
          ["#1144cc", "S극"],
          ["#facc15", "Wire Coil"],
          ["#f97316", "Commutator / Brush"],
          ["#22c55e", "전류 방향"],
          ["#fbbf24", "자속선 (Magnetic Flux)"],
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
