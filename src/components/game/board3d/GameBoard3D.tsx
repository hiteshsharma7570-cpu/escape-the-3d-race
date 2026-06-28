import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Float,
  Html,
  Sparkles,
  Stars,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { BOARD_TILES } from "@/lib/gameLogic";
import type { Tile } from "@/types/game";
import { DiceMesh } from "./DiceMesh";

// ============================================================================
// LAYOUT MATH
// Tiles are laid out around the perimeter of a square. The board is centered
// on the origin. Position 0 sits at the bottom-left corner and tiles wind
// clockwise (when viewed from above): bottom row right → right side up →
// top row left → left side down.
// ============================================================================

const BOARD_HALF = 9;          // world units from center to outer edge
const TILE_SIZE = 2.6;         // outer face width/depth
const TILE_HEIGHT = 0.55;
const RING_INSET = 0.35;       // gap between tile and outer edge

// World-space position of the dice well (slightly above the central plaza).
const DICE_POS: [number, number, number] = [0, 1.4, 6.2];

function tilesPerSide(total: number) {
  // 4 corners + edges. We treat all tiles equally on a ring.
  // For N=24 → 6 per side. For arbitrary N we distribute as evenly as possible.
  const per = Math.floor(total / 4);
  const extras = total - per * 4;
  return [
    per + (extras > 0 ? 1 : 0),
    per + (extras > 1 ? 1 : 0),
    per + (extras > 2 ? 1 : 0),
    per,
  ];
}

function getTilePosition(index: number, total: number): {
  pos: [number, number, number];
  rotY: number;
} {
  const sides = tilesPerSide(total);
  const edgeLen = (BOARD_HALF - RING_INSET) * 2;

  let side = 0;
  let localIdx = index;
  let acc = 0;
  for (let i = 0; i < 4; i++) {
    if (localIdx < sides[i]) {
      side = i;
      break;
    }
    localIdx -= sides[i];
    acc += sides[i];
  }
  void acc;

  const count = sides[side];
  const step = edgeLen / count;
  const t = step * localIdx + step / 2; // center within slot, range [0, edgeLen)
  const c = edgeLen / 2 - t;            // signed offset from center of side

  // side 0 = bottom (south, +Z), tiles go right (+X)
  // side 1 = right (+X),  tiles go up (-Z)
  // side 2 = top    (-Z), tiles go left (-X)
  // side 3 = left   (-X), tiles go down (+Z)
  const r = BOARD_HALF - RING_INSET - TILE_SIZE / 2;
  switch (side) {
    case 0: return { pos: [-c,  TILE_HEIGHT / 2,  r], rotY: 0 };
    case 1: return { pos: [ r,  TILE_HEIGHT / 2,  c], rotY: -Math.PI / 2 };
    case 2: return { pos: [ c,  TILE_HEIGHT / 2, -r], rotY: Math.PI };
    case 3: return { pos: [-r,  TILE_HEIGHT / 2, -c], rotY: Math.PI / 2 };
    default: return { pos: [0, 0, 0], rotY: 0 };
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

function OceanFloor() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.15 + Math.sin(t * 0.6) * 0.05;
    }
  });
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <circleGeometry args={[40, 64]} />
      <meshStandardMaterial
        color="#08203a"
        emissive="#0a3a6b"
        emissiveIntensity={0.18}
        roughness={0.4}
        metalness={0.7}
      />
    </mesh>
  );
}

function BoardPlate() {
  return (
    <group position={[0, -0.05, 0]}>
      {/* Outer luxury frame */}
      <RoundedBox args={[BOARD_HALF * 2 + 0.6, 0.4, BOARD_HALF * 2 + 0.6]} radius={0.25} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#1a1410" metalness={0.85} roughness={0.25} emissive="#3a2810" emissiveIntensity={0.18} />
      </RoundedBox>
      {/* Gold inlay */}
      <RoundedBox args={[BOARD_HALF * 2 + 0.2, 0.42, BOARD_HALF * 2 + 0.2]} radius={0.22} smoothness={4} position={[0, 0.005, 0]}>
        <meshStandardMaterial color="#c9a14b" metalness={1} roughness={0.18} emissive="#5a3e10" emissiveIntensity={0.4} />
      </RoundedBox>
      {/* Inner board surface */}
      <RoundedBox args={[BOARD_HALF * 2 - 0.1, 0.45, BOARD_HALF * 2 - 0.1]} radius={0.18} smoothness={4} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#0d1828" metalness={0.55} roughness={0.45} emissive="#0a1a30" emissiveIntensity={0.25} />
      </RoundedBox>
    </group>
  );
}

function CityCenter() {
  // Procedural mini-city: a ring of glowing skyscrapers + central plaza.
  const buildings = useMemo(() => {
    const arr: { pos: [number, number, number]; size: [number, number, number]; color: string; emissive: string }[] = [];
    const palette = [
      { c: "#1b2a44", e: "#3b6fa0" },
      { c: "#2a1b44", e: "#7a4fd1" },
      { c: "#1b3a2a", e: "#2dd4a8" },
      { c: "#3a1b2a", e: "#e94560" },
      { c: "#3a2a1b", e: "#f7b733" },
    ];
    const ringRadius = 3.4;
    const N = 14;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r = ringRadius + (Math.random() - 0.5) * 0.6;
      const h = 1.4 + Math.random() * 3.6;
      const w = 0.7 + Math.random() * 0.5;
      const pal = palette[i % palette.length];
      arr.push({
        pos: [Math.cos(a) * r, h / 2, Math.sin(a) * r],
        size: [w, h, w],
        color: pal.c,
        emissive: pal.e,
      });
    }
    // Tall centerpiece tower
    arr.push({ pos: [0, 3.2, 0], size: [1.1, 6.4, 1.1], color: "#0a1626", emissive: "#4f9eff" });
    return arr;
  }, []);

  return (
    <group position={[0, 0.2, 0]}>
      {/* Central plaza disc */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.4, 48]} />
        <meshStandardMaterial color="#0a1a2e" metalness={0.4} roughness={0.5} emissive="#173052" emissiveIntensity={0.4} />
      </mesh>
      {/* Fountain */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.9, 0.3, 24]} />
        <meshStandardMaterial color="#2a64a8" metalness={0.5} roughness={0.3} emissive="#4fa3ff" emissiveIntensity={0.7} />
      </mesh>
      <Sparkles count={30} scale={[1.6, 1.5, 1.6]} position={[0, 0.7, 0]} size={3} speed={0.8} color="#9fd9ff" />

      {buildings.map((b, i) => (
        <RoundedBox
          key={i}
          args={b.size}
          radius={0.06}
          smoothness={2}
          position={b.pos}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={b.color}
            emissive={b.emissive}
            emissiveIntensity={0.7}
            metalness={0.6}
            roughness={0.35}
          />
        </RoundedBox>
      ))}
    </group>
  );
}

interface TileMeshProps {
  tile: Tile;
  index: number;
  total: number;
  isCurrent: boolean;
  wasVisited: boolean;
}

function TileMesh({ tile, index, total, isCurrent, wasVisited }: TileMeshProps) {
  const { pos, rotY } = getTilePosition(index, total);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const targetY = pos[1] + (isCurrent ? 0.25 + Math.sin(t * 3) * 0.08 : 0);
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.15;
    if (matRef.current) {
      const target = isCurrent ? 1.1 : wasVisited ? 0.55 : 0.35;
      matRef.current.emissiveIntensity += (target - matRef.current.emissiveIntensity) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={pos} rotation={[0, rotY, 0]}>
      {/* Glow ring under tile */}
      {isCurrent && (
        <mesh position={[0, -TILE_HEIGHT / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[TILE_SIZE * 0.55, TILE_SIZE * 0.85, 32]} />
          <meshBasicMaterial color={tile.color} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      <RoundedBox
        args={[TILE_SIZE, TILE_HEIGHT, TILE_SIZE]}
        radius={0.18}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          ref={matRef}
          color={tile.color}
          emissive={tile.color}
          emissiveIntensity={0.85}
          metalness={0.5}
          roughness={0.28}
        />
      </RoundedBox>

      {/* Neon outline around tile top — vivid like the reference board */}
      {(["+x", "-x", "+z", "-z"] as const).map((edge) => {
        const len = TILE_SIZE * 0.96;
        const thick = 0.07;
        const offset = TILE_SIZE / 2 - thick / 2;
        const positions: Record<string, [number, number, number]> = {
          "+x": [offset, TILE_HEIGHT / 2 + 0.02, 0],
          "-x": [-offset, TILE_HEIGHT / 2 + 0.02, 0],
          "+z": [0, TILE_HEIGHT / 2 + 0.02, offset],
          "-z": [0, TILE_HEIGHT / 2 + 0.02, -offset],
        };
        const sizes: Record<string, [number, number, number]> = {
          "+x": [thick, 0.05, len],
          "-x": [thick, 0.05, len],
          "+z": [len, 0.05, thick],
          "-z": [len, 0.05, thick],
        };
        return (
          <mesh key={edge} position={positions[edge]}>
            <boxGeometry args={sizes[edge]} />
            <meshBasicMaterial color={tile.color} toneMapped={false} />
          </mesh>
        );
      })}

      {/* HTML overlay: icon + label */}
      <Html
        position={[0, TILE_HEIGHT / 2 + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        transform
        occlude={false}
        distanceFactor={6}
        style={{ pointerEvents: "none" }}
      >
        <div
          className="flex flex-col items-center justify-center text-center select-none"
          style={{
            width: 96,
            height: 96,
            color: "white",
            textShadow: "0 2px 6px rgba(0,0,0,0.85)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 32, lineHeight: 1 }}>{tile.icon}</div>
          <div style={{ fontSize: 11, fontWeight: 800, marginTop: 4, letterSpacing: 0.5 }}>
            {tile.label.toUpperCase()}
          </div>
        </div>
      </Html>

      {/* Particle accent on current tile */}
      {isCurrent && (
        <Sparkles
          count={18}
          scale={[TILE_SIZE * 1.1, 1.2, TILE_SIZE * 1.1]}
          position={[0, 0.6, 0]}
          size={2.5}
          speed={1.2}
          color={tile.color}
        />
      )}
    </group>
  );
}

interface PlayerPawnProps {
  position: number;
  total: number;
}

function PlayerPawn({ position, total }: PlayerPawnProps) {
  const ref = useRef<THREE.Group>(null);
  const { pos } = getTilePosition(position, total);
  const target = useRef(new THREE.Vector3(pos[0], pos[1] + 0.9, pos[2]));

  useEffect(() => {
    const { pos } = getTilePosition(position, total);
    target.current.set(pos[0], pos[1] + 0.9, pos[2]);
  }, [position, total]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.lerp(target.current, 0.18);
    const bob = Math.sin(clock.getElapsedTime() * 4) * 0.08;
    ref.current.position.y = target.current.y + bob;
    ref.current.rotation.y += 0.015;
  });

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        {/* Pawn body */}
        <mesh castShadow position={[0, 0.4, 0]}>
          <coneGeometry args={[0.32, 0.9, 24]} />
          <meshStandardMaterial color="#ffd86b" metalness={0.9} roughness={0.18} emissive="#ffb800" emissiveIntensity={0.5} />
        </mesh>
        <mesh castShadow position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.36, 0.42, 0.18, 24]} />
          <meshStandardMaterial color="#b8841a" metalness={0.95} roughness={0.2} />
        </mesh>
        {/* Halo */}
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.7, 32]} />
          <meshBasicMaterial color="#ffe066" transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 1.2, 0]} color="#ffcc55" intensity={1.4} distance={3.5} />
      </Float>
    </group>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#6090c8" />
      <directionalLight
        position={[10, 14, 8]}
        intensity={1.2}
        color="#fff4d6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <pointLight position={[0, 8, 0]} color="#4f9eff" intensity={1.2} distance={20} />
      <pointLight position={[-10, 4, -10]} color="#ff6b9d" intensity={0.6} distance={18} />
      <pointLight position={[10, 4, 10]} color="#2dd4a8" intensity={0.6} distance={18} />
    </>
  );
}

// ---------------------------------------------------------------------------
// CINEMATIC CAMERA RIG
// ---------------------------------------------------------------------------

export type CameraMode = "default" | "rolling" | "moving" | "victory";

interface CinematicRigProps {
  mode: CameraMode;
  pawnPos: [number, number, number];
}

const DEFAULT_CAM = new THREE.Vector3(18, 20, 22);
const DEFAULT_TGT = new THREE.Vector3(0, 0, 0);

function CinematicCameraRig({ mode, pawnPos }: CinematicRigProps) {
  const { camera } = useThree();
  const desiredPos = useRef(new THREE.Vector3().copy(DEFAULT_CAM));
  const desiredTgt = useRef(new THREE.Vector3().copy(DEFAULT_TGT));
  const currentTgt = useRef(new THREE.Vector3().copy(DEFAULT_TGT));
  const tmp = useRef(new THREE.Vector3());

  // Initial placement
  useEffect(() => {
    camera.position.copy(DEFAULT_CAM);
    camera.lookAt(DEFAULT_TGT);
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();

    // Compute desired pose per mode
    switch (mode) {
      case "rolling": {
        // Zoom in close to the dice well, slight downward tilt
        desiredPos.current.set(DICE_POS[0] + 2.8, DICE_POS[1] + 4.5, DICE_POS[2] + 5.8);
        desiredTgt.current.set(DICE_POS[0], DICE_POS[1] - 0.2, DICE_POS[2]);
        break;
      }
      case "moving": {
        // Trail the pawn from behind-right
        const [px, py, pz] = pawnPos;
        // Offset depending on which side of the board the pawn is on so the
        // camera always sees the city behind it.
        const dirX = px === 0 ? 0 : Math.sign(px);
        const dirZ = pz === 0 ? 0 : Math.sign(pz);
        const offX = dirX === 0 ? 6 : dirX * 8;
        const offZ = dirZ === 0 ? 6 : dirZ * 8;
        desiredPos.current.set(px + offX, py + 9, pz + offZ);
        desiredTgt.current.set(px, py + 0.5, pz);
        break;
      }
      case "victory": {
        // Slow orbit around the pawn
        const radius = 9;
        const speed = 0.4;
        desiredPos.current.set(
          pawnPos[0] + Math.cos(t * speed) * radius,
          pawnPos[1] + 7,
          pawnPos[2] + Math.sin(t * speed) * radius,
        );
        desiredTgt.current.set(pawnPos[0], pawnPos[1] + 0.6, pawnPos[2]);
        break;
      }
      case "default":
      default: {
        desiredPos.current.copy(DEFAULT_CAM);
        desiredTgt.current.copy(DEFAULT_TGT);
        break;
      }
    }

    // Smoothly approach desired pose
    const posLerp = mode === "rolling" ? 0.12 : mode === "moving" ? 0.1 : 0.06;
    const tgtLerp = posLerp;
    camera.position.lerp(desiredPos.current, posLerp);
    currentTgt.current.lerp(desiredTgt.current, tgtLerp);
    camera.lookAt(currentTgt.current);

    // Subtle handheld micro-shake during rolling for cinematic energy
    if (mode === "rolling") {
      tmp.current.set(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
      );
      camera.position.add(tmp.current);
    }
    void dt;
  });

  return null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface GameBoard3DProps {
  currentPosition: number;
  diceValue: number | null;
  /** Increments by 1 each time the user clicks Roll. Used to retrigger the
   *  dice tumble + cinematic even when the value repeats. */
  rollSeq?: number;
  /** Game-won flag — triggers the victory orbit camera. */
  isVictory?: boolean;
}

export function GameBoard3D({
  currentPosition,
  diceValue,
  rollSeq = 0,
  isVictory = false,
}: GameBoard3DProps) {
  // Step-by-step pawn animation: walk through each tile rather than teleport.
  const [displayedPosition, setDisplayedPosition] = useState(currentPosition);
  const [visited, setVisited] = useState<Set<number>>(new Set([currentPosition]));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (displayedPosition === currentPosition) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayedPosition((prev) => {
        if (prev === currentPosition) return prev;
        const next = (prev + 1) % BOARD_TILES.length;
        setVisited((v) => new Set(v).add(next));
        return next;
      });
    }, 280);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedPosition, currentPosition]);

  const total = BOARD_TILES.length;
  const currentTile = BOARD_TILES[displayedPosition];

  // ---- Cinematic state machine ----
  // rolling: dice is tumbling   (1.5s after a fresh rollSeq)
  // moving:  pawn is walking    (until displayedPosition reaches currentPosition)
  // victory: win condition reached
  // default: idle isometric
  const [cinematic, setCinematic] = useState<CameraMode>("default");
  const lastRollSeqRef = useRef(rollSeq);
  const rollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (rollSeq === lastRollSeqRef.current) return;
    lastRollSeqRef.current = rollSeq;
    setCinematic("rolling");
    if (rollingTimerRef.current) clearTimeout(rollingTimerRef.current);
    rollingTimerRef.current = setTimeout(() => {
      // After dice settles, follow the pawn
      setCinematic("moving");
    }, 1500);
    return () => {
      if (rollingTimerRef.current) clearTimeout(rollingTimerRef.current);
    };
  }, [rollSeq]);

  // When the pawn finishes its walk, drop back to default (or victory)
  useEffect(() => {
    if (cinematic !== "moving") return;
    if (displayedPosition === currentPosition) {
      const id = setTimeout(() => {
        setCinematic(isVictory ? "victory" : "default");
      }, 600);
      return () => clearTimeout(id);
    }
  }, [cinematic, displayedPosition, currentPosition, isVictory]);

  // Force victory orbit once the win flag flips
  useEffect(() => {
    if (isVictory) setCinematic("victory");
    else if (cinematic === "victory") setCinematic("default");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVictory]);

  // Compute pawn world position for camera targeting
  const pawnWorld = useMemo<[number, number, number]>(() => {
    const { pos } = getTilePosition(displayedPosition, total);
    return [pos[0], pos[1] + 0.9, pos[2]];
  }, [displayedPosition, total]);

  return (
    <div className="relative w-full mx-auto rounded-2xl overflow-hidden ring-1 ring-amber-500/30 shadow-2xl"
         style={{ aspectRatio: "1 / 1", maxWidth: 720, background: "radial-gradient(ellipse at top, #0a1a3a 0%, #050a18 70%)" }}>

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [18, 20, 22], fov: 38, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <CinematicCameraRig mode={cinematic} pawnPos={pawnWorld} />
        <color attach="background" args={["#040814"]} />
        <fog attach="fog" args={["#040814", 35, 80]} />
        <Suspense fallback={null}>
          <Lighting />
          <Stars radius={80} depth={50} count={1200} factor={4} fade speed={0.6} />

          <Float speed={1.1} rotationIntensity={0} floatIntensity={0.08}>
            <group>
              <OceanFloor />
              <BoardPlate />
              <CityCenter />
              {BOARD_TILES.map((tile, i) => (
                <TileMesh
                  key={tile.id}
                  tile={tile}
                  index={i}
                  total={total}
                  isCurrent={displayedPosition === i}
                  wasVisited={visited.has(i)}
                />
              ))}
              <PlayerPawn position={displayedPosition} total={total} />
              <DiceMesh
                value={diceValue}
                rollSeq={rollSeq}
                position={DICE_POS}
              />
            </group>
          </Float>

          <ContactShadows
            position={[0, -0.25, 0]}
            opacity={0.55}
            scale={28}
            blur={2.4}
            far={10}
          />
        </Suspense>
      </Canvas>

      {/* HUD overlay above 3D scene */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-black/55 backdrop-blur-md ring-1 ring-amber-400/40 text-amber-100 text-xs tracking-[0.25em] uppercase font-semibold">
          {currentTile?.label ?? "—"}
        </div>
      </div>
      {diceValue !== null && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-4 py-1.5 rounded-full bg-amber-500/25 backdrop-blur-md ring-1 ring-amber-300/60 text-amber-50 text-sm font-bold">
            🎲 Rolled {diceValue}
          </div>
        </div>
      )}
    </div>
  );
}

export default GameBoard3D;