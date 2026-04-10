"use client";
import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════
   PARTICLE FIELD — thousands of floating particles
   ═══════════════════════════════════════════ */
function ParticleField({ count = 2000 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const neonColors = [
      [0, 1, 0.82],    // #00FFD1
      [0.3, 0.49, 1],  // #4D7CFF
      [1, 0.24, 0.44], // #FF3D71
      [0.71, 0.3, 1],  // #B44DFF
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      const c = neonColors[Math.floor(Math.random() * neonColors.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
      siz[i] = Math.random() * 3 + 0.5;
    }
    return { positions: pos, colors: col, sizes: siz };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════
   FLOATING ORB — glowing distorted sphere
   ═══════════════════════════════════════════ */
function GlowOrb({ position, color, size = 1, speed = 1 }: { position: [number, number, number]; color: string; size?: number; speed?: number }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
    mesh.current.rotation.z = state.clock.elapsedTime * 0.2 * speed;
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.4} floatIntensity={1.5} floatingRange={[-0.3, 0.3]}>
      <mesh ref={mesh} position={position} scale={size}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

/* ═══════════════════════════════════════════
   WIREFRAME TORUS — rotating ring
   ═══════════════════════════════════════════ */
function WireRing({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.15;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <Float speed={0.8} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={mesh} position={position} scale={size}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </Float>
  );
}

/* ═══════════════════════════════════════════
   GEOMETRIC CRYSTAL — low-poly floating shape
   ═══════════════════════════════════════════ */
function Crystal({ position, color, size = 0.5 }: { position: [number, number, number]; color: string; size?: number }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.4;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={2}>
      <mesh ref={mesh} position={position} scale={size}>
        <octahedronGeometry args={[1, 0]} />
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.12}
          wireframe
          factor={0.3}
          speed={1}
        />
      </mesh>
    </Float>
  );
}

/* ═══════════════════════════════════════════
   ENERGY BEAM — connecting line between points
   ═══════════════════════════════════════════ */
function EnergyBeam() {
  const groupRef = useRef<THREE.Group>(null);

  const lineObj = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      pts.push(
        new THREE.Vector3(
          Math.sin(t * Math.PI * 2) * 4,
          (t - 0.5) * 8,
          Math.cos(t * Math.PI * 2) * 4
        )
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const material = new THREE.LineBasicMaterial({ color: "#00FFD1", transparent: true, opacity: 0.08 });
    return new THREE.Line(geometry, material);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      <primitive object={lineObj} />
    </group>
  );
}

/* ═══════════════════════════════════════════
   CAMERA RIG — slow cinematic movement
   ═══════════════════════════════════════════ */
function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.05) * 1.5;
    state.camera.position.y = Math.cos(t * 0.03) * 0.5;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ═══════════════════════════════════════════
   MOUSE FOLLOWER — subtle interactive parallax
   ═══════════════════════════════════════════ */
function MouseFollower() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const x = state.pointer.x * 0.5;
    const y = state.pointer.y * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.3, 0.02);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.2, 0.02);
  });

  return <group ref={groupRef} />;
}

/* ═══════════════════════════════════════════
   MAIN SCENE — Hero 3D Background
   ═══════════════════════════════════════════ */
function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} color="#00FFD1" intensity={0.5} />
      <pointLight position={[-5, -3, 3]} color="#4D7CFF" intensity={0.3} />
      <pointLight position={[0, 3, -5]} color="#FF3D71" intensity={0.2} />

      <CameraRig />

      {/* Star field background */}
      <Stars radius={50} depth={80} count={3000} factor={3} saturation={0.5} fade speed={0.5} />

      {/* Particle cloud */}
      <ParticleField count={1500} />

      {/* Glowing orbs */}
      <GlowOrb position={[-3, 1.5, -2]} color="#00FFD1" size={1.2} speed={0.8} />
      <GlowOrb position={[3.5, -1, -3]} color="#4D7CFF" size={0.9} speed={1.2} />
      <GlowOrb position={[0, 2.5, -4]} color="#B44DFF" size={0.7} speed={0.6} />

      {/* Wire rings */}
      <WireRing position={[2, 0, -1]} color="#00FFD1" size={2} />
      <WireRing position={[-2, -1.5, -3]} color="#4D7CFF" size={1.5} />

      {/* Crystals */}
      <Crystal position={[-4, 2, -5]} color="#FF3D71" size={0.6} />
      <Crystal position={[4, -2, -4]} color="#00FFD1" size={0.5} />
      <Crystal position={[1, 3, -6]} color="#B44DFF" size={0.4} />

      {/* Energy helix */}
      <EnergyBeam />

      {/* Fog for depth */}
      <fog attach="fog" args={["#030711", 5, 25]} />
    </>
  );
}

/* ═══════════════════════════════════════════
   MINI SCENE — Smaller ambient 3D for sections
   ═══════════════════════════════════════════ */
function MiniScene() {
  return (
    <>
      <ambientLight intensity={0.05} />
      <pointLight position={[3, 3, 3]} color="#00FFD1" intensity={0.3} />
      <Stars radius={30} depth={50} count={1000} factor={2} saturation={0.3} fade speed={0.3} />
      <ParticleField count={500} />
      <GlowOrb position={[0, 0, -2]} color="#4D7CFF" size={0.8} speed={0.5} />
      <fog attach="fog" args={["#030711", 3, 15]} />
    </>
  );
}

/* ═══════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════ */

export function HeroBg3D() {
  const [ready, setReady] = useState(false);
  return (
    <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => setReady(true)}
        style={{ background: 'transparent' }}
      >
        <HeroScene />
      </Canvas>
    </div>
  );
}

export function SectionBg3D() {
  return (
    <div className="absolute inset-0 z-0 opacity-40">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <MiniScene />
      </Canvas>
    </div>
  );
}
