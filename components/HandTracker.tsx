import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store';

const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const setExpansion = useStore((state) => state.setExpansion);
  
  // Refs to keep track without causing re-renders
  const lastVideoTime = useRef(-1);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const initLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
      
      setLoaded(true);
      startWebcam();
    };

    initLandmarker();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const drawHand = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17], [0, 17] // Palm
    ];

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';

    // Draw connections
    for (const [start, end] of connections) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      ctx.beginPath();
      ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
      ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
      ctx.stroke();
    }

    // Draw points
    for (const p of landmarks) {
       ctx.beginPath();
       ctx.arc(p.x * ctx.canvas.width, p.y * ctx.canvas.height, 3, 0, 2 * Math.PI);
       ctx.fill();
    }
  };

  const predictWebcam = () => {
    if (!landmarkerRef.current || !videoRef.current) return;

    const now = performance.now();
    if (now - lastVideoTime.current >= 30) { 
        lastVideoTime.current = now;
        
        const results = landmarkerRef.current.detectForVideo(videoRef.current, now);
        
        // Draw logic
        const canvas = canvasRef.current;
        if (canvas) {
           const ctx = canvas.getContext('2d');
           if (ctx) {
              // Ensure canvas matches video dimensions
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              if (results.landmarks) {
                for (const landmarks of results.landmarks) {
                  drawHand(ctx, landmarks);
                }
              }
           }
        }
        
        // Logic: 
        // If 2 hands: Calculate distance between Wrist (0) of hand 1 and Wrist (0) of hand 2
        if (results.landmarks && results.landmarks.length === 2) {
             const hand1 = results.landmarks[0][0]; // Wrist
             const hand2 = results.landmarks[1][0]; // Wrist
             
             // Simple Euclidean distance in normalized coords (0-1)
             const dx = hand1.x - hand2.x;
             const dy = hand1.y - hand2.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             // Normalize distance. Usually hands apart is ~0.8, hands together ~0.1
             // Map 0.1->0.7 to 0->1
             const expansion = Math.min(Math.max((dist - 0.15) * 2.5, 0), 2.5);
             
             setExpansion(expansion, true);
        } else if (results.landmarks && results.landmarks.length === 1) {
            // Fallback for single hand: Thumb Tip (4) to Index Tip (8) distance
            const hand = results.landmarks[0];
            const thumb = hand[4];
            const index = hand[8];
            const dx = thumb.x - index.x;
            const dy = thumb.y - index.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Pinch = 0, Open = 1
            const expansion = Math.min(Math.max((dist - 0.05) * 5, 0), 1.5);
            setExpansion(expansion, true);
        } else {
             setExpansion(0, false);
        }
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-64 h-48 rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.6)] bg-black/80 backdrop-blur-md">
      {!loaded && <div className="absolute inset-0 flex items-center justify-center text-xs text-white/50 animate-pulse">Initializing Vision...</div>}
      
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-60" 
      />
      
      {/* Canvas Overlay for Skeleton */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
      />
      
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
         <div className="flex items-center gap-2 justify-center">
            <div className={`w-2 h-2 rounded-full ${loaded ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-mono text-white/80 tracking-wider">GESTURE INPUT</span>
         </div>
      </div>
    </div>
  );
};

export default HandTracker;