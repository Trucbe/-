import React from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import HandTracker from './components/HandTracker';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* Logic Layer (Invisible/Overlay) */}
      <HandTracker />

      {/* UI Layer */}
      <div className="relative z-10 w-full h-full pointer-events-none">
         <UI />
      </div>
    </div>
  );
};

export default App;
