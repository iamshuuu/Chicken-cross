import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PauseMenuProps {
    onResume: () => void;
    onRestart: () => void;
    onMainMenu?: () => void;
}

export function PauseMenu({ onResume, onRestart, onMainMenu }: PauseMenuProps) {
    return (
        <View style={styles.overlay}>
            <View style={styles.menu}>
                <Text style={styles.title}>⏸ PAUSED</Text>

                <TouchableOpacity style={styles.button} onPress={onResume}>
                    <Text style={styles.buttonText}>RESUME (ESC)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onRestart}>
                    <Text style={styles.buttonText}>RESTART (R)</Text>
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

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(5px)',
    },
    menu: {
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderRadius: 20,
        padding: 40,
        minWidth: 300,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 30,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    button: {
        backgroundColor: '#4ade80',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginVertical: 8,
        minWidth: 220,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#6b7280',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
