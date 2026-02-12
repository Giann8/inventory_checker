import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../db';
import { Q } from '@nozbe/watermelondb';
import DateNavigationBar from '../components/date_navigation_bar';
import Scorte from '../model/scorte';
import Product from '../model/product';
import ScortaCard from '../components/scorta_card';
import ScortaNullObjectComponent from '../components/scorta_nullObject_component';
import ModificaScortaModal from '../components/modifica_scorta_modal';
import Ionicons from '@expo/vector-icons/Ionicons';

const ScreenScorteGiornaliereCrude = ({ 
  prodotti, 
  scorte 
}: { 
  prodotti: Product[];
  scorte: Scorte[];
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [scortaSelezionata, setScortaSelezionata] = useState<Scorte | null>(null);
  const [prodottoSelezionato, setProdottoSelezionato] = useState<Product | null>(null);

  // Crea mappe per accesso rapido
  const scorteMattMap = new Map(
    scorte.filter(s => s.isMorningShift).map(s => [s.productId, s])
  );
  const scorteSeraMap = new Map(
    scorte.filter(s => !s.isMorningShift).map(s => [s.productId, s])
  );

  const handleCardPress = (scorta: Scorte, prodotto: Product) => {
    setScortaSelezionata(scorta);
    setProdottoSelezionato(prodotto);
    setModalVisible(true);
  };

  const handleSaveScorta = async (data: {
    qtaLinea: number;
    qtaSigillato: number;
    qtaAperto: number;
    qtaScarto: number;
  }) => {
    if (!scortaSelezionata) {
      throw new Error('Nessuna scorta selezionata');
    }

    // Usa i writer esistenti
    await scortaSelezionata.aggiornaScortaInLinea(data.qtaLinea);
    await scortaSelezionata.aggiornaScortaSigillata(data.qtaSigillato);
    await scortaSelezionata.aggiornaScortaAperta(data.qtaAperto);
    await scortaSelezionata.aggiornaScortaScarto(data.qtaScarto);
  };

  const renderScortaCard = (scorta:Scorte) => {
    return (
      <ScortaCard
        key={scorta.id}
        scorta={scorta}
        onPress={handleCardPress}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Sezione Mattino */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}><Ionicons name="sunny" size={20} color={theme.colors.warning} /></Text>
          <Text style={styles.sectionTitle}>Turno Mattino</Text>
        </View>
        <View style={styles.sectionContent}>
          {prodotti.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>Nessun prodotto disponibile</Text>
            </View>
          ) : (
            prodotti.map(prodotto =>
              scorteMattMap.has(prodotto.id) ? renderScortaCard(scorteMattMap.get(prodotto.id)) : (
                <ScortaNullObjectComponent key={`mattino-${prodotto.id}`} prodotto={prodotto} />
              )
            )
          )}
        </View>
      </View>

      {/* Sezione Sera */}
      <View style={styles.section}>
        <View style={[styles.sectionHeader, styles.sectionHeaderEvening]}>
          <Text style={styles.sectionIcon}><Ionicons name="moon" size={20} color={theme.colors.warning} /></Text>
          <Text style={styles.sectionTitle}>Turno Sera</Text>
        </View>
        <View style={styles.sectionContent}>
          {prodotti.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>Nessun prodotto disponibile</Text>
            </View>
          ) : (
            prodotti.map(prodotto =>
              scorteSeraMap.has(prodotto.id) ? renderScortaCard(scorteSeraMap.get(prodotto.id)) : (
                <ScortaNullObjectComponent key={`sera-${prodotto.id}`} prodotto={prodotto} />
              )
            )
          )}
        </View>
      </View>
      
      <ModificaScortaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveScorta}
        scorta={scortaSelezionata}
        productName={prodottoSelezionato?.name}
      />
    </ScrollView>
  );
};

const EnhancedScreen = withObservables(['selectedDate'], ({ selectedDate }: { selectedDate: Date }) => {
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    prodotti: database.get('prodotti').query().observe(),
    scorte: database.get('scorte').query(
      Q.where('created_at', Q.gte(startOfDay.getTime())),
      Q.where('created_at', Q.lte(endOfDay.getTime()))
    ).observe()
  };
})(ScreenScorteGiornaliereCrude);

const ScreenScorteGiornaliereWrapper = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <View style={styles.wrapper}>
      <DateNavigationBar 
        currentDate={selectedDate}
        onDateChange={setSelectedDate}
        showShiftIndicator={true}
      />
      <EnhancedScreen selectedDate={selectedDate} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '33',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: 8,
  },
  sectionHeaderEvening: {
    backgroundColor: theme.colors.primaryLight,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  sectionContent: {
    padding: 12,
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  scortaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scortaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
  },
  shiftBadgeSmall: {
    backgroundColor: theme.colors.warning + '33',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftBadgeEveningSmall: {
    backgroundColor: theme.colors.primaryLight,
  },
  shiftBadgeTextSmall: {
    fontSize: 14,
  },
  stockInfo: {
    marginTop: 8,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  stockValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  stockValueZero: {
    color: theme.colors.textDisabled,
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  stockItem: {
    alignItems: 'center',
    flex: 1,
  },
  stockDetailLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  stockDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

export default ScreenScorteGiornaliereWrapper;