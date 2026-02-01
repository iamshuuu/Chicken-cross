// Game Type Definitions

export type LaneType = 'grass' | 'road' | 'water';
export type ObstacleType = 'tree' | 'rock' | 'light';
export type WaterObjType = 'log' | 'stone';
export type GameState = 'playing' | 'paused' | 'game-over';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type CollectibleType = 'coin' | 'gem';

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface Collectible {
    id: string;
    position: [number, number, number];
    type: CollectibleType;
    value: number;
    collected: boolean;
}

export interface Lane {
    z: number;
    type: LaneType;
    rawIndex: number;
    speed: number;
    dir: number; // 1 or -1
    obstacles: number[];
    obstacleTypes: ObstacleType[];
    width: number;
    waterType: WaterObjType;
    collectibles?: Collectible[];
}

export interface GameStats {
    score: number;
    coins: number;
    distance: number;
    maxCombo: number;
}

export interface HighScoreEntry {
    score: number;
    coins: number;
    distance: number;
    date: string;
}

export interface GameProgress {
    highScore: number;
    totalCoins: number;
    totalDistance: number;
    totalGames: number;
    topScores: HighScoreEntry[];
}
