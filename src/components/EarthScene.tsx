import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import earthDay from "@/assets/earth-day.jpg";
import earthNight from "@/assets/earth-night.jpg";
import earthClouds from "@/assets/earth-clouds.jpg";

function Earth() {
  const group = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const [dayMap, nightMap, cloudMap] = useLoader(THREE.TextureLoader, [
    earthDay,
    earthNight,
    earthClouds,
  ]);

  // improve texture sampling
  useMemo(() => {
    [dayMap, nightMap, cloudMap].forEach((t) => {
      t.anisotropy = 8;
      t.colorSpace = THREE.SRGBColorSpace;
    });
  }, [dayMap, nightMap, cloudMap]);

  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.04;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.055;
    if (group.current) {
      const t = state.clock.elapsedTime;
      group.current.position.y = Math.sin(t * 0.4) * 0.15;
      group.current.rotation.z = Math.sin(t * 0.2) * 0.03;
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.015;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group} position={[2.2, -0.2, 0]}>
      {/* Atmosphere glow */}
      <mesh ref={glowRef} scale={1.18}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{ c: { value: new THREE.Color("#5ec8ff") } }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            uniform vec3 c;
            void main() {
              float intensity = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
              gl_FragColor = vec4(c, 1.0) * intensity;
            }
          `}
        />
      </mesh>

      {/* Earth surface */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.6, 96, 96]} />
        <meshStandardMaterial
          map={dayMap}
          emissiveMap={nightMap}
          emissive={new THREE.Color("#ffb86b")}
          emissiveIntensity={0.7}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef} scale={1.012}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial
          map={cloudMap}
          transparent
          opacity={0.45}
          depthWrite={false}
          alphaMap={cloudMap}
        />
      </mesh>
    </group>
  );
}

function Particles({ count = 220 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      a[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      a[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      a[i * 3 + 2] = r * Math.cos(phi);
    }
    return a;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#9be8ff"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function CameraParallax() {
  useFrame(({ camera, pointer, clock }) => {
    const t = clock.elapsedTime;
    const tx = pointer.x * 0.6 + Math.sin(t * 0.15) * 0.2;
    const ty = pointer.y * 0.4 + Math.cos(t * 0.12) * 0.15;
    camera.position.x += (tx - camera.position.x) * 0.03;
    camera.position.y += (ty - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function EarthScene() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#03060f"]} />
        <fog attach="fog" args={["#03060f", 9, 22]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[-5, 2, 5]} intensity={2.2} color="#ffffff" />
        <pointLight position={[6, -2, -4]} intensity={1.2} color="#7c3aed" />

        <Suspense fallback={null}>
          <Stars radius={80} depth={50} count={4500} factor={3.5} saturation={0} fade speed={0.6} />
          <Particles />
          <Earth />
        </Suspense>
        <CameraParallax />
      </Canvas>
      {/* Vignette + radial overlay for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(230_45%_3%/0.85)_100%)]" />
    </div>
  );
}
