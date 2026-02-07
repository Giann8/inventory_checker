import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { CameraView, Camera } from 'expo-camera';

export default function BarcodeReader({ tipoScorta }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getCameraPermission = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getCameraPermission();
    }, []);

    const handleBarcodeScanned = ({ type, data }) => {
        setScanned(true);
        console.log(`Scanned barcode with type ${type} and data ${data}`);
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
                    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
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
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2C5F2D', // Verde logistico
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#E8F5E8',
        textAlign: 'center',
    },
    cameraContainer: {
        flex: 1,
        margin: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000',
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
        borderColor: '#4A7C59',
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    bottomContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    scanAgainButton: {
        backgroundColor: '#2C5F2D',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanAgainIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    scanAgainText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 40,
    },
    messageIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    messageText: {
        fontSize: 18,
        color: '#495057',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff5f5',
        padding: 40,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 18,
        color: '#dc3545',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    errorSubtext: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
    },
});