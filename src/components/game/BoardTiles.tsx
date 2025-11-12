import { BOARD_TILES } from "@/lib/gameLogic";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export const BoardTiles = () => {
  const tilesPerRow = 4;
  const spacing = 2.5;

  return (
    <group>
      {BOARD_TILES.map((tile, index) => {
        const row = Math.floor(index / tilesPerRow);
        const col = index % tilesPerRow;
        
        let x = 0;
        let z = 0;

        if (row === 0) {
          x = col * spacing - (tilesPerRow - 1) * spacing / 2;
          z = spacing * 1.5;
        } else if (row === 1) {
          x = spacing * 1.5;
          z = spacing * 1.5 - (index - tilesPerRow) * spacing;
        } else if (row === 2) {
          x = spacing * 1.5 - (index - tilesPerRow * 2) * spacing;
          z = -spacing * 1.5;
        } else {
          x = -spacing * 1.5;
          z = -spacing * 1.5 + (index - tilesPerRow * 3) * spacing;
        }

        return (
          <group key={tile.id} position={[x, 0, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[2, 2, 0.3]} />
              <meshStandardMaterial color={tile.color} />
            </mesh>
            <Text
              position={[0, 0.2, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.25}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.8}
              textAlign="center"
              font="/fonts/Inter-Bold.woff"
            >
              {tile.label}
            </Text>
          </group>
        );
      })}
      
      {/* Board base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </group>
  );
};
