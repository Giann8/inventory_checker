import { TouchableOpacity, Text, View, Alert, Modal, TextInput, StyleSheet } from "react-native";
import { useState } from "react";
import Product from "../model/product";
import { Picker } from '@react-native-picker/picker';
import { PRODUCT_TYPES, ProductType } from "../types/ProductTypes";
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../theme';
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
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        marginHorizontal: theme.spacing.md,
        marginVertical: theme.spacing.sm,
        shadowColor: theme.colors.textPrimary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: theme.shadows.md.shadowOpacity,
        shadowRadius: theme.shadows.md.shadowRadius,
        elevation: theme.shadows.md.elevation,
        borderWidth: 2,
        borderColor: theme.colors.primaryDark,
    },
    buttonIcon: {
        fontSize: 28,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
        color: theme.colors.surface,
    },
    buttonText: {
        fontSize: 16,
        color: theme.colors.surface,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        width: '85%',
        maxWidth: 400,
        shadowColor: theme.colors.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: theme.shadows.md.shadowOpacity,
        shadowRadius: theme.shadows.md.shadowRadius,
        elevation: theme.shadows.md.elevation,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    modalLabel: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
        fontWeight: '500',
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        fontSize: 16,
        marginBottom: theme.spacing.lg,
        color: theme.colors.textPrimary,
    },
    pickerContainer: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.lg,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    modalButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
    },
    primaryButtonText: {
        color: theme.colors.surface,
        fontSize: 16,
        fontWeight: '700',
    },
});