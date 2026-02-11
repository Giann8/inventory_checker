import { TouchableOpacity, Text, View, Alert, Modal, TextInput, StyleSheet } from "react-native";
import { useState } from "react";
import Product from "../model/product";
import { Picker } from '@react-native-picker/picker';
import { PRODUCT_TYPES, ProductType } from "../types/ProductTypes";
import Ionicons from '@expo/vector-icons/Ionicons';
export default function AddProdotto() {
    const [modalVisible, setModalVisible] = useState(false);
    const [step, setStep] = useState<'name' | 'type'>('name');
    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState<string>(ProductType.SALUME);

    const handleAddProduct = () => {
        setStep('name');
        setProductName('');
        setProductType(ProductType.SALUME);
        setModalVisible(true);
    };

    const handleNext = () => {
        if (!productName.trim()) {
            Alert.alert('Errore', 'Il nome del prodotto è obbligatorio');
            return;
        }
        setStep('type');
    };

    const handleBack = () => {
        setStep('name');
    };

    const handleCreate = async () => {
        if (!productType) {
            Alert.alert('Errore', 'Il tipo del prodotto è obbligatorio');
            return;
        }
        
        try {
            Product.creaProdotto(productName.trim(), productType);
            Alert.alert('Successo', `Prodotto "${productName}" creato correttamente!`);
            setModalVisible(false);
            setProductName('');
            setProductType(ProductType.SALUME);
            setStep('name');
        } catch (error) {
            Alert.alert('Errore', 'Impossibile creare il prodotto');
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
        setProductName('');
        setProductType(ProductType.SALUME);
        setStep('name');
    };

    return (
        <>
            <TouchableOpacity
                style={styles.logisticButton}
                onPress={handleAddProduct}
                activeOpacity={0.8}
            >
                <View>
                    <Text style={styles.buttonIcon}><Ionicons name="cube" size={40} color="#FFF" /></Text>
                    <Text style={styles.buttonText}>Aggiungi Prodotto</Text>
                </View>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCancel}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {step === 'name' ? 'Nuovo Prodotto' : 'Tipo Prodotto'}
                        </Text>
                        
                        {step === 'name' ? (
                            <>
                                <Text style={styles.modalLabel}>Nome del prodotto:</Text>
                                <TextInput
                                    style={styles.input}
                                    value={productName}
                                    onChangeText={setProductName}
                                    placeholder="Es: Latte Fresco"
                                    placeholderTextColor="#999"
                                    autoFocus
                                />
                                
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={handleCancel}
                                    >
                                        <Text style={styles.cancelButtonText}>Annulla</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.primaryButton]}
                                        onPress={handleNext}
                                    >
                                        <Text style={styles.primaryButtonText}>Avanti</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.modalLabel}>Tipo del prodotto:</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={productType}
                                        onValueChange={(itemValue) => setProductType(itemValue)}
                                        style={styles.picker}
                                    >
                                        {PRODUCT_TYPES.map((type) => (
                                            <Picker.Item 
                                                key={type.value} 
                                                label={type.label} 
                                                value={type.value} 
                                            />
                                        ))}
                                    </Picker>
                                </View>
                                
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={handleBack}
                                    >
                                        <Text style={styles.cancelButtonText}>Indietro</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.primaryButton]}
                                        onPress={handleCreate}
                                    >
                                        <Text style={styles.primaryButtonText}>Crea</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    logisticButton: {
        backgroundColor: '#2C5F2D',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
        borderWidth: 2,
        borderColor: '#4A7C59',
    },
    buttonIcon: {
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2C5F2D',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    pickerContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 20,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: '#2C5F2D',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});