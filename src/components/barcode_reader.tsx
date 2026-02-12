import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { GS1Data } from '../types/BarcodeTypes';
import { theme } from '../theme';

interface BarcodeReaderProps {
    tipoScorta?: string;
    onBarcodeScanned?: (data: string|GS1Data, type: string) => void;
}

export default function BarcodeReader({ tipoScorta, onBarcodeScanned }: BarcodeReaderProps) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    
    const qrLock = useRef(false);

    useEffect(() => {
        // Reset del lock ogni volta che il componente si monta (modal si apre)
        qrLock.current = false;
        setScanned(false);
    }, []);

    useEffect(() => {
        const getCameraPermission = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getCameraPermission();
    }, []);

    const handleBarcodeScanned = ({ type, data }) => {
        // Previeni scansioni multiple usando il lock
        if (qrLock.current) return;
        
        // Attiva il lock
        qrLock.current = true;
        setScanned(true);
        
        console.log(`Scanned barcode with type ${type} and data ${data}`);
        
        // Chiama la callback se fornita
        if (onBarcodeScanned) {
            onBarcodeScanned(data, type);
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <View style={styles.messageContainer}>
                    <Text style={styles.messageIcon}>📷</Text>
                    <Text style={styles.messageText}>Richiesta permessi camera...</Text>
                </View>
            </View>
        );
    }
    
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>❌</Text>
                    <Text style={styles.errorText}>Accesso alla camera negato</Text>
                    <Text style={styles.errorSubtext}>Abilita i permessi nelle impostazioni</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Scansiona Codice</Text>
                <Text style={styles.subtitle}>Inquadra il codice a barre del prodotto</Text>
            </View>
            
            <View style={styles.cameraContainer}>
                <CameraView
                    onBarcodeScanned={qrLock.current || scanned ? undefined : handleBarcodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: [
                            "qr", 
                            "pdf417", 
                            "aztec",
                            "ean13", 
                            "ean8", 
                            "upc_e",
                            "upc_a",
                            "code39", 
                            "code128", 
                            "code93",
                            "codabar",
                            "itf14",
                            "datamatrix"
                        ],
                    }}
                    style={styles.camera}
                />
                
                <View style={styles.scanOverlay}>
                    <View style={styles.scanFrame} />
                </View>
            </View>
            
            {scanned && (
                <View style={styles.bottomContainer}>
                    <TouchableOpacity 
                        style={styles.scanAgainButton} 
                        onPress={() => setScanned(false)}
                    >
                        <Text style={styles.scanAgainIcon}>🔄</Text>
                        <Text style={styles.scanAgainText}>Scansiona di nuovo</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.primary,
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.surface,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.surface,
        textAlign: 'center',
        opacity: 0.85,
    },
    cameraContainer: {
        flex: 1,
        margin: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: theme.colors.background,
    },
    camera: {
        flex: 1,
    },
    scanOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderColor: theme.colors.primary,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    bottomContainer: {
        padding: 20,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        shadowColor: theme.colors.textPrimary,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: theme.shadows.md.shadowOpacity,
        shadowRadius: theme.shadows.md.shadowRadius,
        elevation: theme.shadows.md.elevation,
    },
    scanAgainButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanAgainIcon: {
        fontSize: 20,
        marginRight: theme.spacing.sm,
        color: theme.colors.surface,
    },
    scanAgainText: {
        color: theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 40,
    },
    messageIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.md,
        color: theme.colors.primary,
    },
    messageText: {
        color: theme.colors.primary,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 40,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
        color: theme.colors.danger,
    },
    errorText: {
        color: theme.colors.danger,
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    errorSubtext: {
        fontSize: 14,
        color: theme.colors.danger,
        textAlign: 'center',
        opacity: 0.7,
    },
});