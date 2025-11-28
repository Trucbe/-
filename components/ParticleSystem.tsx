import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { generateParticles } from '../utils/shapes';

const ParticleSystem: React.FC = () => {
  const { config, gestureState } = useStore();
  const pointsRef = useRef<THREE.Points>(null);
  
  // Memoize geometry generation
  const positions = useMemo(() => {
    return generateParticles(config.shape, config.count);
  }, [config.shape, config.count]);

  // Create a buffer for original positions to reference during animation
  const originalPositions = useMemo(() => {
    return positions.slice();
  }, [positions]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Smooth lerp of expansion factor
    const target = gestureState.handsPresent ? gestureState.expansion : 0.2; // Idle breathe 0.2
    
    // Smooth the current expansion value
    gestureState.currentExpansion = THREE.MathUtils.lerp(
        gestureState.currentExpansion,
        target,
        delta * 3 // Smoothing speed
    );

    const expansion = gestureState.currentExpansion;
    const time = state.clock.getElapsedTime();

    const positionsAttribute = pointsRef.current.geometry.attributes.position;
    const array = positionsAttribute.array as Float32Array;
    
    // Animate points
    for (let i = 0; i < config.count; i++) {
      const idx = i * 3;
      const ox = originalPositions[idx];
      const oy = originalPositions[idx + 1];
      const oz = originalPositions[idx + 2];

      // Base idle movement (breathing/rotating)
      const noise = Math.sin(time * 0.5 + i * 0.1) * 0.1;
      
      // Calculate Expansion Direction
      // Move away from center (0,0,0) based on expansion factor
      // We multiply the position by (1 + expansion * factor)
      
      const scale = 1 + (expansion * 1.5) + noise;

      // Rotation around Y axis for dynamic feel
      const rotSpeed = 0.1 + (expansion * 0.5); // Spin faster when expanded
      const angle = time * rotSpeed;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // Rotate basic coordinates
      const rx = ox * cos - oz * sin;
      const rz = ox * sin + oz * cos;
      const ry = oy;

      array[idx] = rx * scale;
      array[idx + 1] = ry * scale;
      array[idx + 2] = rz * scale;
    }
    
    positionsAttribute.needsUpdate = true;
    
    // Pulse color slightly
    if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        // Simple opacity pulse
        // pointsRef.current.material.opacity = 0.6 + Math.sin(time) * 0.2;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={config.count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        color={config.color}
        size={config.size}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleSystem;
