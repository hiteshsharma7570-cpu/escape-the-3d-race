import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Standard western dice: opposite faces sum to 7
// BoxGeometry material order: [+X, -X, +Y, -Y, +Z, -Z]
// We map:  +X=1, -X=6, +Y=2, -Y=5, +Z=3, -Z=4
const FACE_VALUES = [1, 6, 2, 5, 3, 4];

// Quaternion that lands face `value` pointing up (+Y) when applied to identity dice.
function targetQuatForFace(value: number): THREE.Quaternion {
  const e = new THREE.Euler();
  switch (value) {
    case 1: e.set(0, 0, -Math.PI / 2); break;  // +X up
    case 6: e.set(0, 0,  Math.PI / 2); break;  // -X up
    case 2: e.set(0, 0, 0); break;             // +Y up (default)
    case 5: e.set(Math.PI, 0, 0); break;       // -Y up
    case 3: e.set(Math.PI / 2, 0, 0); break;   // +Z up
    case 4: e.set(-Math.PI / 2, 0, 0); break;  // -Z up
    default: e.set(0, 0, 0);
  }
  return new THREE.Quaternion().setFromEuler(e);
}

// Build a CanvasTexture displaying the given number of pips on a luxe face.
function makeFaceTexture(value: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Background: ivory radial gradient with subtle gold bevel
  const bg = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size * 0.7);
  bg.addColorStop(0, "#fff9ea");
  bg.addColorStop(0.7, "#f1e3b8");
  bg.addColorStop(1, "#c9a14b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Gold inner border
  ctx.strokeStyle = "#8a6620";
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, size - 28, size - 28);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, size - 40, size - 40);

  // Pip positions on 3x3 grid (normalized)
  const grid: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [2, 0], [0, 2], [2, 2]],
    5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
    6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
  };
  const pad = size * 0.22;
  const inner = size - pad * 2;
  const step = inner / 2;
  const r = size * 0.085;

  for (const [gx, gy] of grid[value] ?? []) {
    const cx = pad + gx * step;
    const cy = pad + gy * step;
    // Recessed pip: dark fill + soft highlight
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.15, cx, cy, r);
    grad.addColorStop(0, "#5a3a10");
    grad.addColorStop(0.7, "#241407");
    grad.addColorStop(1, "#0c0703");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // Tiny highlight
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.4, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface DiceMeshProps {
  value: number | null;
  rollSeq: number;
  position: [number, number, number];
}

/**
 * Physics-style 3D dice. Tumbles when `rollSeq` changes, settles on `value`.
 * No external physics library — uses analytical motion (angular velocity that
 * decays + smooth quaternion slerp to the target face) for predictable landing.
 */
export function DiceMesh({ value, rollSeq, position }: DiceMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Roll state lives in refs (avoid React rerenders during animation)
  const startTimeRef = useRef<number | null>(null);
  const spinAxisRef = useRef(new THREE.Vector3(1, 0.6, 0.3).normalize());
  const initialQuatRef = useRef(new THREE.Quaternion());
  const targetQuatRef = useRef(new THREE.Quaternion());
  const prevSeqRef = useRef(rollSeq);

  const TUMBLE = 1.0;   // seconds spinning fast
  const SETTLE = 0.45;  // seconds slerping to face
  const TOTAL = TUMBLE + SETTLE;

  const materials = useMemo(() => {
    return FACE_VALUES.map(
      (v) =>
        new THREE.MeshStandardMaterial({
          map: makeFaceTexture(v),
          metalness: 0.25,
          roughness: 0.38,
          emissive: new THREE.Color("#3a2810"),
          emissiveIntensity: 0.08,
        }),
    );
  }, []);

  useEffect(() => {
    return () => {
      materials.forEach((m) => {
        (m.map as THREE.Texture | null)?.dispose();
        m.dispose();
      });
    };
  }, [materials]);

  // Kick off a roll when rollSeq changes
  useEffect(() => {
    if (rollSeq === prevSeqRef.current) return;
    prevSeqRef.current = rollSeq;
    if (!meshRef.current || !value) return;

    initialQuatRef.current.copy(meshRef.current.quaternion);
    targetQuatRef.current.copy(targetQuatForFace(value));
    spinAxisRef.current
      .set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
      )
      .normalize();
    startTimeRef.current = performance.now() / 1000;
  }, [rollSeq, value]);

  // Settle on the current face immediately on first mount when value is known
  useEffect(() => {
    if (meshRef.current && value && startTimeRef.current === null) {
      meshRef.current.quaternion.copy(targetQuatForFace(value));
    }
  }, [value]);

  useFrame((_state, dt) => {
    if (!meshRef.current || !groupRef.current) return;

    const now = performance.now() / 1000;
    const start = startTimeRef.current;

    if (start !== null) {
      const elapsed = now - start;

      if (elapsed < TUMBLE) {
        // Fast spin with decaying angular velocity
        const k = 1 - elapsed / TUMBLE;
        const angVel = 18 * (0.4 + k * 0.6); // rad/s
        const dq = new THREE.Quaternion().setFromAxisAngle(
          spinAxisRef.current,
          angVel * dt,
        );
        meshRef.current.quaternion.multiplyQuaternions(
          dq,
          meshRef.current.quaternion,
        );
        // Bounce: up then down during tumble
        const t = elapsed / TUMBLE;
        const bounce = Math.sin(t * Math.PI) * 1.2 + Math.abs(Math.sin(t * Math.PI * 3)) * 0.25;
        groupRef.current.position.y = position[1] + bounce;
      } else if (elapsed < TOTAL) {
        // Smooth slerp to target face
        const t = (elapsed - TUMBLE) / SETTLE;
        const eased = 1 - Math.pow(1 - t, 3);
        // Slerp from whatever orientation we ended the tumble with toward target
        // Capture the post-tumble orientation on first frame of settle phase
        // (we approximate by lerping from current toward target each frame).
        meshRef.current.quaternion.slerp(targetQuatRef.current, 0.18 + eased * 0.25);
        // Land bounce: small overshoot
        const settleBounce = (1 - t) * Math.sin(t * Math.PI * 4) * 0.18;
        groupRef.current.position.y = position[1] + Math.max(0, settleBounce);
      } else {
        meshRef.current.quaternion.copy(targetQuatRef.current);
        groupRef.current.position.y = position[1];
        startTimeRef.current = null;
      }
    } else {
      // Idle: gentle hover
      const hover = Math.sin(now * 1.4) * 0.04;
      groupRef.current.position.y = position[1] + hover;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Dice itself */}
      <mesh ref={meshRef} castShadow receiveShadow material={materials}>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
      </mesh>
      {/* Soft glow base */}
      <mesh position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.95, 32]} />
        <meshBasicMaterial color="#ffcc55" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 1.4, 0]} color="#fff1c2" intensity={0.9} distance={4} />
    </group>
  );
}