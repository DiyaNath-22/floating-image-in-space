import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ImageParticles({ imageUrl = '/girl.png' }) {
  const pointsRef = useRef();
  const [particleData, setParticleData] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');

      // Calculate scale to limit particle count (e.g. max 350 width for higher density)
      const maxWidth = 40000;
      const scale = Math.min(1, maxWidth / img.width);
      const width = Math.floor(img.width * scale);
      const height = Math.floor(img.height * scale);

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        const positions = [];
        const colors = [];
        const originalPositions = [];

        // Loop through pixels
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;
            const a = data[i + 3] / 255;

            // Only add points for non-transparent pixels
            if (a > 0.1) {
              // Map pixel positions into 3D space. Reverse Y so image isn't upside down.
              const px = (x - width / 2) * 0.015;
              const py = -(y - height / 2) * 0.015;
              // Add slight random z depth for a 3D effect
              const pz = (Math.random() - 0.5) * 0.5;

              positions.push(px, py, pz);
              originalPositions.push(px, py, pz);

              // Enhance the "colorful stars" aspect
              const color = new THREE.Color(r, g, b);
              const hsl = {};
              color.getHSL(hsl);
              // Make colors more vibrant and glowing
              color.setHSL(hsl.h, Math.min(1, hsl.s * 1.5), Math.max(0.4, hsl.l));

              colors.push(color.r, color.g, color.b);
            }
          }
        }

        setParticleData({
          positions: new Float32Array(positions),
          colors: new Float32Array(colors),
          originalPositions: new Float32Array(originalPositions)
        });
      } catch (e) {
        console.error("Error drawing image onto canvas", e);
      }
    };

    img.onerror = () => {
      console.error("Failed to load image:", imageUrl, ". Please ensure it exists in the public directory.");
    };
  }, [imageUrl]);

  useFrame((state) => {
    if (!pointsRef.current || !particleData) return;

    const geometry = pointsRef.current.geometry;
    const positions = geometry.attributes.position.array;
    const time = state.clock.getElapsedTime();

    // Add floating/twinkling effect
    for (let i = 0; i < positions.length; i += 3) {
      const origX = particleData.originalPositions[i];
      const origY = particleData.originalPositions[i + 1];
      const origZ = particleData.originalPositions[i + 2];

      // Calculate a slow wavy offset based on original position and time
      const offset = Math.sin(time * 2 + origX * 2 + origY) * 0.05;

      positions[i] = origX;
      positions[i + 1] = origY + offset;
      positions[i + 2] = origZ + Math.cos(time + origX) * 0.05;
    }

    geometry.attributes.position.needsUpdate = true;

    // Slowly rotate the entire system for a parallax effect
    pointsRef.current.rotation.y = Math.sin(time * 0.4) * 0.15;
    pointsRef.current.rotation.x = Math.cos(time * 0.3) * 0.05;
  });

  if (!particleData) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleData.positions.length / 3}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleData.colors.length / 3}
          array={particleData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        vertexColors={true}
        transparent={true}
        opacity={0.99}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}
