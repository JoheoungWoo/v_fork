import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * 전자기 유도 DC 발전기 3D 위젯 v4
 *
 * 좌표계:
 *   - 자석: X축 좌우 (N=-X, S=+X), 자기장 B = +X 방향
 *   - 회전축: Y축 (수직 기둥)
 *   - 코일: XZ 평면에서 시작, Y축 회전 → 좌우로 시계/반시계 회전
 *
 * 플레밍 왼손 법칙:
 *   유효 도선 = Z방향 (z=+CH/2 앞 도선, z=-CH/2 뒤 도선)
 *   B=+X, 앞 도선 전류=+Z → F = (+Z)×(+X) = -Y (아래) ... 아님
 *
 *   올바른 설정:
 *   코일이 Y축 회전 → 도선은 Y방향으로 뻗어야 F가 XZ 평면 내 접선방향
 *   B=+X, 도선 전류=+Y → F = I(+Y × +X) = I(-Z) → Z방향 힘
 *   → 코일의 XZ 좌표 변화 = 시계/반시계 회전 ✓
 *
 * 구조:
 *   - 코일: Y방향 도선 (좌 x=-w/2, 우 x=+w/2), 수평 연결선(Z방향)
 *   - 회전축: Y축 수직봉
 *   - Commutator: Y축 회전축 하단에 수평 배치, 코일과 함께 Y축 회전
 *   - Carbon Brush: Z축 방향 고정 접점
 *   - 자석: X축 좌우, 코일 양옆
 *   - 카메라: 약간 위/앞에서 → 자석 좌우, 코일 좌우 회전이 잘 보임
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
    sceneRef.current.curArrows?.forEach((a) => {
      a.visible = showCurrent;
    });
  }, [showCurrent]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    // ── Scene ───────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);
    scene.fog = new THREE.Fog(0xf0f4f8, 20, 34);

    // ── Camera ──────────────────────────────────────────────
    // 정면 약간 위에서 → 자석(좌우), 코일 XZ 좌우 회전 모두 보임
    const cam = new THREE.PerspectiveCamera(
      40,
      el.clientWidth / el.clientHeight,
      0.1,
      80,
    );
    cam.position.set(0, 5.0, 11.0);
    cam.lookAt(0, 0.0, 0);

    // ── Lights ──────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.9));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(3, 10, 5);
    sun.castShadow = true;
    scene.add(sun);
    scene.add(
      Object.assign(new THREE.DirectionalLight(0xddeeff, 0.3), {
        position: new THREE.Vector3(-4, 2, -3),
      }),
    );
    const nGlow = new THREE.PointLight(0xff3333, 0.8, 8);
    nGlow.position.set(-4.5, 0, 0);
    scene.add(nGlow);
    const sGlow = new THREE.PointLight(0x3355ff, 0.8, 8);
    sGlow.position.set(4.5, 0, 0);
    scene.add(sGlow);

    // ── Grid ────────────────────────────────────────────────
    const grid = new THREE.GridHelper(20, 40, 0xc0cdd6, 0xd8e4ec);
    grid.position.y = -3.4;
    scene.add(grid);

    // ── Utility ─────────────────────────────────────────────
    const Y3 = new THREE.Vector3(0, 1, 0);
    function tube(from, to, r, mat) {
      const d = new THREE.Vector3().subVectors(to, from);
      const len = d.length();
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, len, 14),
        mat,
      );
      mesh.position.copy(from).addScaledVector(d, 0.5);
      mesh.quaternion.setFromUnitVectors(Y3, d.clone().normalize());
      return mesh;
    }

    // ── MAGNETS: X축 좌우 (N=-X, S=+X) ──────────────────────
    function makeMagnet(x, color, letter, lc) {
      const g = new THREE.Group();
      const bm = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.28,
        metalness: 0.18,
      });
      // 몸체 — 얇은 폭(X), 큰 높이(Y), 깊이(Z)
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.0, 2.0), bm));
      // 극면 (코일 쪽)
      const fm = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.14),
        roughness: 0.18,
      });
      const face = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 1.8), fm);
      face.position.x = x < 0 ? 0.58 : -0.58;
      g.add(face);
      // 극 레이블
      const cv = document.createElement("canvas");
      cv.width = 128;
      cv.height = 128;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = lc;
      ctx.font = "bold 90px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, 64, 64);
      const lm = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(cv),
        transparent: true,
        side: THREE.DoubleSide,
      });
      const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), lm);
      lbl.position.set(x < 0 ? 0.62 : -0.62, 0.2, 1.05);
      g.add(lbl);
      g.position.x = x;
      scene.add(g);
      return g;
    }
    makeMagnet(-4.2, 0xcc2020, "N", "#ffaaaa");
    makeMagnet(4.2, 0x1133bb, "S", "#aabbff");

    // ── ROTATION AXIS: Y축 수직봉 ────────────────────────────
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 8.0, 14),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.12,
      }),
    );
    axle.position.y = 0.5;
    scene.add(axle);

    // ── COIL GROUP (Y축 회전 = 수평면에서 시계/반시계) ──────
    // 코일: Y방향 도선 (좌 x=-W, 우 x=+W)
    //        Z방향 연결선 (앞 z=+D/2, 뒤 z=-D/2)
    // B=+X, 좌도선 전류=+Y → F=(-Z) 방향 → 코일 시계/반시계 ✓
    const coilGroup = new THREE.Group();
    scene.add(coilGroup);

    const CW = 2.0; // 코일 X폭 (자석 사이 들어가도록)
    const CD = 2.0; // 코일 Z깊이
    const CH = 2.0; // 도선 Y높이

    const wireLMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xd97706,
      emissiveIntensity: 0.2,
      metalness: 0.25,
      roughness: 0.4,
    });
    const wireRMat = wireLMat.clone();
    const connMat = new THREE.MeshStandardMaterial({
      color: 0xa16207,
      emissive: 0xa16207,
      emissiveIntensity: 0.05,
    });

    // 좌 도선: x=-CW/2, y: -CH/2 → +CH/2, z=0 (초기 위치)
    // 코일이 Y축 회전하면 이 도선이 XZ 평면에서 좌우로 돌아감
    const wireL = tube(
      new THREE.Vector3(-CW / 2, -CH / 2, 0),
      new THREE.Vector3(-CW / 2, CH / 2, 0),
      0.062,
      wireLMat,
    );
    const wireR = tube(
      new THREE.Vector3(CW / 2, -CH / 2, 0),
      new THREE.Vector3(CW / 2, CH / 2, 0),
      0.062,
      wireRMat,
    );
    // 상 연결: y=+CH/2, z: -CD/2 → +CD/2
    const wireTopF = tube(
      new THREE.Vector3(-CW / 2, CH / 2, 0),
      new THREE.Vector3(CW / 2, CH / 2, 0),
      0.042,
      connMat.clone(),
    );
    const wireTopB = tube(
      new THREE.Vector3(-CW / 2, -CH / 2, 0),
      new THREE.Vector3(CW / 2, -CH / 2, 0),
      0.042,
      connMat.clone(),
    );

    // 실제로 코일을 정면에서 보면 직사각형 루프 → XZ가 아니라 XY면
    // Y축 회전하면 XY면 루프가 수평 회전 → 좌우 도선이 자석 사이를 왔다갔다 ✓
    coilGroup.add(wireL, wireR, wireTopF, wireTopB);

    // ── COMMUTATOR: 코일 하단(y=-CH/2-0.4)에 수평 배치 ─────
    // Y축 회전 → Commutator도 수평(XZ면)에서 회전
    const commY = -CH / 2 - 0.5;
    const commR = 0.4;
    const commMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 0.14,
      metalness: 0.72,
      roughness: 0.2,
    });
    // 반원 0 (0 ~ π)
    const comm0 = new THREE.Mesh(
      new THREE.CylinderGeometry(
        commR,
        commR,
        0.24,
        20,
        1,
        false,
        0,
        Math.PI * 0.92,
      ),
      commMat,
    );
    comm0.position.set(0, commY, 0);
    coilGroup.add(comm0);
    // 반원 1 (π ~ 2π)
    const comm1 = new THREE.Mesh(
      new THREE.CylinderGeometry(
        commR,
        commR,
        0.24,
        20,
        1,
        false,
        Math.PI,
        Math.PI * 0.92,
      ),
      commMat,
    );
    comm1.position.set(0, commY, 0);
    coilGroup.add(comm1);

    // 상하 캡 디스크
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xfdba74,
      metalness: 0.5,
      roughness: 0.4,
    });
    [-0.13, 0.13].forEach((dy) => {
      const cap = new THREE.Mesh(
        new THREE.RingGeometry(0.06, commR, 20),
        capMat,
      );
      cap.rotation.x = -Math.PI / 2;
      cap.position.set(0, commY + dy, 0);
      coilGroup.add(cap);
    });

    // ── CARBON BRUSHES: Z축 방향 고정 ────────────────────────
    // Commutator가 Y축으로 돌면 Z축 방향 브러시가 각 반원에 교대로 접촉
    const brushM = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.88,
    });
    const springM = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.6,
    });
    const holderM = new THREE.MeshStandardMaterial({ color: 0x334155 });

    [commR + 0.22, -(commR + 0.22)].forEach((bz, i) => {
      // 브러시 헤드
      const bh = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.32, 0.16),
        brushM,
      );
      bh.position.set(0, commY, bz);
      scene.add(bh);
      // 스프링
      const sp = tube(
        new THREE.Vector3(0, commY + 0.25, bz),
        new THREE.Vector3(0, commY + 0.65, bz),
        0.033,
        springM,
      );
      scene.add(sp);
      // 지지대
      const h = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.55, 0.12),
        holderM,
      );
      h.position.set(0, commY + 0.88, bz);
      scene.add(h);
      // 리드선: 브러시 → 배터리 쪽으로 내려감
      const leadMat = new THREE.LineBasicMaterial({
        color: i === 0 ? 0xdc2626 : 0x1d4ed8,
      });
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, commY - 0.18, bz),
            new THREE.Vector3(0, commY - 0.8, bz),
            new THREE.Vector3(0, commY - 0.8, bz * 0.3),
            new THREE.Vector3(i === 0 ? -0.6 : 0.6, commY - 1.4, 0),
          ]),
          leadMat,
        ),
      );
    });

    // ── CURRENT ARROWS: Y방향 도선에 표시 ───────────────────
    // 좌도선(x=-CW/2): emf>0 → 위(+Y), emf<0 → 아래(-Y)
    // 우도선(x=+CW/2): 반대
    const arrowGeo = new THREE.ConeGeometry(0.082, 0.26, 8);
    const mkArrow = (x, y) => {
      const m = new THREE.Mesh(
        arrowGeo,
        new THREE.MeshBasicMaterial({
          color: 0x16a34a,
          transparent: true,
          opacity: 0.9,
        }),
      );
      m.position.set(x, y, 0);
      coilGroup.add(m);
      return m;
    };
    const arrLU = mkArrow(-CW / 2, 0.5); // 좌 위
    const arrLD = mkArrow(-CW / 2, -0.5); // 좌 아래
    const arrRU = mkArrow(CW / 2, 0.5); // 우 위
    const arrRD = mkArrow(CW / 2, -0.5); // 우 아래
    const curArrows = [arrLU, arrLD, arrRU, arrRD];
    sceneRef.current.curArrows = curArrows;

    // ── MAGNETIC FLUX LINES (X축 방향) ───────────────────────
    const fluxGroup = new THREE.Group();
    const fluxLMat = new THREE.LineBasicMaterial({
      color: 0xff5555,
      opacity: 0.22,
      transparent: true,
    });
    for (let y = -0.7; y <= 0.7; y += 0.35) {
      for (let z = -0.6; z <= 0.6; z += 0.6) {
        const pts = [];
        for (let x = -3.5; x <= 3.5; x += 0.2)
          pts.push(new THREE.Vector3(x, y, z));
        fluxGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            fluxLMat,
          ),
        );
        [-2, 0, 2].forEach((ax) => {
          const ah = new THREE.Mesh(
            new THREE.ConeGeometry(0.044, 0.13, 6),
            new THREE.MeshBasicMaterial({
              color: 0xff5555,
              opacity: 0.38,
              transparent: true,
            }),
          );
          ah.rotation.z = -Math.PI / 2;
          ah.position.set(ax, y, z);
          fluxGroup.add(ah);
        });
      }
    }
    fluxGroup.visible = false;
    scene.add(fluxGroup);
    sceneRef.current.fluxGroup = fluxGroup;

    // ── PULLEY: 수직축 상단 ───────────────────────────────────
    const pulleyG = new THREE.Group();
    const pRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.44, 0.058, 8, 28),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.72,
        roughness: 0.28,
      }),
    );
    // Pulley가 XZ면에서 Y축 회전 → rotation.x = 0 (기본 XZ면)
    pulleyG.add(pRing);
    const pHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.25, 12),
      new THREE.MeshStandardMaterial({ color: 0x64748b }),
    );
    pulleyG.add(pHub);
    pulleyG.position.set(0.6, CH / 2 + 0.65, 0);
    scene.add(pulleyG);

    // 벨트 라인
    const beltM = new THREE.LineBasicMaterial({ color: 0x78716c });
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, CH / 2 + 0.0, 0),
          new THREE.Vector3(0.6, CH / 2 + 0.65, 0),
          new THREE.Vector3(0.6, CH / 2 + 1.8, 0),
        ]),
        beltM,
      ),
    );

    // ── BATTERY: 하단 (크게) ──────────────────────────────────
    const battY = commY - 2.2;
    const battGrp = new THREE.Group();
    battGrp.position.set(0, battY, 0);

    const battBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.78, 1.1),
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.38,
        metalness: 0.14,
      }),
    );
    battGrp.add(battBody);
    // + / - 터미널
    [
      [-0.7, 0xfacc15],
      [0.7, 0x94a3b8],
    ].forEach(([dx, col]) => {
      const t = new THREE.Mesh(
        new THREE.CylinderGeometry(0.095, 0.095, 0.2, 10),
        new THREE.MeshStandardMaterial({ color: col, metalness: 0.8 }),
      );
      t.position.set(dx, 0.48, 0);
      battGrp.add(t);
    });
    // 배터리 레이블
    const bcv = document.createElement("canvas");
    bcv.width = 256;
    bcv.height = 96;
    const bctx = bcv.getContext("2d");
    bctx.fillStyle = "#ffffff";
    bctx.font = "bold 42px Arial";
    bctx.textAlign = "center";
    bctx.textBaseline = "middle";
    bctx.fillText("⚡ Energy Storage", 128, 48);
    const blbl = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 0.65),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(bcv),
        transparent: true,
        side: THREE.DoubleSide,
      }),
    );
    blbl.position.set(0, 0, 0.58);
    battGrp.add(blbl);
    scene.add(battGrp);

    // 배터리 연결선
    [
      [-0.7, 0xdc2626],
      [0.7, 0x1d4ed8],
    ].forEach(([dx, col]) => {
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(dx, battY + 0.48, 0),
            new THREE.Vector3(dx, battY + 0.8, 0),
            new THREE.Vector3(dx, commY - 1.4, 0),
          ]),
          new THREE.LineBasicMaterial({ color: col }),
        ),
      );
    });

    // ── ANIMATION LOOP ───────────────────────────────────────
    let lastT = performance.now();
    let rafId;

    function animate(now) {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      const { speed, bField, paused, showCurrent } = stateRef.current;
      if (!paused) stateRef.current.angle += speed * dt * 1.4;
      const angle = stateRef.current.angle;

      // ── Y축 회전: 코일이 수평면에서 시계/반시계 ──────────
      coilGroup.rotation.y = angle;
      pulleyG.rotation.y = -angle * 0.88;

      // ── EMF 계산 ──────────────────────────────────────────
      // 코일 법선 처음 +Z(정면), B=+X
      // Φ = B·A·cos(angle_between_normal_and_B)
      // 법선이 +Z에서 시작, Y축 회전 → 법선 = (sin a, 0, cos a)
      // Φ = B·sin(angle), EMF = -dΦ/dt ∝ -cos(angle)...
      // 실용적으로: EMF = B·sin(angle) (각도 0에서 법선⊥B, EMF=0)
      const emf = bField * Math.sin(angle);
      const emfV = (emf * 120).toFixed(1);
      const absE = Math.abs(emf);

      // ── 전류 화살표 방향 ──────────────────────────────────
      // 플레밍 왼손: B=+X, 좌도선 전류=+Y(emf>0) → F=-Z (코일 Z방향 힘 → 시계 방향 회전)
      // 화살표 방향: emf>0 → 좌도선 위, 우도선 아래
      //              emf<0 → 좌도선 아래, 우도선 위
      const dir = Math.sign(emf) || 1;
      arrLU.rotation.z = dir > 0 ? 0 : Math.PI; // 좌 위: 위(emf>0)
      arrLD.rotation.z = dir > 0 ? 0 : Math.PI;
      arrRU.rotation.z = dir > 0 ? Math.PI : 0; // 우: 반대
      arrRD.rotation.z = dir > 0 ? Math.PI : 0;

      // 실제로는 하나씩만 표시 (두 위치 중 하나)
      arrLU.position.y = 0.45 * dir;
      arrLD.position.y = -0.45 * dir;
      arrRU.position.y = 0.45 * dir;
      arrRD.position.y = -0.45 * dir;

      const alpha = Math.min(1, absE * 1.3);
      curArrows.forEach((a) => {
        a.material.opacity = 0.1 + alpha * 0.9;
        a.visible = showCurrent;
      });

      // ── 도선 발광 ─────────────────────────────────────────
      const gc =
        emf >= 0
          ? new THREE.Color(0, 0.4 * absE, 0)
          : new THREE.Color(0.5 * absE, 0, 0);
      [wireLMat, wireRMat].forEach((m) => {
        m.emissive.copy(gc);
        m.emissiveIntensity = 0.06 + absE * 0.65;
      });

      // ── HUD ───────────────────────────────────────────────
      const deg = Math.round(((((angle * 180) / Math.PI) % 360) + 360) % 360);
      setHudAngle(deg);
      setHudEmf(emfV);
      setHudDir(
        absE < 0.05
          ? "전환점 (0V)"
          : emf > 0
            ? "시계방향 (CW)"
            : "반시계방향 (CCW)",
      );

      renderer.render(scene, cam);
    }
    rafId = requestAnimationFrame(animate);

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

  const emfNum = parseFloat(hudEmf);
  const emfPct = Math.min(100, Math.abs(emfNum) / 1.2);
  const emfColor = emfNum >= 0 ? "#16a34a" : "#dc2626";

  const btnS = (active) => ({
    padding: "5px 14px",
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
          maxHeight: 480,
          border: "0.5px solid #e2e8f0",
          borderRadius: 12,
          overflow: "hidden",
          background: "#f0f4f8",
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
                background: "rgba(255,255,255,0.92)",
                border: "0.5px solid #e2e8f0",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                color: "#1e293b",
                fontVariantNumeric: "tabular-nums",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
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
            width: "min(300px,76%)",
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
              height: 6,
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
                transition: "width 0.05s, background 0.12s",
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
            <label style={{ minWidth: 78, color: "#475569" }}>{label}</label>
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
                minWidth: 40,
                textAlign: "right",
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
            <button key={label} onClick={fn} style={btnS(active)}>
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
          ["#cc2020", "N극"],
          ["#1133bb", "S극"],
          ["#d97706", "Wire Coil (Y방향 도선)"],
          ["#f97316", "Commutator / Brush"],
          ["#16a34a", "전류 방향"],
          ["#ff5555", "자속선 (Magnetic Flux)"],
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

      {/* 플레밍 법칙 설명 */}
      <div
        style={{
          marginTop: 10,
          padding: "8px 14px",
          background: "#f8fafc",
          border: "0.5px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 11,
          color: "#475569",
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: "#1e293b" }}>플레밍 왼손 법칙</strong> —{" "}
        <strong>B = +X</strong>(N→S 방향), 도선 전류 <strong>I = ±Y</strong>, 힘{" "}
        <strong>F = I(L × B) = ∓Z</strong> → 코일이 수평면(XZ)에서{" "}
        <strong>시계/반시계 회전</strong>. EMF 최대: 코일 면이 자기장에
        평행(90°·270°), EMF=0: 수직(0°·180°, 전환점).
      </div>
    </div>
  );
}
