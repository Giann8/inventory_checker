import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Switch, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import BarcodeReader from './barcode_reader';
import { BarcodeScanner } from '../utils/BarcodeScanner';
import Tare from '../model/tare';
import { theme } from '../theme';

interface VociInputProps {
    titolo: string;
    voci: Array<{ numScatole: string; peso: string; taraId?: string }>;
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
    const [tare, setTare] = useState<Tare[]>([]);
    const [usaTara, setUsaTara] = useState(false);
    const [showTaraPicker, setShowTaraPicker] = useState<number | null>(null);
    const [tempTaraId, setTempTaraId] = useState('');

    useEffect(() => {
        caricaTare();
    }, []);

    const caricaTare = async () => {
        try {
            const tare = await Tare.getAllTare();
            setTare(tare as Tare[]);
        } catch (error) {
            console.error('Errore nel caricamento delle tare:', error);
        }
    };

    const getPesoNetto = (index: number) => {
        const voce = voci[index];
        // Accetta sia virgola che punto come separatore decimale
        const pesoLordo = parseFloat((voce.peso || '').replace(',', '.')) || 0; // già in kg
        if (!usaTara || !voce.taraId) {
            return pesoLordo;
        }
        const taraSelezionata = tare.find(t => t.id === voce.taraId);
        if (!taraSelezionata) {
            return pesoLordo;
        }
        // taraSelezionata.weight è in grammi, converti in kg
        const taraKg = (taraSelezionata.weight || 0) / 1000;
        return Math.max(0, pesoLordo - taraKg);
    };

    const openBarcodeScanner = () => {
        setShowBarcodeModal(true);
    };

    const handleBarcodeScanned = (data: string, type: string) => {
        const peso = BarcodeScanner.decode(data, type);
        
        if (peso) {
            // Inserisci il peso nell'ultima voce
            const lastIndex = voci.length - 1;
            onAggiorna(lastIndex, 'peso', typeof peso === 'string' ? peso : JSON.stringify(peso.weightKg));
            
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

    const getTaraLabel = (taraId: string) => {
        if (!taraId) return 'Seleziona';
        const tara = tare.find(t => t.id === taraId);
        return tara ? `${tara.name} (-${(tara.weight/1000).toFixed(3)}kg)` : 'Seleziona';
    };  

    const openTaraPicker = (index: number) => {
        setTempTaraId(voci[index].taraId || '');
        setShowTaraPicker(index);
    };

    const confirmTaraSelection = () => {
        if (showTaraPicker !== null) {
            onAggiorna(showTaraPicker, 'taraId', tempTaraId);
        }
        setShowTaraPicker(null);
    };

    return (
        <View style={styles.vociContainer}>
            <View style={styles.vociHeader}>
                <View style={styles.vociTitleRow}>
                    <Ionicons name={icon as any} size={20} color="#2C5F2D" />
                    <Text style={styles.vociTitle}>{titolo}</Text>
                </View>
                <View style={styles.totaleBadge}>
                    <Text style={styles.totaleText}>{totale.toFixed(3)}</Text>
                </View>
            </View>
            
            {/* Switch per attivare la tara */}
            <View style={styles.taraSwitch}>
                <View style={styles.taraSwitchLabelContainer}>
                    <Text style={styles.taraSwitchLabel}>Usa Tara</Text>
                    {tare.length === 0 && usaTara && (
                        <Text style={styles.taraSwitchWarning}>⚠️ Nessun contenitore disponibile</Text>
                    )}
                </View>
                <Switch
                    value={usaTara}
                    onValueChange={(value) => {
                        setUsaTara(value);
                        // Reset delle tare selezionate quando si disattiva
                        if (!value) {
                            voci.forEach((_, index) => {
                                onAggiorna(index, 'taraId', '');
                            });
                        }
                    }}
                    trackColor={{ false: '#767577', true: '#2C5F2D' }}
                    thumbColor={usaTara ? '#4A7C59' : '#f4f3f4'}
                />
            </View>
            
            <View style={styles.vociList}>
                {voci.map((voce, index) => (
                    <View key={index} style={styles.voceSingola}>
                        <View style={[styles.voceInputGroup, usaTara && styles.voceInputGroupWithTara]}>
                            <View style={styles.inputRow}>
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
                                    <Text style={styles.inputLabel}>Peso (kg)</Text>
                                    <TextInput
                                        style={[styles.input, styles.inputSmall]}
                                        value={voce.peso}
                                        onChangeText={(val) => onAggiorna(index, 'peso', val)}
                                        keyboardType="decimal-pad"
                                        placeholder="0.000"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                
                                {!usaTara && (
                                    <View style={styles.risultatoBox}>
                                        <Text style={styles.risultatoLabel}>=</Text>
                                        <Text style={styles.risultatoValue}>
                                            {((parseFloat((voce.numScatole || '').replace(',', '.')) || 0) * getPesoNetto(index)).toFixed(3)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            
                            {/* Seconda riga per tara e risultato */}
                            {usaTara && (
                                <View style={styles.inputRow}>
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.inputLabel}>Contenitore</Text>
                                        <TouchableOpacity 
                                            style={styles.pickerButton}
                                            onPress={() => openTaraPicker(index)}
                                        >
                                            <Text style={[styles.pickerButtonText, !voce.taraId && styles.pickerButtonTextPlaceholder]}>
                                                {getTaraLabel(voce.taraId || '')}
                                            </Text>
                                            <Ionicons name="chevron-down" size={20} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <View style={styles.risultatoBox}>
                                        <Text style={styles.risultatoLabel}>=</Text>
                                        <Text style={styles.risultatoValue}>
                                            {((parseFloat((voce.numScatole || '').replace(',', '.')) || 0) * getPesoNetto(index)).toFixed(3)}
                                        </Text>
                                    </View>
                                </View>
                            )}
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

            {/* Modal per selezionare la tara */}
            <Modal
                visible={showTaraPicker !== null}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTaraPicker(null)}
            >
                <View style={styles.taraModalOverlay}>
                    <View style={styles.taraModalContent}>
                        <View style={styles.taraModalHeader}>
                            <Text style={styles.taraModalTitle}>Seleziona Contenitore</Text>
                        </View>
                        
                        <Picker
                            selectedValue={tempTaraId}
                            onValueChange={setTempTaraId}
                            style={styles.taraModalPicker}
                            itemStyle={styles.taraModalPickerItem}
                        >
                            <Picker.Item label="Nessuna" value="" />
                            {tare.map((t) => (
                                <Picker.Item 
                                    key={t.id} 
                                    label={`${t.name} (-${(t.weight/1000).toFixed(3)}kg)`} 
                                    value={t.id} 
                                />
                            ))}
                        </Picker>

                        <View style={styles.taraModalButtons}>
                            <TouchableOpacity 
                                style={styles.taraModalButtonCancel}
                                onPress={() => setShowTaraPicker(null)}
                            >
                                <Text style={styles.taraModalButtonTextCancel}>Annulla</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.taraModalButtonConfirm}
                                onPress={confirmTaraSelection}
                            >
                                <Text style={styles.taraModalButtonTextConfirm}>Conferma</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    vociContainer: {
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        borderWidth: 2,
        borderColor: theme.colors.inStock,
        shadowColor: theme.colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.shadows.sm.shadowOpacity,
        shadowRadius: theme.shadows.sm.shadowRadius,
        elevation: theme.shadows.sm.elevation,
    },
    vociHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.border,
    },
    taraSwitch: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
    },
    taraSwitchLabelContainer: {
        flex: 1,
    },
    taraSwitchLabel: {
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
    taraSwitchWarning: {
        fontSize: 12,
        color: theme.colors.danger,
    },
    vociTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    vociTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    totaleBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.lg,
    },
    totaleText: {
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    vociList: {
        gap: 12,
    },
    voceSingola: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    voceInputGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    voceInputGroupWithTara: {
        flexDirection: 'column',
        gap: 12,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    inputWrapper: {
        flex: 1,
        minWidth: 80,
    },
    inputLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    input: {
        backgroundColor: theme.colors.surface,
        color: theme.colors.textPrimary,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    pickerButton: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        height: 44,
    },
    pickerButtonText: {
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
    pickerButtonTextPlaceholder: {
        color: theme.colors.textDisabled,
    },
    pickerContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        justifyContent: 'center',
        height: 44,
    },
    picker: {
        height: 44,
    },
    pickerItem: {
        fontSize: 14,
        height: 120,
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
        color: theme.colors.primary,
        marginHorizontal: 4,
    },
    risultatoBox: {
        backgroundColor: theme.colors.inStock + '22',
        borderRadius: 8,
        padding: 8,
        minWidth: 70,
        alignItems: 'center',
    },
    risultatoLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    risultatoValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
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
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
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
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.secondary,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
    },
    aggiungiText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '700',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    modalHeader: {
        backgroundColor: theme.colors.primary,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.surface,
    },
    closeButton: {
        padding: 4,
    },
    taraModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    taraModalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        paddingBottom: theme.spacing.xl,
    },
    taraModalHeader: {
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    taraModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
    },
    taraModalPicker: {
        width: '100%',
    },
    taraModalPickerItem: {
        fontSize: 16,
        height: 120,
    },
    taraModalButtons: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    taraModalButtonCancel: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    taraModalButtonTextCancel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    taraModalButtonConfirm: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
    },
    taraModalButtonTextConfirm: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.surface,
    },
});

export default VociInput;
