import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useRef } from 'react';

const gold = { color: '#C9A45C', metalness: 1, roughness: 0.28 };

function Blade({ flip }) {
  const g = useRef();
  useFrame(({ clock }) => {
    const open = 0.18 + Math.sin(clock.elapsedTime * 0.9) * 0.1;
    g.current.rotation.z = (flip ? -1 : 1) * open;
  });
  return (
    <group ref={g}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.16, 2.4, 0.05]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <mesh position={[flip ? 0.4 : -0.4, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.07, 16, 40]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <mesh position={[flip ? 0.2 : -0.2, -0.75, 0]} rotation={[0, 0, flip ? 0.4 : -0.4]}>
        <boxGeometry args={[0.1, 1.2, 0.07]} />
        <meshStandardMaterial {...gold} />
      </mesh>
    </group>
  );
}

function Rig() {
  const ref = useRef();
  useFrame(({ pointer, clock }) => {
    ref.current.rotation.y += ((pointer.x * 0.6 + Math.sin(clock.elapsedTime * 0.3) * 0.25) - ref.current.rotation.y) * 0.05;
    ref.current.rotation.x += ((-pointer.y * 0.3) - ref.current.rotation.x) * 0.05;
  });
  return (
    <group ref={ref} rotation={[0, 0, -0.5]}>
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.8}>
        <Blade /><Blade flip />
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.14, 24]} /><meshStandardMaterial color="#E8D5A5" metalness={1} roughness={0.2} /></mesh>
      </Float>
    </group>
  );
}

export default function ScissorsScene() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 6.5], fov: 40 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 5]} intensity={3} color="#fff1d0" />
      <pointLight position={[-4, -2, 3]} intensity={25} color="#C9A45C" />
      <Rig />
    </Canvas>
  );
}
