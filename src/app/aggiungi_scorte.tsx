import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import database from '../db';
import Product from '../model/product';
import Scorte from '../model/scorte';
import ScortaFormModal from '../components/modifica_scorta_modal';


const AggiungiScorteScreenCrude = ({ prodotti }:{ prodotti: Product[] }) => {
    const [modalOggiVisible, setModalOggiVisible] = useState(false);
    const [modalSpecificoVisible, setModalSpecificoVisible] = useState(false);
    
    /**
     * Verifica se esiste già una scorta per il prodotto nella data e turno specificati
     * @param productId - ID del prodotto
     * @param data - Data della scorta
     * @param isMattina - true per turno mattino, false per sera
     * @returns true se esiste già una scorta, false altrimenti
     */
    const verificaScortaEsistente = async (productId: string, data: Date, isMattina: boolean): Promise<boolean> => {
        const startHour = isMattina ? 0 : 14;
        const endHour = isMattina ? 14 : 24;
        
        const dataInizio = new Date(data);
        dataInizio.setHours(startHour, 0, 0, 0);
        const dataFine = new Date(data);
        dataFine.setHours(endHour, 0, 0, 0);
        
        const scortaEsistente = await database.get('scorte')
            .query(
                Q.where('product_id', productId),
                Q.where('created_at', Q.gte(dataInizio.getTime())),
                Q.where('created_at', Q.lt(dataFine.getTime()))
            )
            .fetch();
        
        return scortaEsistente.length > 0;
    };
    
    const handleSalvaOggi = async (data: {
        qtaLinea: number;
        qtaSigillato: number;
        qtaAperto: number;
        qtaScarto: number;
        productId?: string;
    }) => {
        try {
            if (!data.productId) {
                Alert.alert('Errore', 'Seleziona un prodotto');
                return;
            }

            // Determina il turno attuale
            const oraAttuale = new Date().getHours();
            const isMattina = oraAttuale < 14;
            
            // Verifica se esiste già una scorta per questo turno
            const esiste = await verificaScortaEsistente(data.productId, new Date(), isMattina);
            
            if (esiste) {
                Alert.alert(
                    'Scorta già esistente', 
                    `Esiste già una scorta per questo prodotto nel turno ${isMattina ? 'mattino' : 'sera'} di oggi. Non puoi crearne un'altra.`
                );
                return;
            }

            await Scorte.creaScorta(
                data.productId, 
                data.qtaLinea, 
                data.qtaSigillato, 
                data.qtaAperto, 
                data.qtaScarto
            );
            
            Alert.alert('Successo', 'Scorta salvata con successo!');
            setModalOggiVisible(false);
        } catch (error) {
            console.error('Errore salvataggio scorta:', error);
            Alert.alert('Errore', 'Impossibile salvare la scorta');
        }
    };
    
    const handleSalvaSpecifico = async (data: {
        qtaLinea: number;
        qtaSigillato: number;
        qtaAperto: number;
        qtaScarto: number;
        productId?: string;
        date?: Date;
        isMattina?: boolean;
    }) => {
        try {
            if (!data.productId) {
                Alert.alert('Errore', 'Seleziona un prodotto');
                return;
            }
            
            if (!data.date || data.isMattina === undefined) {
                Alert.alert('Errore', 'Dati mancanti');
                return;
            }

            // Verifica se esiste già una scorta per questo turno
            const esiste = await verificaScortaEsistente(data.productId, data.date, data.isMattina);
            
            if (esiste) {
                Alert.alert(
                    'Scorta già esistente', 
                    `Esiste già una scorta per questo prodotto nel turno ${data.isMattina ? 'mattino' : 'sera'} del ${data.date.toLocaleDateString('it-IT')}. Non puoi crearne un'altra.`
                );
                return;
            }

            await Scorte.creaScorta(
                data.productId, 
                data.qtaLinea, 
                data.qtaSigillato, 
                data.qtaAperto, 
                data.qtaScarto,
                data.isMattina,
                data.date
            );
            
            Alert.alert('Successo', 'Scorta salvata con successo!');
            setModalSpecificoVisible(false);
        } catch (error) {
            console.error('Errore salvataggio scorta:', error);
            Alert.alert('Errore', 'Impossibile salvare la scorta');
        }
    };
    
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Gestione Scorte</Text>
            </View>
            
            <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                    style={styles.bigButton} 
                    onPress={() => setModalOggiVisible(true)}
                >
                    <Ionicons name="calendar" size={48} color="#FFFFFF" />
                    <Text style={styles.bigButtonText}>Aggiungi Scorta</Text>
                    <Text style={styles.bigButtonText}>di Oggi</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.bigButton, styles.bigButtonSecondary]} 
                    onPress={() => setModalSpecificoVisible(true)}
                >
                    <Ionicons name="time" size={48} color="#FFFFFF" />
                    <Text style={styles.bigButtonText}>Aggiungi Scorta</Text>
                    <Text style={styles.bigButtonText}>di un Giorno Specifico</Text>
                </TouchableOpacity>
            </View>
            
            {/* Modal per scorta di oggi */}
            <ScortaFormModal
                visible={modalOggiVisible}
                onClose={() => setModalOggiVisible(false)}
                onSave={handleSalvaOggi}
                title="Scorta di Oggi"
                showProductPicker={true}
                products={prodotti}
            />
            
            {/* Modal per scorta di giorno specifico */}
            <ScortaFormModal
                visible={modalSpecificoVisible}
                onClose={() => setModalSpecificoVisible(false)}
                onSave={handleSalvaSpecifico}
                title="Scorta Giorno Specifico"
                showProductPicker={true}
                showDatePicker={true}
                showShiftSwitch={true}
                products={prodotti}
            />
        </View>
    )
}

const enhance = withObservables([], () => ({
    prodotti: database.get('prodotti').query().observe()
}));

export default enhance(AggiungiScorteScreenCrude);

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
        alignItems: 'center',
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
    buttonsContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        gap: 20,
    },
    bigButton: {
        backgroundColor: '#2C5F2D',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    bigButtonSecondary: {
        backgroundColor: '#4A7C59',
    },
    bigButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
});