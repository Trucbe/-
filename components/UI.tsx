import React from 'react';
import { useStore } from '../store';
import { ShapeType } from '../types';
import { Maximize2, Eye, EyeOff, Camera, Sliders } from 'lucide-react';

const UI: React.FC = () => {
  const { config, setConfig, uiVisible, toggleUI, gestureState } = useStore();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (!uiVisible) {
      return (
          <button 
            onClick={toggleUI}
            className="fixed top-4 left-4 p-2 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20 transition-all pointer-events-auto"
          >
              <Eye size={20} />
          </button>
      )
  }

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 font-sans tracking-tight">
                Particle Genesis
            </h1>
            <p className="text-xs text-white/50 max-w-xs">
                Use your webcam. Spread hands to expand universe. Pinch to contract.
            </p>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={toggleUI}
                className="p-3 bg-white/5 backdrop-blur-md rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all border border-white/10"
                title="Hide UI"
            >
                <EyeOff size={18} />
            </button>
            <button 
                onClick={toggleFullscreen}
                className="p-3 bg-white/5 backdrop-blur-md rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all border border-white/10"
                title="Fullscreen"
            >
                <Maximize2 size={18} />
            </button>
        </div>
      </div>

      {/* Main Controls Panel */}
      <div className="pointer-events-auto w-full max-w-md self-start bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-4 shadow-2xl transform transition-all">
        
        <div className="flex items-center gap-2 mb-6 text-white/90">
            <Sliders size={18} className="text-purple-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Configuration</h2>
        </div>

        {/* Shapes Grid */}
        <div className="mb-6">
            <label className="text-xs text-white/40 font-semibold uppercase mb-3 block">Base Geometry</label>
            <div className="grid grid-cols-3 gap-2">
                {Object.values(ShapeType).map((shape) => (
                    <button
                        key={shape}
                        onClick={() => setConfig({ shape })}
                        className={`py-2 px-3 text-sm rounded-md transition-all border ${
                            config.shape === shape 
                            ? 'bg-purple-600/50 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                            : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {shape}
                    </button>
                ))}
            </div>
        </div>

        {/* Color Picker */}
        <div className="mb-6">
             <label className="text-xs text-white/40 font-semibold uppercase mb-3 block">Particle Color</label>
             <div className="flex gap-3 items-center bg-white/5 p-2 rounded-lg border border-white/10">
                <input 
                    type="color" 
                    value={config.color} 
                    onChange={(e) => setConfig({ color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-none" 
                />
                <span className="text-white/80 font-mono text-sm">{config.color}</span>
             </div>
        </div>
        
        {/* Sliders */}
        <div className="space-y-4">
            <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Density</span>
                    <span className="text-white/40">{config.count} pts</span>
                </div>
                <input 
                    type="range" 
                    min="1000" 
                    max="15000" 
                    step="1000"
                    value={config.count}
                    onChange={(e) => setConfig({ count: parseInt(e.target.value) })}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:rounded-full"
                />
            </div>
             <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Particle Size</span>
                    <span className="text-white/40">{config.size.toFixed(2)}</span>
                </div>
                <input 
                    type="range" 
                    min="0.01" 
                    max="0.5" 
                    step="0.01"
                    value={config.size}
                    onChange={(e) => setConfig({ size: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:rounded-full"
                />
            </div>
        </div>

      </div>

      {/* Status Footer */}
      <div className="flex justify-center w-full pointer-events-none">
          <div className={`px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-500 ${
              gestureState.handsPresent 
              ? 'bg-green-500/20 border-green-500/50 text-green-200' 
              : 'bg-white/5 border-white/10 text-white/30'
          }`}>
              <div className="flex items-center gap-2 text-xs font-medium">
                  <Camera size={14} className={gestureState.handsPresent ? 'animate-pulse' : ''} />
                  {gestureState.handsPresent ? "HANDS DETECTED - CONTROL ACTIVE" : "WAITING FOR HANDS..."}
              </div>
          </div>
      </div>
    </div>
  );
};

export default UI;