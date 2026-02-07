import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import Scorte from '../model/scorte';
import VociInput from './voci_input';
import Product from '../model/product';

interface ScortaFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: {
        qtaLinea: number;
        qtaSigillato: number;
        qtaAperto: number;
        qtaScarto: number;
        productId?: string;
        date?: Date;
        isMattina?: boolean;
    }) => Promise<void>;
    scorta?: Scorte | null;
    productName?: string;
    title?: string;
    showProductPicker?: boolean;
    showDatePicker?: boolean;
    showShiftSwitch?: boolean;
    products?: Product[];
}

const ScortaFormModal: React.FC<ScortaFormModalProps> = ({ 
    visible, 
    onClose, 
    onSave, 
    scorta, 
    productName,
    title,
    showProductPicker = false,
    showDatePicker = false,
    showShiftSwitch = false,
    products = []
}) => {
    const [lineaVoci, setLineaVoci] = useState([{ numScatole: '', peso: '' }]);
    const [sigillatoVoci, setSigillatoVoci] = useState([{ numScatole: '', peso: '' }]);
    const [apertoVoci, setApertoVoci] = useState([{ numScatole: '', peso: '' }]);
    const [scartoVoci, setScartoVoci] = useState([{ numScatole: '', peso: '' }]);
    const [saving, setSaving] = useState(false);
    
    // Stati per product picker, date e turno
    const [prodottoSelezionato, setProdottoSelezionato] = useState('');
    const [dataSelezionata, setDataSelezionata] = useState(new Date());
    const [isMattina, setIsMattina] = useState(true);
    const [showDatePickerInternal, setShowDatePickerInternal] = useState(false);

    // Pre-compila i campi quando si apre il modal
    useEffect(() => {
        if (visible) {
            if (scorta) {
                // Modalità modifica: inizializza con i valori attuali come singola voce
                setLineaVoci([{ numScatole: '1', peso: scorta.quantitaInLinea?.toString() || '0' }]);
                setSigillatoVoci([{ numScatole: '1', peso: scorta.quantitaInMagazzinoSigillato?.toString() || '0' }]);
                setApertoVoci([{ numScatole: '1', peso: scorta.quantitaInMagazzinoAperto?.toString() || '0' }]);
                setScartoVoci([{ numScatole: '1', peso: scorta.quantitaScarto?.toString() || '0' }]);
            } else {
                // Modalità creazione: inizializza con voci vuote
                setLineaVoci([{ numScatole: '', peso: '' }]);
                setSigillatoVoci([{ numScatole: '', peso: '' }]);
                setApertoVoci([{ numScatole: '', peso: '' }]);
                setScartoVoci([{ numScatole: '', peso: '' }]);
                setProdottoSelezionato('');
                setDataSelezionata(new Date());
                setIsMattina(true);
            }
        }
    }, [scorta, visible]);

    // Funzioni helper per gestire le voci
    const aggiungiVoce = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        setter((prev: any) => [...prev, { numScatole: '', peso: '' }]);
    };

    const rimuoviVoce = (setter: React.Dispatch<React.SetStateAction<any[]>>, index: number) => {
        setter((prev: any) => prev.filter((_: any, i: number) => i !== index));
    };

    const aggiornaVoce = (setter: React.Dispatch<React.SetStateAction<any[]>>, index: number, campo: string, valore: string) => {
        setter((prev: any) => prev.map((voce: any, i: number) => 
            i === index ? { ...voce, [campo]: valore } : voce
        ));
    };

    const calcolaTotale = (voci: { numScatole: string; peso: string }[]) => {
        return voci.reduce((totale, voce) => {
            const num = parseFloat(voce.numScatole) || 0;
            const peso = parseFloat(voce.peso) || 0;
            return totale + (num * peso);
        }, 0);
    };

    const handleSalva = async () => {
        try {
            setSaving(true);
            
            await onSave({
                qtaLinea: calcolaTotale(lineaVoci),
                qtaSigillato: calcolaTotale(sigillatoVoci),
                qtaAperto: calcolaTotale(apertoVoci),
                qtaScarto: calcolaTotale(scartoVoci),
                ...(showProductPicker && { productId: prodottoSelezionato }),
                ...(showDatePicker && { date: dataSelezionata }),
                ...(showShiftSwitch && { isMattina })
            });
            
            onClose();
        } catch (error) {
            console.error('Errore nel salvataggio:', error);
            Alert.alert('Errore', error.message || 'Impossibile salvare');
        } finally {
            setSaving(false);
        }
    };

    const calcolaTotaleScorta = () => {
        return calcolaTotale(lineaVoci) + calcolaTotale(sigillatoVoci) + calcolaTotale(apertoVoci);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title || (scorta ? 'Modifica Scorta' : 'Aggiungi Scorta')}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {showDatePicker && (
                            <>
                                <Text style={styles.label}>Data</Text>
                                <TouchableOpacity 
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePickerInternal(true)}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {dataSelezionata.toLocaleDateString('it-IT', { 
                                            day: 'numeric', 
                                            month: 'long', 
                                            year: 'numeric' 
                                        })}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={20} color="#2C5F2D" />
                                </TouchableOpacity>
                                
                                {showDatePickerInternal && (
                                    <View style={styles.datePickerWrapper}>
                                        <DateTimePicker
                                            value={dataSelezionata}
                                            mode="date"
                                            display="spinner"
                                            onChange={(event, date) => {
                                                if (date) setDataSelezionata(date);
                                            }}
                                            maximumDate={new Date()}
                                            style={styles.datePicker}
                                        />
                                        <View style={styles.datePickerButtons}>
                                            <TouchableOpacity 
                                                style={[styles.datePickerButton, styles.datePickerButtonCancel]}
                                                onPress={() => setShowDatePickerInternal(false)}
                                            >
                                                <Text style={styles.datePickerButtonTextCancel}>Annulla</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={[styles.datePickerButton, styles.datePickerButtonConfirm]}
                                                onPress={() => setShowDatePickerInternal(false)}
                                            >
                                                <Text style={styles.datePickerButtonTextConfirm}>Conferma</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}
                        
                        {showShiftSwitch && (
                            <View style={styles.switchContainer}>
                                <Text style={styles.label}>Turno</Text>
                                <View style={styles.switchRow}>
                                    <Text style={styles.switchLabel}>Sera <Ionicons name="moon" size={20} color="#2C5F2D" /></Text>
                                    <Switch
                                        value={isMattina}
                                        onValueChange={setIsMattina}
                                        trackColor={{ false: '#767577', true: '#2C5F2D' }}
                                        thumbColor={isMattina ? '#4A7C59' : '#f4f3f4'}
                                    />
                                    <Text style={styles.switchLabel}>Mattina <Ionicons name="sunny" size={20} color="#FFD700" /></Text>
                                </View>
                            </View>
                        )}
                        
                        {showProductPicker && (
                            <>
                                <Text style={styles.label}>Prodotto</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={prodottoSelezionato}
                                        onValueChange={(value) => setProdottoSelezionato(value)}
                                        style={styles.picker}
                                        itemStyle={styles.pickerItem}
                                    >
                                        <Picker.Item label="Seleziona un prodotto..." value="" color="#999" />
                                        {products.map((p: Product) => (
                                            <Picker.Item key={p.id} label={p.name} value={p.id} color="#333" />
                                        ))}
                                    </Picker>
                                </View>
                            </>
                        )}
                        
                        {productName && !showProductPicker && (
                            <Text style={styles.productName}>{productName}</Text>
                        )}

                        {scorta && (
                            <View style={styles.infoBox}>
                                <Text style={styles.infoText}>
                                    Turno: {scorta.isMorningShift ? '☀️ Mattino' : '🌙 Sera'}
                                </Text>
                                <Text style={styles.infoText}>
                                    Data: {new Date(scorta.createdAt).toLocaleDateString('it-IT')}
                                </Text>
                            </View>
                        )}

                        <View style={styles.totaleBox}>
                            <Text style={styles.totaleLabel}>Totale Scorta</Text>
                            <Text style={styles.totaleValue}>{calcolaTotaleScorta().toFixed(2)}</Text>
                        </View>

                        <VociInput
                            titolo="Quantità in Linea"
                            icon="stats-chart"
                            voci={lineaVoci}
                            onAggiungi={() => aggiungiVoce(setLineaVoci)}
                            onRimuovi={(index) => rimuoviVoce(setLineaVoci, index)}
                            onAggiorna={(index, campo, valore) => aggiornaVoce(setLineaVoci, index, campo, valore)}
                            totale={calcolaTotale(lineaVoci)}
                        />

                        <VociInput
                            titolo="Quantità Sigillato"
                            icon="lock-closed"
                            voci={sigillatoVoci}
                            onAggiungi={() => aggiungiVoce(setSigillatoVoci)}
                            onRimuovi={(index) => rimuoviVoce(setSigillatoVoci, index)}
                            onAggiorna={(index, campo, valore) => aggiornaVoce(setSigillatoVoci, index, campo, valore)}
                            totale={calcolaTotale(sigillatoVoci)}
                        />

                        <VociInput
                            titolo="Quantità Aperto"
                            icon="lock-open"
                            voci={apertoVoci}
                            onAggiungi={() => aggiungiVoce(setApertoVoci)}
                            onRimuovi={(index) => rimuoviVoce(setApertoVoci, index)}
                            onAggiorna={(index, campo, valore) => aggiornaVoce(setApertoVoci, index, campo, valore)}
                            totale={calcolaTotale(apertoVoci)}
                        />

                        <VociInput
                            titolo="Quantità Scarto"
                            icon="trash"
                            voci={scartoVoci}
                            onAggiungi={() => aggiungiVoce(setScartoVoci)}
                            onRimuovi={(index) => rimuoviVoce(setScartoVoci, index)}
                            onAggiorna={(index, campo, valore) => aggiornaVoce(setScartoVoci, index, campo, valore)}
                            totale={calcolaTotale(scartoVoci)}
                        />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity 
                            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                            onPress={handleSalva}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>
                                {saving ? 'Salvataggio...' : (scorta ? 'Salva Modifiche' : 'Salva Scorta')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C5F2D',
    },
    modalBody: {
        padding: 20,
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C5F2D',
        marginBottom: 12,
        textAlign: 'center',
    },
    infoBox: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    totaleBox: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2C5F2D',
    },
    totaleLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
    },
    totaleValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2C5F2D',
    },
    saveButton: {
        backgroundColor: '#2C5F2D',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#A0A0A0',
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 12,
    },
    dateButton: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 12,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#333',
    },
    datePickerWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#2C5F2D',
    },
    datePicker: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
    },
    datePickerButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    datePickerButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    datePickerButtonCancel: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    datePickerButtonConfirm: {
        backgroundColor: '#2C5F2D',
    },
    datePickerButtonTextCancel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    datePickerButtonTextConfirm: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    switchContainer: {
        marginTop: 12,
        marginBottom: 12,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 8,
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#2C5F2D',
        marginBottom: 16,
    },
    picker: {
        backgroundColor: '#FFFFFF',
        height: 180,
        width: '100%',
    },
    pickerItem: {
        fontSize: 18,
        color: '#333',
    },
});

export default ScortaFormModal;
