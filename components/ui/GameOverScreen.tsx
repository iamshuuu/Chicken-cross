import type { GameStats } from '@/types/game';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GameOverScreenProps {
    stats: GameStats;
    highScore: number;
    onRestart: () => void;
    onMainMenu?: () => void;
}

export function GameOverScreen({ stats, highScore, onRestart, onMainMenu }: GameOverScreenProps) {
    const isNewHighScore = stats.score > highScore;

    return (
        <View style={styles.overlay}>
            <View style={styles.menu}>
                <Text style={styles.title}>💀 GAME OVER</Text>

                {isNewHighScore && (
                    <Text style={styles.newHighScore}>🏆 NEW HIGH SCORE! 🏆</Text>
                )}

                <View style={styles.statsContainer}>
                    <StatRow label="Final Score" value={stats.score.toString()} highlight />
                    <StatRow label="Distance" value={`${stats.distance}m`} />
                    <StatRow label="Coins Collected" value={`🪙 ${stats.coins}`} />

                    <View style={styles.divider} />

                    <StatRow label="High Score" value={Math.max(stats.score, highScore).toString()} />
                </View>

                <TouchableOpacity style={styles.button} onPress={onRestart}>
                    <Text style={styles.buttonText}>PLAY AGAIN (R)</Text>
                </TouchableOpacity>

                {onMainMenu && (
                    <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onMainMenu}>
                        <Text style={styles.buttonText}>MAIN MENU</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>{label}:</Text>
            <Text style={[styles.statValue, highlight && styles.statHighlight]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menu: {
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderRadius: 20,
        padding: 40,
        minWidth: 350,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#ef4444',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    newHighScore: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    statsContainer: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 10,
        padding: 20,
        marginBottom: 25,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 6,
    },
    statLabel: {
        fontSize: 16,
        color: '#d1d5db',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    statHighlight: {
        fontSize: 20,
        color: '#4ade80',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#4ade80',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginVertical: 8,
        minWidth: 250,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#6b7280',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});
