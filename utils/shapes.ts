import * as THREE from 'three';
import { ShapeType } from '../types';

export const generateParticles = (shape: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const idx = i * 3;

    switch (shape) {
      case ShapeType.SPHERE: {
        // Uniform sphere distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 4 + Math.random() * 0.5;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      
      case ShapeType.HEART: {
        // 3D Heart approximation
        // Using a distribution logic to fill volume
        let done = false;
        while (!done) {
            const tx = (Math.random() - 0.5) * 6; // range -3 to 3
            const ty = (Math.random() - 0.5) * 6;
            const tz = (Math.random() - 0.5) * 6;
            
            // Heart equation: (x^2 + 9y^2/4 + z^2 - 1)^3 - x^2*z^3 - 9y^2*z^3/80 <= 0
            // Scaled up for visibility
            const sx = tx; 
            const sy = ty; 
            const sz = tz;
            
            const a = sx * sx + (9/4) * sy * sy + sz * sz - 1;
            if (a * a * a - sx * sx * sz * sz * sz - (9/80) * sy * sy * sz * sz * sz <= 0) {
                x = tx * 3.5;
                y = ty * 3.5;
                z = tz * 3.5;
                done = true;
            }
        }
        break;
      }

      case ShapeType.SATURN: {
        // Planet + Ring
        const isRing = Math.random() > 0.4; // 60% ring
        if (isRing) {
             const angle = Math.random() * Math.PI * 2;
             const r = 6 + Math.random() * 3; // Ring radius 6-9
             x = r * Math.cos(angle);
             z = r * Math.sin(angle);
             y = (Math.random() - 0.5) * 0.2; // Thin ring
        } else {
             // Planet
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 3;
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        }
        // Tilt Saturn
        const tilt = Math.PI / 6;
        const _x = x * Math.cos(tilt) - y * Math.sin(tilt);
        const _y = x * Math.sin(tilt) + y * Math.cos(tilt);
        x = _x;
        y = _y;
        break;
      }
      
      case ShapeType.FLOWER: {
        // 3D Rose/Flower shape
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        // Rose curve modulation
        const k = 5; // petals
        const r = 3 + Math.cos(k * u) * 2 * Math.sin(v);
        
        x = r * Math.sin(v) * Math.cos(u);
        y = r * Math.sin(v) * Math.sin(u);
        z = r * Math.cos(v) * 0.5; // flatten z slightly
        break;
      }

      case ShapeType.TORUS: {
         const u = Math.random() * Math.PI * 2;
         const v = Math.random() * Math.PI * 2;
         const R = 5; // Major radius
         const r = 1.5; // Minor radius
         
         x = (R + r * Math.cos(v)) * Math.cos(u);
         y = (R + r * Math.cos(v)) * Math.sin(u);
         z = r * Math.sin(v);
         break;
      }
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }
  
  return positions;
};
