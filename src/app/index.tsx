import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../db';
import { Q } from '@nozbe/watermelondb';
import { of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { useState, useEffect } from 'react';
import { checkUnsyncedChanges, syncManuale } from '../Middleware/supabase_sync';
import NetInfo from '@react-native-community/netinfo';

const getCurrentShift = () => {
  const hour = new Date().getHours();
  return hour < 14 ? 'Mattina ☀️' : 'Sera 🌙';
};

const HomeScreenCrude = ({ productCount, scorteOggi, turnoAttuale, differenzeTurni }) => {
  const [hasUnsynced, setHasUnsynced] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Controlla modifiche non sincronizzate
  useEffect(() => {
    const checkSync = async () => {
      const unsynced = await checkUnsyncedChanges();
      setHasUnsynced(unsynced);
    };
    
    checkSync();
    const interval = setInterval(checkSync, 5000); // Controlla ogni 5 secondi
    
    return () => clearInterval(interval);
  }, []);

  // Controlla connessione
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await syncManuale();
    setIsSyncing(false);
    
    Alert.alert(
      result.success ? '✓ Sincronizzazione' : '✗ Errore',
      result.message
    );
    
    if (result.success) {
      const unsynced = await checkUnsyncedChanges();
      setHasUnsynced(unsynced);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Checker</Text>
      </View>
      
      {/* Sync Status Banner */}
      {(hasUnsynced || !isOnline) && (
        <TouchableOpacity 
          style={[styles.syncBanner, !isOnline && styles.syncBannerOffline]} 
          onPress={handleManualSync}
          disabled={isSyncing || !isOnline}
        >
          {isSyncing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.syncBannerIcon}>
                {!isOnline ? '📴' : hasUnsynced ? '🔄' : '✓'}
              </Text>
              <View style={styles.syncBannerTextContainer}>
                <Text style={styles.syncBannerText}>
                  {!isOnline 
                    ? 'Modalità Offline' 
                    : hasUnsynced 
                    ? 'Modifiche non sincronizzate'
                    : 'Tutto sincronizzato'}
                </Text>
                {isOnline && hasUnsynced && (
                  <Text style={styles.syncBannerSubtext}>Tocca per sincronizzare</Text>
                )}
              </View>
            </>
          )}
        </TouchableOpacity>
      )}
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Prodotti Totali</Text>
          <Text style={styles.statValue}>{productCount}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Turno Attuale</Text>
          <Text style={styles.statValue}>{turnoAttuale}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Scorte Oggi</Text>
          <Text style={styles.statValue}>{scorteOggi}</Text>
        </View>
        
        <View style={[styles.statCard, differenzeTurni > 0 && styles.statCardWarning]}>
          <Text style={styles.statLabel}>Differenze Turni</Text>
          <Text style={styles.statValue}>{differenzeTurni}</Text>
          <Text style={styles.statSubtext}>
            {differenzeTurni === 0 ? 'Tutto Ok ✓' : 'Prodotti con variazioni'}
          </Text>
        </View>
      </View>
      
      <View style={styles.linksContainer}>
        <Link href="/screen_lista_prodotti" style={styles.link}>
          <Text style={styles.linkText}>📦 Gestisci Prodotti</Text>
        </Link>
        <Link href="/screen_scorte_giornaliere" style={styles.link}>
          <Text style={styles.linkText}>📊 Scorte Giornaliere</Text>
        </Link>
        <Link href="/aggiungi_scorte" style={styles.link}>
          <Text style={styles.linkText}>➕ Aggiungi Scorte</Text>
        </Link>
      </View>
      
      <StatusBar style="auto" />
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2C5F2D',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C5F2D',
  },
  statSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statCardWarning: {
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  linksContainer: {
    gap: 12,
  },
  link: {
    backgroundColor: '#2C5F2D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  syncBanner: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncBannerOffline: {
    backgroundColor: '#757575',
  },
  syncBannerIcon: {
    fontSize: 20,
  },
  syncBannerTextContainer: {
    flex: 1,
  },
  syncBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  syncBannerSubtext: {
    color: '#FFFFFF',
    fontSize: 11,
    opacity: 0.9,
    marginTop: 2,
  },
});

const HomeScreen = withObservables([], () => {
  const productsCollection = database.get('prodotti');
  const scorteCollection = database.get('scorte');
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  // Scorte mattina di oggi (< 14:00)
  const startOfMorning = new Date();
  startOfMorning.setHours(0, 0, 0, 0);
  const endOfMorning = new Date();
  endOfMorning.setHours(13, 59, 59, 999);
  
  // Scorte sera di ieri (>= 14:00)
  const startOfYesterdayEvening = new Date();
  startOfYesterdayEvening.setDate(startOfYesterdayEvening.getDate() - 1);
  startOfYesterdayEvening.setHours(14, 0, 0, 0);
  const endOfYesterday = new Date();
  endOfYesterday.setDate(endOfYesterday.getDate() - 1);
  endOfYesterday.setHours(23, 59, 59, 999);
  
  const scorteMattina$ = scorteCollection
    .query(
      Q.where('created_at', Q.gte(startOfMorning.getTime())),
      Q.where('created_at', Q.lte(endOfMorning.getTime()))
    )
    .fetch(); // Non serve osservare, basta una fetch statica per il confronto
    
  const scorteSera$ = scorteCollection
    .query(
      Q.where('created_at', Q.gte(startOfYesterdayEvening.getTime())),
      Q.where('created_at', Q.lte(endOfYesterday.getTime()))
    )
    .fetch(); // Non serve osservare, basta una fetch statica per il confronto
  
  const differenzeTurni$ = combineLatest([scorteMattina$, scorteSera$]).pipe(
    map(([mattina, sera]) => {
      // Crea mappa delle scorte sera per productId
      const seraMap = new Map();
      sera.forEach((s: any) => {
        seraMap.set(s.productId, s.quantitaTotale);
      });
      
      // Crea mappa delle scorte mattina per productId
      const mattinaMap = new Map();
      mattina.forEach((s: any) => {
        mattinaMap.set(s.productId, s.quantitaTotale);
      });
      
      // Trova tutti i prodotti unici
      const allProductIds = new Set([...seraMap.keys(), ...mattinaMap.keys()]);
      
      // Conta quanti prodotti hanno differenze
      let differenze = 0;
      allProductIds.forEach(productId => {
        const qtaSera = seraMap.get(productId) || 0;
        const qtaMattina = mattinaMap.get(productId) || 0;
        
        // Se c'è una differenza o manca una registrazione
        if (qtaSera !== qtaMattina) {
          differenze++;
        }
      });
      
      return differenze;
    })
  );
  
  return {
    productCount: productsCollection.query().observeCount(),
    scorteOggi: scorteCollection
      .query(
        Q.where('created_at', Q.gte(startOfDay.getTime())),
        Q.where('created_at', Q.lte(endOfDay.getTime()))
      )
      .observeCount(),
    turnoAttuale: of(getCurrentShift()),
    differenzeTurni: differenzeTurni$,
  };
})(HomeScreenCrude);

export default HomeScreen;