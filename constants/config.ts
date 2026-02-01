// Game Configuration Constants

export const GAME_CONFIG = {
    // Movement
    CHICKEN_SPEED: 0.15,

    // Rendering
    RENDER_DISTANCE: 70,
    BACKGROUND_COLOR: '#87CEEB',

    // World Generation
    WORLD_START: -50,
    WORLD_END: 300,
    PLAY_AREA_MIN: -9,
    PLAY_AREA_MAX: 9,

    // Lane Generation Probabilities
    LANE_PROBABILITIES: {
        GRASS: 0.4,
        ROAD: 0.3,
        WATER: 0.3,
    },

    // Obstacle Density
    OBSTACLE_DENSITY: {
        EARLY_GAME: 0.9,    // First 50 lanes (10% spawn chance)
        LATE_GAME: 0.98,    // After 50 lanes (2% spawn chance)
        OUTSIDE_PLAY: 0.85, // Outside play area (15% spawn chance)
    },

    // Collectibles
    COIN_SPAWN_CHANCE: 0.15,  // 15% chance per grass lane space
    GEM_SPAWN_CHANCE: 0.2,     // 20% of collectibles are gems
    COIN_VALUE: 10,
    GEM_VALUE: 50,
    COLLECTION_RADIUS: 0.5,

    // Vehicle
    VEHICLE_SPEED_MIN: 2,
    VEHICLE_SPEED_MAX: 6,

    // Water
    LOG_WIDTH_MIN: 2,
    LOG_WIDTH_MAX: 4,

    // Camera
    CAMERA_FOLLOW_SPEED: 0.1,
    CAMERA_OFFSET_Z: 10,
    CAMERA_POSITION_X: 20,

    // UI
    SCORE_MULTIPLIER: 10, // Score = distance * 10
};

export const COLORS = {
    // Lane Colors
    GRASS: '#4ade80',
    ROAD: '#4b5563',
    WATER: '#3b82f6',

    // Entity Colors
    COIN: '#FFD700',
    GEM: '#A855F7',

    // Vehicle Colors
    VEHICLE_FAST: '#ef4444',
    VEHICLE_SLOW: '#f59e0b',

    // Obstacles
    TREE_TRUNK: '#553311',
    TREE_LEAF_1: '#15803d',
    TREE_LEAF_2: '#166534',
    ROCK: '#78716c',

    // Water Objects
    LOG: '#573618',
    STONE: '#9ca3af',
};

export const AUDIO_VOLUMES = {
    MASTER: 0.7,
    MUSIC: 0.3,
    SFX: 0.8,

    // Individual sound effects
    JUMP: 0.6,
    LAND: 0.4,
    COIN: 0.7,
    GEM: 0.8,
    CRASH: 1.0,
    SPLASH: 0.9,
};
