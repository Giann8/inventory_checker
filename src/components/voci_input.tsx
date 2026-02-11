import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import BarcodeReader from './barcode_reader';
import { BarcodeScanner } from '../utils/BarcodeScanner';

interface VociInputProps {
    titolo: string;
    voci: Array<{ numScatole: string; peso: string }>;
    onAggiungi: () => void;
    onRimuovi: (index: number) => void;
    onAggiorna: (index: number, campo: string, valore: string) => void;
    totale: number;
    icon: string;
}

const VociInput: React.FC<VociInputProps> = ({ 
    titolo, 
    voci, 
    onAggiungi, 
    onRimuovi, 
    onAggiorna, 
    totale,
    icon
}) => {
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);

    const openBarcodeScanner = () => {
        setShowBarcodeModal(true);
    };

    const handleBarcodeScanned = (data: string, type: string) => {
        const peso = BarcodeScanner.decode(data, type);
        
        if (peso) {
            // Inserisci il peso nell'ultima voce
            const lastIndex = voci.length - 1;
            onAggiorna(lastIndex, 'peso', peso);
            
            // Aggiungi automaticamente una nuova voce
            setTimeout(() => {
                onAggiungi();
            }, 100);
            
            // Chiudi il modal dopo 1 secondo
            setTimeout(() => {
                setShowBarcodeModal(false);
            }, 1000);
        }
    };

    return (
        <View style={styles.vociContainer}>
            <View style={styles.vociHeader}>
                <View style={styles.vociTitleRow}>
                    <Ionicons name={icon as any} size={20} color="#2C5F2D" />
                    <Text style={styles.vociTitle}>{titolo}</Text>
                </View>
                <View style={styles.totaleBadge}>
                    <Text style={styles.totaleText}>{totale.toFixed(2)}</Text>
                </View>
            </View>
            
            <View style={styles.vociList}>
                {voci.map((voce, index) => (
                    <View key={index} style={styles.voceSingola}>
                        <View style={styles.voceInputGroup}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Scatole</Text>
                                <TextInput
                                    style={[styles.input, styles.inputSmall]}
                                    value={voce.numScatole}
                                    onChangeText={(val) => onAggiorna(index, 'numScatole', val)}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#999"
                                />
                            </View>
                            
                            <Text style={styles.moltiplicatore}>×</Text>
                            
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Peso</Text>
                                <TextInput
                                    style={[styles.input, styles.inputSmall]}
                                    value={voce.peso}
                                    onChangeText={(val) => onAggiorna(index, 'peso', val)}
                                    keyboardType="decimal-pad"
                                    placeholder="0"
                                    placeholderTextColor="#999"
                                />
                            </View>
                            
                            <View style={styles.risultatoBox}>
                                <Text style={styles.risultatoLabel}>=</Text>
                                <Text style={styles.risultatoValue}>
                                    {((parseFloat(voce.numScatole) || 0) * (parseFloat(voce.peso) || 0)).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        
                        {voci.length > 1 && (
                            <TouchableOpacity 
                                onPress={() => onRimuovi(index)}
                                style={styles.rimuoviButton}
                            >
                                <Ionicons name="close-circle" size={28} color="#DC3545" />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </View>
            
            <View style={styles.actionsRow}>
                <TouchableOpacity 
                    onPress={openBarcodeScanner}
                    style={styles.scanButton}
                >
                    <Ionicons name="barcode-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.scanButtonText}>Scansiona</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={onAggiungi}
                    style={styles.aggiungiVoceButton}
                >
                    <Ionicons name="add-circle-outline" size={22} color="#2C5F2D" />
                    <Text style={styles.aggiungiText}>Aggiungi voce</Text>
                </TouchableOpacity>
            </View>

            {/* Modal per scanner barcode */}
            <Modal
                visible={showBarcodeModal}
                animationType="slide"
                onRequestClose={() => setShowBarcodeModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Scansiona Peso</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowBarcodeModal(false)}
                        >
                            <Ionicons name="close" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    
                    <BarcodeReader onBarcodeScanned={handleBarcodeScanned} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    vociContainer: {
        marginTop: 12,
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#E8F5E9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    vociHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#E8F5E9',
    },
    vociTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    vociTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C5F2D',
    },
    totaleBadge: {
        backgroundColor: '#2C5F2D',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    totaleText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    vociList: {
        gap: 12,
    },
    voceSingola: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    voceInputGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputWrapper: {
        flex: 1,
        minWidth: 80,
    },
    inputLabel: {
        fontSize: 10,
        color: '#666',
        marginBottom: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    inputSmall: {
        padding: 10,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    moltiplicatore: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2C5F2D',
        marginHorizontal: 4,
    },
    risultatoBox: {
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        padding: 8,
        minWidth: 70,
        alignItems: 'center',
    },
    risultatoLabel: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
    },
    risultatoValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C5F2D',
        marginTop: 2,
    },
    rimuoviButton: {
        padding: 2,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    scanButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        backgroundColor: '#2C5F2D',
        borderRadius: 10,
    },
    scanButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    aggiungiVoceButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        backgroundColor: '#F0F8F0',
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#2C5F2D',
        borderStyle: 'dashed',
    },
    aggiungiText: {
        fontSize: 14,
        color: '#2C5F2D',
        fontWeight: '700',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    modalHeader: {
        backgroundColor: '#2C5F2D',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 4,
    },
});

export default VociInput;
