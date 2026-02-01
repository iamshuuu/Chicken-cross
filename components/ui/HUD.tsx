import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HUDProps {
    score: number;
    coins: number;
    isPaused: boolean;
    onPause: () => void;
}

export function HUD({ score, coins, isPaused, onPause }: HUDProps) {
    return (
        <View style={styles.container}>
            {/* Top Left - Score & Coins */}
            <View style={styles.topLeft}>
                <Text style={styles.scoreText}>Score: {score}</Text>
                <Text style={styles.coinText}>🪙 {coins}</Text>
            </View>

            {/* Top Right - Pause Button */}
            <TouchableOpacity
                style={styles.pauseButton}
                onPress={onPause}
            >
                <Text style={styles.pauseIcon}>{isPaused ? '▶' : '⏸'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        pointerEvents: 'box-none',
    },
    topLeft: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 15,
        borderRadius: 10,
        minWidth: 150,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    coinText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFD700',
        marginTop: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    pauseButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'auto',
    },
    pauseIcon: {
        fontSize: 24,
        color: 'white',
    },
});
