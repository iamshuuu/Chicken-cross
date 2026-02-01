import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

type CoinProps = {
    position: [number, number, number];
    type?: 'coin' | 'gem';
    onCollect?: () => void;
};

export const Coin = React.memo(({ position, type = 'coin', onCollect }: CoinProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    const color = type === 'coin' ? '#FFD700' : '#A855F7'; // Gold or Purple
    const value = type === 'coin' ? 10 : 50;

    // Floating and spinning animation
    useFrame((state) => {
        if (meshRef.current && glowRef.current) {
            const time = state.clock.getElapsedTime();

            // Spin
            meshRef.current.rotation.y += 0.05;
            glowRef.current.rotation.y += 0.05;

            // Bob up and down
            const bobHeight = Math.sin(time * 3) * 0.1;
            meshRef.current.position.y = position[1] + 0.5 + bobHeight;
            glowRef.current.position.y = position[1] + 0.5 + bobHeight;

            // Pulse glow
            const glowScale = 1 + Math.sin(time * 2) * 0.1;
            glowRef.current.scale.set(glowScale, glowScale, glowScale);
        }
    });

    return (
        <group position={[position[0], 0, position[2]]}>
            {/* Glow effect */}
            <mesh ref={glowRef} position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Main coin */}
            <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 0.08, 16]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.8}
                    roughness={0.2}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Center emblem (optional decoration) */}
            {type === 'coin' && (
                <mesh position={[0, 0.5, 0.05]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.02, 8]} />
                    <meshStandardMaterial color="#FFA500" />
                </mesh>
            )}
        </group>
    );
});

Coin.displayName = 'Coin';
