import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';

// Sound types
export type SoundType = 'jump' | 'coin' | 'gem' | 'crash' | 'splash';

interface SoundConfig {
    file: any;
    volume: number;
}

// Import sound files - use relative paths from project root
// Note: coin.mp3 uses gem.mp3 as fallback since coin.mp3 is missing
const SOUND_FILES: Record<SoundType, SoundConfig> = {
    jump: { file: require('../assets/sounds/jump.mp3'), volume: 0.6 },
    coin: { file: require('../assets/sounds/gem.mp3'), volume: 0.5 }, // Using gem as fallback
    gem: { file: require('../assets/sounds/gem.mp3'), volume: 0.8 },
    crash: { file: require('../assets/sounds/crash.mp3'), volume: 1.0 },
    splash: { file: require('../assets/sounds/splash.mp3'), volume: 0.9 },
};

export function useAudio() {
    const [enabled, setEnabled] = useState(true);
    const [masterVolume, setMasterVolume] = useState(0.7);
    const soundsRef = useRef<Record<string, Audio.Sound>>({});
    const [loaded, setLoaded] = useState(false);

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('audioSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setEnabled(!settings.muted);
            setMasterVolume(settings.masterVolume || 0.7);
        }
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('audioSettings', JSON.stringify({
            muted: !enabled,
            masterVolume,
        }));
    }, [enabled, masterVolume]);

    // Preload sounds using Expo AV
    useEffect(() => {
        let isMounted = true;

        const loadSounds = async () => {
            try {
                const loadedSounds: Record<string, Audio.Sound> = {};

                for (const [key, config] of Object.entries(SOUND_FILES)) {
                    try {
                        const { sound } = await Audio.Sound.createAsync(
                            config.file,
                            {
                                volume: config.volume * masterVolume,
                                shouldPlay: false
                            }
                        );
                        loadedSounds[key] = sound;
                        console.log(`✅ Loaded sound: ${key}`);
                    } catch (err) {
                        console.log(`❌ Failed to load sound ${key}:`, err);
                    }
                }

                if (isMounted) {
                    soundsRef.current = loadedSounds;
                    setLoaded(true);
                    console.log('🔊 All sounds loaded successfully!');
                }
            } catch (err) {
                console.log('❌ Error loading sounds:', err);
            }
        };

        loadSounds();

        return () => {
            isMounted = false;
            // Cleanup sounds on unmount
            Object.values(soundsRef.current).forEach(sound => {
                sound.unloadAsync().catch(() => { });
            });
        };
    }, []);

    // Update volumes when masterVolume changes
    useEffect(() => {
        if (loaded) {
            Object.entries(soundsRef.current).forEach(([key, sound]) => {
                const config = SOUND_FILES[key as SoundType];
                sound.setVolumeAsync(config.volume * masterVolume).catch(() => { });
            });
        }
    }, [masterVolume, loaded]);

    const playSound = useCallback(async (type: SoundType) => {
        if (!enabled) {
            return;
        }

        if (!loaded) {
            console.log(`🔊 Sound ${type} not loaded yet...`);
            return;
        }

        try {
            const sound = soundsRef.current[type];
            if (sound) {
                // Reset to beginning and play
                await sound.setPositionAsync(0);
                await sound.playAsync();
                console.log(`🔊 Playing: ${type}`);
            }
        } catch (err) {
            console.log(`❌ Failed to play sound ${type}:`, err);
        }
    }, [enabled, loaded]);

    const toggleMute = useCallback(() => {
        setEnabled(prev => !prev);
    }, []);

    return {
        playSound,
        enabled,
        loaded,
        masterVolume,
        setMasterVolume,
        toggleMute,
    };
}
