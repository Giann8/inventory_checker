import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, Switch } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { withObservables } from "@nozbe/watermelondb/react";
import { Q } from "@nozbe/watermelondb";
import PesoStandardCard from '../../components/peso_standard_card';
import Product from '../../model/product';
import PesoStandard from '../../model/peso_standard';
import database from '../../db';
import { Button } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2C5F2D',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#E8F5E8',
        marginBottom: 4,
    },
    productType: {
        fontSize: 14,
        color: '#B8E6B8',
        textTransform: 'capitalize',
    },
    listContainer: {
        padding: 16,
    },
    pesoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pesoInfo: {
        flex: 1,
    },
    pesoValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2C5F2D',
        marginBottom: 4,
    },
    pesoDescrizione: {
        fontSize: 14,
        color: '#666',
    },
    defaultBadge: {
        backgroundColor: '#FFF3CD',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    defaultText: {
        fontSize: 12,
        color: '#856404',
        fontWeight: '600',
    },
    pesoActions: {
        flexDirection: 'row',
        gap: 8,
    },
    defaultButton: {
        backgroundColor: '#FFC107',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    defaultButtonText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    deleteButtonText: {
        fontSize: 18,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#2C5F2D',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    addButtonIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
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
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2C5F2D',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
        marginTop: 8,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#dee2e6',
        marginBottom: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#6c757d',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalAddButton: {
        flex: 1,
        backgroundColor: '#2C5F2D',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalAddText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff5f5',
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 18,
        color: '#dc3545',
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        marginBottom: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    warningText: {
        fontSize: 12,
        color: '#856404',
        fontStyle: 'italic',
        marginTop: 4,
    },
});

const PesiStandardScreen = ({ prodotto, pesiStandard }:{prodotto: Product, pesiStandard: PesoStandard[]}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [peso, setPeso] = useState('');
    const [descrizione, setDescrizione] = useState('');
    const [isDefault, setIsDefault] = useState(false);


    const handleAggiungiPeso = async () => {
        const pesoNumerico = parseFloat(peso);
        
        if (!peso.trim() || isNaN(pesoNumerico) || pesoNumerico <= 0) {
            Alert.alert('Errore', 'Inserisci un peso valido maggiore di 0');
            return;
        }

        try {

            // Aggiungi il nuovo peso
            await prodotto.aggiungiPesoStandard(pesoNumerico, descrizione, isDefault);
            
            // Reset del form e chiudi modal
            setPeso('');
            setDescrizione('');
            setIsDefault(false);
            setModalVisible(false);
            
            Alert.alert('Successo', 'Peso standard aggiunto correttamente');
        } catch (error) {
            console.error('Errore aggiunta peso:', error);
            Alert.alert('Errore', 'Impossibile aggiungere il peso standard');
        }
    };

    const renderPesoCard = ({ item }:{ item: PesoStandard }) => (
        <View style={styles.pesoCard}>
            <View style={styles.pesoInfo}>
                <PesoStandardCard pesoStandard={item} />
            </View>
        </View>
    );
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pesi Standard prodotto {prodotto.name}</Text>
            {pesiStandard.map(peso => (
                <View key={peso.id}>{renderPesoCard({ item: peso })}</View>
            ))}
            
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addButtonIcon}>+</Text>
                <Text style={styles.addButtonText}>Aggiungi Peso Standard</Text>
            </TouchableOpacity>

            <Modal 
                visible={modalVisible} 
                transparent 
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nuovo Peso Standard</Text>
                        
                        <Text style={styles.inputLabel}>Peso (grammi) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Es. 100"
                            value={peso}
                            onChangeText={setPeso}
                            keyboardType="decimal-pad"
                        />
                        
                        <Text style={styles.inputLabel}>Descrizione</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Es. Porzione piccola"
                            value={descrizione}
                            onChangeText={setDescrizione}
                        />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setPeso('');
                                    setDescrizione('');
                                    setIsDefault(false);
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalCancelText}>Annulla</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.modalAddButton}
                                onPress={handleAggiungiPeso}
                            >
                                <Text style={styles.modalAddText}>Aggiungi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const EnhancedScreen = withObservables(['productId'], ({ productId }: { productId: string }) => ({
    prodotto: database.get('prodotti').findAndObserve(productId),
    pesiStandard: database.get('pesi_standard').query(Q.where('product_id', productId)).observe(),
}))(PesiStandardScreen);

const ScreenWrapper = () => {
    const params = useLocalSearchParams();
    const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId;
    
    if (!productId) {
        return <Text>Product ID non trovato</Text>;
    }
    
    return <EnhancedScreen productId={productId} />;
};

export default ScreenWrapper;