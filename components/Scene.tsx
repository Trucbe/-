import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import ParticleSystem from './ParticleSystem';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const Scene: React.FC = () => {
  return (
    <div className="w-full h-full bg-black">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 2]} // Optimize for high DPI
      >
        <color attach="background" args={['#050505']} />
        
        <Suspense fallback={null}>
          <ParticleSystem />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={true} minDistance={5} maxDistance={40} />
        
        {/* Post Processing for the "Magic" glow */}
        <EffectComposer enableNormalPass={false}>
           <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.5} radius={0.4} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default Scene;