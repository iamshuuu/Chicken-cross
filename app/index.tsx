import { Coin } from '@/components/entities/Coin';
import { GameOverScreen } from '@/components/ui/GameOverScreen';
import { HUD } from '@/components/ui/HUD';
import { PauseMenu } from '@/components/ui/PauseMenu';
import { COLORS, GAME_CONFIG } from '@/constants/config';
import { useAudio } from '@/hooks/useAudio';
import type { Collectible, CollectibleType, Direction, GameState, GameStats, LaneType, ObstacleType, WaterObjType } from '@/types/game';
import { OrthographicCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import * as THREE from 'three';

// ---VISUAL ASSETS ---

// A. Cloud
const Cloud = ({ startX, startY, startZ, speed }: { startX: number, startY: number, startZ: number, speed: number }) => {
  const group = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const scale = useMemo(() => 0.3 + Math.random() * 0.4, []);

  useFrame((state, delta) => {
    if (group.current && shadowRef.current) {
      group.current.position.z += speed * delta;
      shadowRef.current.position.z = group.current.position.z;
      shadowRef.current.position.x = group.current.position.x;
      if (group.current.position.z > 50) group.current.position.z = -200;
    }
  });

  return (
    <>
      <group ref={group} position={[startX, startY, startZ]} scale={[scale, scale, scale]}>
        <mesh position={[0, 0, 0]}><boxGeometry args={[2, 1.5, 4]} /><meshStandardMaterial color="white" flatShading /></mesh>
        <mesh position={[0, 1, 0.5]}><boxGeometry args={[1.5, 1.5, 2.5]} /><meshStandardMaterial color="white" flatShading /></mesh>
        <mesh position={[0.5, 0.5, -1]}><boxGeometry args={[1.5, 1, 2]} /><meshStandardMaterial color="white" flatShading /></mesh>
      </group>
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[startX, 0.02, startZ]}>
        <planeGeometry args={[scale * 4, scale * 6]} />
        <meshBasicMaterial color="black" opacity={0.3} transparent />
      </mesh>
    </>
  );
};

// B. Voxel Tree
const Tree = React.memo(({ x, z }: { x: number, z: number }) => {
  const seed = useMemo(() => Math.random(), []);
  const leafColor = seed > 0.5 ? COLORS.TREE_LEAF_1 : COLORS.TREE_LEAF_2;
  const scale = 0.8 + (seed * 0.4);
  return (
    <group position={[x, 0.5, z]} scale={[1, scale, 1]}>
      <mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[0.4, 1.2, 0.4]} /><meshStandardMaterial color={COLORS.TREE_TRUNK} /></mesh>
      <mesh position={[0, 1.0, 0]} castShadow><boxGeometry args={[1.3, 0.6, 1.3]} /><meshStandardMaterial color={leafColor} /></mesh>
      <mesh position={[0, 1.5, 0]} castShadow><boxGeometry args={[0.9, 0.6, 0.9]} /><meshStandardMaterial color={leafColor} /></mesh>
      <mesh position={[0, 2.0, 0]} castShadow><boxGeometry args={[0.5, 0.6, 0.5]} /><meshStandardMaterial color={leafColor} /></mesh>
    </group>
  );
});

// C. Rock
const Rock = React.memo(({ x, z }: { x: number, z: number }) => {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.3, 0]} castShadow rotation={[Math.random(), Math.random(), Math.random()]}>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={COLORS.ROCK} flatShading />
      </mesh>
      <mesh position={[0.2, 0.2, 0.1]} castShadow rotation={[Math.random(), Math.random(), Math.random()]}>
        <dodecahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color={COLORS.ROCK} flatShading />
      </mesh>
    </group>
  );
});

// D. Traffic Light
const TrafficLight = React.memo(({ x, z }: { x: number, z: number }) => {
  return (
    <group position={[x, 1, z]}>
      <mesh position={[0, -0.5, 0]} castShadow><cylinderGeometry args={[0.1, 0.1, 1]} /><meshStandardMaterial color="#444" /></mesh>
      <mesh position={[0, 0.2, 0]} castShadow><boxGeometry args={[0.3, 0.6, 0.3]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0, 0.35, 0.16]}><circleGeometry args={[0.08]} /><meshBasicMaterial color="red" /></mesh>
      <mesh position={[0, 0.05, 0.16]}><circleGeometry args={[0.08]} /><meshBasicMaterial color="#fbbf24" /></mesh>
    </group>
  );
});

// E. Floating Platform
function FloatingPlatform({ width, variant }: { width: number, variant: WaterObjType }) {
  return (
    <group position={[0, 0.3, 0]}>
      {variant === 'log' ? (
        <mesh castShadow>
          <boxGeometry args={[width, 0.6, 0.8]} />
          <meshStandardMaterial color={COLORS.LOG} />
        </mesh>
      ) : (
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, width, 8]} />
          <meshStandardMaterial color={COLORS.STONE} flatShading />
        </mesh>
      )}
    </group>
  );
}

// --- LANE COMPONENT ---
const Lane = React.memo(({ z, type, speed, dir, obstacles, obstacleTypes, width, waterType, chickenPos, onGameOver, setPlatformOffset, collectibles, onCollectCoin }: any) => {
  const vehicleRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if ((type === 'road' || type === 'water') && vehicleRef.current) {
      const currentX = vehicleRef.current.position.x;
      let newX = currentX + speed * delta * dir;

      if (dir === 1 && newX > 25) newX = -25;
      else if (dir === -1 && newX < -25) newX = 25;

      vehicleRef.current.position.x = newX;

      const chickenZ = Math.round(chickenPos[2]);
      if (z === chickenZ) {
        if (type === 'road') {
          const dist = Math.abs(newX - chickenPos[0]);
          if (dist < (width / 2 + 0.4)) onGameOver();
        }
        if (type === 'water') {
          const dist = Math.abs(newX - chickenPos[0]);
          if (dist < (width / 2 + 0.4)) setPlatformOffset(speed * delta * dir);
        }
      }
    }

    // Check coin collection
    if (collectibles && type === 'grass') {
      const chickenZ = Math.round(chickenPos[2]);
      if (z === chickenZ) {
        collectibles.forEach((coin: Collectible) => {
          if (!coin.collected) {
            const dist = Math.sqrt(
              Math.pow(coin.position[0] - chickenPos[0], 2) +
              Math.pow(coin.position[2] - chickenPos[2], 2)
            );
            if (dist < GAME_CONFIG.COLLECTION_RADIUS) {
              onCollectCoin(coin.id, coin.value);
            }
          }
        });
      }
    }
  });

  return (
    <group position={[0, -0.5, z]}>
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[120, 1, 1]} />
        <meshStandardMaterial color={type === 'grass' ? COLORS.GRASS : type === 'road' ? COLORS.ROAD : COLORS.WATER} />
      </mesh>

      {/* Obstacles */}
      {type === 'grass' && obstacles.map((obsX: number, i: number) => {
        const obsType = obstacleTypes[i] || 'tree';
        if (obsType === 'light') return <TrafficLight key={i} x={obsX} z={0} />;
        if (obsType === 'rock') return <Rock key={i} x={obsX} z={0} />;
        return <Tree key={i} x={obsX} z={0} />;
      })}

      {/* Collectibles */}
      {type === 'grass' && collectibles && collectibles.map((coin: Collectible) => (
        !coin.collected && <Coin key={coin.id} position={coin.position} type={coin.type} />
      ))}

      {/* Moving Objects */}
      {(type === 'road' || type === 'water') && (
        <group ref={vehicleRef}>
          {type === 'road' ? (
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[width, 0.8, 0.8]} />
              <meshStandardMaterial color={speed > 5 ? COLORS.VEHICLE_FAST : COLORS.VEHICLE_SLOW} />
            </mesh>
          ) : (
            <FloatingPlatform width={width} variant={waterType} />
          )}
        </group>
      )}
    </group>
  );
});

// --- GAME LOOP ---
function GameLoop({ gameState, chickenPos, setChickenPos, platformOffset, isMoving, lanes, onGameOver }: any) {
  useFrame((state, delta) => {
    if (gameState !== 'playing') return;
    const cameraZ = state.camera.position.z;
    const targetZ = chickenPos[2] + 20 - GAME_CONFIG.CAMERA_OFFSET_Z;
    state.camera.position.z += (targetZ - cameraZ) * GAME_CONFIG.CAMERA_FOLLOW_SPEED;
    state.camera.position.x = GAME_CONFIG.CAMERA_POSITION_X;

    if (platformOffset.current !== 0) {
      setChickenPos((prev: number[]) => [prev[0] + platformOffset.current, prev[1], prev[2]]);
      platformOffset.current = 0;
    } else {
      const currentZ = Math.round(chickenPos[2]);
      const lane = lanes.find((l: any) => l.z === currentZ);
      if (lane && lane.type === 'water' && !isMoving.current) onGameOver();
    }
  });
  return null;
}

// --- PLAYER ---
function Chicken({ position, direction }: { position: number[], direction: Direction }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  // Initialize position on mount
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], 0, position[2]);
    }
  }, []);

  // Animate movement
  useEffect(() => {
    if (groupRef.current && bodyRef.current) {
      // Kill any existing animations to prevent conflicts
      gsap.killTweensOf(groupRef.current.position);
      gsap.killTweensOf(groupRef.current.rotation);
      gsap.killTweensOf(bodyRef.current.rotation);

      // Move to new position
      gsap.to(groupRef.current.position, {
        x: position[0],
        z: position[2],
        duration: GAME_CONFIG.CHICKEN_SPEED,
        ease: 'power1.inOut'
      });

      // Jump arc
      gsap.to(groupRef.current.position, {
        y: 0.5,
        duration: GAME_CONFIG.CHICKEN_SPEED / 2,
        yoyo: true,
        repeat: 1,
        ease: 'power1.out'
      });

      // Tilt based on direction
      let rotationZ = 0;
      let rotationX = 0;

      if (direction === 'left') rotationZ = 0.3;
      if (direction === 'right') rotationZ = -0.3;
      if (direction === 'up') rotationX = -0.3;
      if (direction === 'down') rotationX = 0.3;

      // Reset rotation then animate tilt
      bodyRef.current.rotation.set(0, 0, 0);
      gsap.to(bodyRef.current.rotation, {
        z: rotationZ,
        x: rotationX,
        duration: GAME_CONFIG.CHICKEN_SPEED / 2,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      });
    }
  }, [position, direction]);

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[0.7, 0.7, 0.7]} /><meshStandardMaterial color="white" /></mesh>
        <mesh position={[0, 0.8, 0.4]}><boxGeometry args={[0.2, 0.2, 0.2]} /><meshStandardMaterial color="orange" /></mesh>
        <mesh position={[0, 1.05, 0]}><boxGeometry args={[0.2, 0.3, 0.4]} /><meshStandardMaterial color="red" /></mesh>
        <mesh position={[-0.2, 0.1, 0]}><boxGeometry args={[0.1, 0.2, 0.1]} /><meshStandardMaterial color="orange" /></mesh>
        <mesh position={[0.2, 0.1, 0]}><boxGeometry args={[0.1, 0.2, 0.1]} /><meshStandardMaterial color="orange" /></mesh>
      </group>
    </group>
  );
}

// --- MAIN APP ---
export default function App() {
  const [chickenPos, setChickenPos] = useState([0, 0, 0]);
  const [lastDir, setLastDir] = useState<Direction>('up');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [stats, setStats] = useState<GameStats>({ score: 0, coins: 0, distance: 0, maxCombo: 0 });
  const [highScore, setHighScore] = useState(0);
  const platformOffset = useRef(0);
  const isMoving = useRef(false);

  // Audio hook
  const { playSound, loaded: audioLoaded } = useAudio();

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('highScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Save high score
  useEffect(() => {
    if (stats.score > highScore) {
      setHighScore(stats.score);
      localStorage.setItem('highScore', stats.score.toString());
    }
  }, [stats.score, highScore]);

  const clouds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 25; i++) {
      arr.push({
        startX: (Math.random() * 80) - 40,
        startY: (Math.random() * 5) + 7,
        startZ: -(Math.random() * 200),
        speed: (Math.random() * 1) + 1
      });
    }
    return arr;
  }, []);

  const [lanes, setLanes] = useState(() => {
    const laneData: any[] = [];
    for (let i = GAME_CONFIG.WORLD_START; i < GAME_CONFIG.WORLD_END; i++) {
      let type: LaneType = 'grass';
      if (i > 0) {
        const r = Math.random();
        if (r < GAME_CONFIG.LANE_PROBABILITIES.GRASS) type = 'grass';
        else if (r < GAME_CONFIG.LANE_PROBABILITIES.GRASS + GAME_CONFIG.LANE_PROBABILITIES.ROAD) type = 'road';
        else type = 'water';
      }
      laneData.push({ z: -i, type, rawIndex: i });
    }

    return laneData.map((lane, index) => {
      const { z, type, rawIndex } = lane;
      const obstacles: number[] = [];
      const obstacleTypes: ObstacleType[] = [];
      const collectibles: Collectible[] = [];
      const prevLane = laneData[index - 1];
      const nextLane = laneData[index + 1];
      const isNextToRoad = (prevLane?.type === 'road' || nextLane?.type === 'road');

      if (type === 'grass') {
        const baseDensity = rawIndex < 50 ? GAME_CONFIG.OBSTACLE_DENSITY.EARLY_GAME : GAME_CONFIG.OBSTACLE_DENSITY.LATE_GAME;
        for (let x = -50; x <= 50; x++) {
          if (rawIndex === 0 && x === 0) continue;
          const isPlayArea = x >= GAME_CONFIG.PLAY_AREA_MIN && x <= GAME_CONFIG.PLAY_AREA_MAX;

          if (isNextToRoad && isPlayArea && Math.random() > 0.95) {
            obstacles.push(x); obstacleTypes.push('light'); continue;
          }

          if (isPlayArea) {
            // Check for coin spawn (but not in starting area - first 10 lanes)
            if (rawIndex > 10 && Math.random() < GAME_CONFIG.COIN_SPAWN_CHANCE) {
              const coinType: CollectibleType = Math.random() < GAME_CONFIG.GEM_SPAWN_CHANCE ? 'gem' : 'coin';
              collectibles.push({
                id: `${z}-${x}`,
                position: [x, 0, z],
                type: coinType,
                value: coinType === 'coin' ? GAME_CONFIG.COIN_VALUE : GAME_CONFIG.GEM_VALUE,
                collected: false
              });
            } else if (Math.random() > baseDensity) {
              obstacles.push(x);
              obstacleTypes.push(Math.random() > 0.5 ? 'tree' : 'rock');
            }
          } else {
            if (Math.random() > GAME_CONFIG.OBSTACLE_DENSITY.OUTSIDE_PLAY) { obstacles.push(x); obstacleTypes.push('tree'); }
          }
        }
      }
      const speed = Math.random() * (GAME_CONFIG.VEHICLE_SPEED_MAX - GAME_CONFIG.VEHICLE_SPEED_MIN) + GAME_CONFIG.VEHICLE_SPEED_MIN;
      const dir = Math.random() > 0.5 ? 1 : -1;
      const width = type === 'water' ? (Math.random() * (GAME_CONFIG.LOG_WIDTH_MAX - GAME_CONFIG.LOG_WIDTH_MIN) + GAME_CONFIG.LOG_WIDTH_MIN) : 2;
      const waterType: WaterObjType = type === 'water' && Math.random() > 0.7 ? 'stone' : 'log';

      return { ...lane, speed, dir, obstacles, obstacleTypes, width, waterType, collectibles };
    });
  });

  const handleCollectCoin = useCallback((coinId: string, value: number) => {
    setLanes(prev => prev.map(lane => ({
      ...lane,
      collectibles: lane.collectibles?.map((coin: Collectible) =>
        coin.id === coinId ? { ...coin, collected: true } : coin
      )
    })));
    setStats(prev => ({ ...prev, coins: prev.coins + value, score: prev.score + value }));

    // Play sound effect
    if (value === 50) {
      playSound('gem');
    } else {
      playSound('coin');
    }
  }, [playSound]);

  const moveChicken = useCallback((direction: Direction) => {
    if (gameState !== 'playing' || isMoving.current) return;
    setLastDir(direction);

    // Play jump sound
    playSound('jump');

    setChickenPos((prev) => {
      const [x, y, z] = prev;
      let targetX = x; let targetZ = z;
      if (direction === 'up') targetZ -= 1;
      if (direction === 'down') targetZ += 1;
      if (direction === 'left') targetX -= 1;
      if (direction === 'right') targetX += 1;
      const targetLane = lanes.find(l => l.z === targetZ);
      if (targetX < GAME_CONFIG.PLAY_AREA_MIN || targetX > GAME_CONFIG.PLAY_AREA_MAX) return prev;
      if (targetLane && targetLane.type === 'grass') {
        if (targetLane.obstacles.includes(Math.round(targetX))) return prev;
      }
      isMoving.current = true;
      if (direction === 'up') {
        const newDistance = Math.abs(targetZ);
        setStats(s => ({
          ...s,
          score: Math.max(s.score, newDistance * GAME_CONFIG.SCORE_MULTIPLIER),
          distance: Math.max(s.distance, newDistance)
        }));
      }
      setTimeout(() => { isMoving.current = false; }, GAME_CONFIG.CHICKEN_SPEED * 1000 + 50);
      return [targetX, y, targetZ];
    });
  }, [gameState, lanes, playSound]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGameState(prev => prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev);
        return;
      }
      if (gameState === 'playing') {
        if (e.key === 'w' || e.key === 'ArrowUp') moveChicken('up');
        if (e.key === 's' || e.key === 'ArrowDown') moveChicken('down');
        if (e.key === 'a' || e.key === 'ArrowLeft') moveChicken('left');
        if (e.key === 'd' || e.key === 'ArrowRight') moveChicken('right');
      }
      if (gameState === 'game-over' && e.key === 'r') {
        resetGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [moveChicken, gameState]);

  const handleGameOver = useCallback(() => {
    // Prevent multiple calls
    if (gameState !== 'playing') return;

    setGameState('game-over');

    // Play crash or splash sound
    const currentZ = Math.round(chickenPos[2]);
    const lane = lanes.find(l => l.z === currentZ);
    if (lane?.type === 'water') {
      playSound('splash');
    } else {
      playSound('crash');
    }
  }, [gameState, chickenPos, lanes, playSound]);
  const resetGame = () => {
    setChickenPos([0, 0, 0]);
    setStats({ score: 0, coins: 0, distance: 0, maxCombo: 0 });
    setGameState('playing');
    // Regenerate lanes with new coins
    setLanes(prev => prev.map(lane => ({
      ...lane,
      collectibles: lane.collectibles?.map((coin: Collectible) => ({ ...coin, collected: false }))
    })));
  };

  return (
    <View style={{ flex: 1, backgroundColor: GAME_CONFIG.BACKGROUND_COLOR }}>
      <Canvas shadows>
        <color attach="background" args={[GAME_CONFIG.BACKGROUND_COLOR]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow />
        <OrthographicCamera makeDefault position={[GAME_CONFIG.CAMERA_POSITION_X, 20, 20]} zoom={50} near={-50} far={200} onUpdate={c => c.lookAt(0, 0, 0)} />

        <GameLoop gameState={gameState} chickenPos={chickenPos} setChickenPos={setChickenPos} platformOffset={platformOffset} isMoving={isMoving} lanes={lanes} onGameOver={handleGameOver} />

        {clouds.map((c, i) => (<Cloud key={i} startX={c.startX} startY={c.startY} startZ={c.startZ} speed={c.speed} />))}

        <Chicken position={chickenPos} direction={lastDir} />

        {lanes.map((lane) => (
          Math.abs(lane.z - chickenPos[2]) < GAME_CONFIG.RENDER_DISTANCE && (
            <Lane key={lane.z} {...lane} chickenPos={chickenPos} onGameOver={handleGameOver} setPlatformOffset={(offset: number) => { platformOffset.current = offset; }} onCollectCoin={handleCollectCoin} />
          )
        ))}
      </Canvas>

      <HUD score={stats.score} coins={stats.coins} isPaused={gameState === 'paused'} onPause={() => setGameState(prev => prev === 'playing' ? 'paused' : 'playing')} />

      {gameState === 'paused' && (
        <PauseMenu
          onResume={() => setGameState('playing')}
          onRestart={resetGame}
        />
      )}

      {gameState === 'game-over' && (
        <GameOverScreen
          stats={stats}
          highScore={highScore}
          onRestart={resetGame}
        />
      )}
    </View>
  );
}