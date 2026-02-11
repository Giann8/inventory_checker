import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import Ionicons from '@expo/vector-icons/Ionicons';
import database from '../db';
import Tare from '../model/tare';

interface TareCardProps {
    tara: Tare;
    onDelete: (tara: Tare) => void;
}

const TareCard: React.FC<TareCardProps> = ({ tara, onDelete }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.cardIcon}>
                    <Ionicons name="cube" size={32} color="#2C5F2D" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{tara.name}</Text>
                    <Text style={styles.cardWeight}>{tara.weight} g</Text>
                </View>
            </View>
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => onDelete(tara)}
            >
                <Ionicons name="trash-outline" size={24} color="#DC3545" />
            </TouchableOpacity>
        </View>
    );
};

interface ScreenTareBaseProps {
    tare: Tare[];
}

const ScreenTareBase: React.FC<ScreenTareBaseProps> = ({ tare }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [nome, setNome] = useState('');
    const [peso, setPeso] = useState('');

    const handleDelete = async (tara: Tare) => {
        Alert.alert(
            'Conferma',
            `Vuoi eliminare il contenitore "${tara.name}"?`,
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Elimina',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await tara.deleteTare();
                            Alert.alert('Successo', 'Contenitore eliminato!');
                        } catch (error) {
                            console.error('Errore eliminazione tara:', error);
                            Alert.alert('Errore', 'Impossibile eliminare il contenitore');
                        }
                    }
                }
            ]
        );
    };

    const handleAdd = async () => {
        if (!nome.trim()) {
            Alert.alert('Errore', 'Inserisci il nome del contenitore');
            return;
        }
        
        const pesoNum = parseFloat(peso);
        if (isNaN(pesoNum) || pesoNum <= 0) {
            Alert.alert('Errore', 'Inserisci un peso valido');
            return;
        }

        try {
            await Tare.creaTara(nome.trim(), pesoNum);
            Alert.alert('Successo', 'Contenitore aggiunto!');
            setNome('');
            setPeso('');
            setModalVisible(false);
        } catch (error) {
            console.error('Errore creazione tara:', error);
            Alert.alert('Errore', 'Impossibile aggiungere il contenitore');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Gestione Contenitori</Text>
                <Text style={styles.subtitle}>Definisci i pesi dei contenitori per la tara</Text>
            </View>

            {tare.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="cube-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Nessun contenitore definito</Text>
                    <Text style={styles.emptySubtext}>Aggiungi i contenitori per poterli usare nella tara</Text>
                </View>
            ) : (
                <FlatList
                    data={tare}
                    renderItem={({ item }) => (
                        <TareCard tara={item} onDelete={handleDelete} />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Modal per aggiungere tara */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity 
                        style={styles.modalOverlayTouchable}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    >
                        <TouchableOpacity 
                            activeOpacity={1} 
                            onPress={(e) => e.stopPropagation()}
                            style={styles.modalContent}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Nuovo Contenitore</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={28} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nome Contenitore</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={nome}
                                        onChangeText={setNome}
                                        placeholder="es. Cassetta grande, Scatola piccola..."
                                        placeholderTextColor="#999"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Peso (g)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={peso}
                                        onChangeText={setPeso}
                                        keyboardType="decimal-pad"
                                        placeholder="0.0"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity 
                                    style={styles.cancelButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Annulla</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.saveButton}
                                    onPress={handleAdd}
                                >
                                    <Text style={styles.saveButtonText}>Aggiungi</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const enhance = withObservables([], () => ({
    tare: database.get('tare').query().observe()
}));

export default enhance(ScreenTareBase);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2C5F2D',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 14,
        color: '#E8F5E9',
        marginTop: 4,
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    cardWeight: {
        fontSize: 14,
        color: '#666',
    },
    deleteButton: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2C5F2D',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalOverlayTouchable: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '80%',
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
        color: '#333',
    },
    modalBody: {
        padding: 20,
        maxHeight: 300,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#2C5F2D',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
