import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ImageParticles from './components/ImageParticles';

function App() {
  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 7] }}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <Suspense fallback={null}>
            <ImageParticles imageUrl="/girl.jpeg" />
          </Suspense>
          <OrbitControls enableZoom={true} enablePan={true} autoRotate={true} autoRotateSpeed={0.5} />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
