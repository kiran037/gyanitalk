"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";

const getSunPositionForTithi = (tithiObj: any) => {
  if (!tithiObj) return new THREE.Vector3(5, 0, 5); 

  let tithiNumber = tithiObj.number;
  
  if (tithiObj.paksha === "Krishna" || tithiObj.type?.includes("Krishna")) {
     if (tithiNumber <= 15) tithiNumber += 15; 
  }

  const angle = (tithiNumber / 30) * Math.PI * 2; 

  const r = 8;
  const x = r * Math.sin(angle - Math.PI); 
  const z = r * Math.cos(angle - Math.PI);

  return new THREE.Vector3(x, 0, z);
};

function Moon({ tithi }: { tithi: any }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const [colorMap, displacementMap] = useLoader(TextureLoader, [
    "/textures/moon-texture.jpg",
    "/textures/moon-displacement.jpg"
  ]);

  const sunPosition = useMemo(() => getSunPositionForTithi(tithi), [tithi]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <>
      <directionalLight 
        position={sunPosition} 
        intensity={2.5} 
        castShadow 
      />
      
      <ambientLight intensity={0.05} />

      <mesh ref={meshRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        {/* Reduced radius from 2.2 to 1.8 for better mobile fit */}
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap}
          displacementMap={displacementMap}
          displacementScale={0.05}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
    </>
  );
}

interface CosmicSceneProps {
  tithi: any;
  className?: string;
}

export default function CosmicScene({ tithi, className }: CosmicSceneProps) {
  return (
    <div className={className}>
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }} 
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Moon tithi={tithi} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}