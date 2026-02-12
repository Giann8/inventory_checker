import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, AppState } from 'react-native';
import { theme } from '../theme';
import { Link } from 'expo-router';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../db';
import { Q } from '@nozbe/watermelondb';
import { of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { useState, useEffect } from 'react';
import { checkUnsyncedChanges, syncManuale, syncWithSupabase } from '../Middleware/supabase_sync';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from '@expo/vector-icons/Ionicons';

let lastAutoSyncTime = Date.now();

function useCountdown(targetTime: number, duration: number = 300) {
  const [secondsLeft, setSecondsLeft] = useState(() => 
    Math.max(0, duration - Math.floor((Date.now() - targetTime) / 1000))
  );
  
  useEffect(() => {
    const updateCountdown = () => {
      const elapsed = Math.floor((Date.now() - targetTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setSecondsLeft(remaining);
      return remaining;
    };
    
    const timer = setInterval(() => {
      const remaining = updateCountdown();
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetTime, duration]);
  
  return secondsLeft;
}


const getCurrentShift = () => {
  const hour = new Date().getHours();
  return (hour < 14 && hour >= 8 ? <Text>Mattina <Ionicons name="sunny" size={24} color="orange" /></Text> : <Text>Sera <Ionicons name="moon" size={24} color="#FFA500" /></Text>);
};

const HomeScreenCrude = ({ productCount, scorteOggi, turnoAttuale, differenzeTurni }) => {
  const [hasUnsynced, setHasUnsynced] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  useEffect(() => {

    const checkSync = async () => {
      try {
        const unsynced = await checkUnsyncedChanges();
        setHasUnsynced(unsynced);

        if (isOnline && !unsynced) {
          await syncWithSupabase();
        }

        lastAutoSyncTime = Date.now();
      } catch (error) {
        console.log('Errore nel polling di sincronizzazione:', error);
      }
    };

    const interval = setInterval(checkSync, 300000);

    return () => clearInterval(interval);
  }, [isOnline]);

const secondsLeft = useCountdown(lastAutoSyncTime, 300);

  // Calcola secondi rimanenti basandosi sul timestamp
  const getSecondsUntilSync = () => {
    const elapsed = Math.floor((Date.now() - lastAutoSyncTime) / 1000);
    const remaining = Math.max(0, 300 - elapsed);
    return remaining;
  };

  // Controlla connessione
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    return () => unsubscribe();
  }, []);


  //Controllo aggiornamenti alla chiusura dell'app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('App in background, tentativo sincronizzazione...');
        try {
          const unsynced = await checkUnsyncedChanges();
          if (unsynced && isOnline) {
            await syncWithSupabase();
            console.log('Sincronizzazione in background completata');
          }
        } catch (error) {
          console.log('Errore sincronizzazione in background:', error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isOnline]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await syncManuale();
    setIsSyncing(false);

    Alert.alert(
      result.success ? '✓ Sincronizzazione' : '✗ Errore',
      result.message
    );

    if (result.success) {
      setHasUnsynced(false);

      setTimeout(async () => {
        const unsynced = await checkUnsyncedChanges();
        setHasUnsynced(unsynced);
      }, 2000);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Checker</Text>
      </View>

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
                {!isOnline ? <Ionicons name="cloud-offline" size={16} color="#FFF" /> : <Ionicons name="cloud-upload" size={16} color="#FFF" />}
              </Text>
              <View style={styles.syncBannerTextContainer}>
                <Text style={styles.syncBannerText}>
                  {!isOnline
                    ? 'Modalità Offline'
                    : 'Modifiche locali da sincronizzare'}
                </Text>
                {isOnline && hasUnsynced && (
                  <Text style={styles.syncBannerSubtext}>Tocca per sincronizzare</Text>
                )}
              </View>
            </>
          )}
        </TouchableOpacity>
      )}

      {isOnline && !hasUnsynced && !isSyncing && (
        <View style={styles.countdownBanner}>
          <Text style={styles.countdownText}>
            Prossimo aggiornamento tra {Math.floor(getSecondsUntilSync() / 60)}:{String(getSecondsUntilSync() % 60).padStart(2, '0')}
          </Text>
        </View>
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
            <Text style={styles.linkText}><Ionicons name="cube" size={20} color="#FFF" /> Gestisci Prodotti</Text>
          </Link>
          <Link href="/screen_scorte_giornaliere" style={styles.link}>
            <Text style={styles.linkText}><Ionicons name="bar-chart" size={20} color="#FFF" /> Scorte Giornaliere</Text>
          </Link>
          <Link href="/aggiungi_scorte" style={styles.link}>
            <Text style={styles.linkText}><Ionicons name="add" size={20} color="#FFF" /> Aggiungi Scorte</Text>
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
    backgroundColor: theme.colors.background,
  },

  offlineText: {
    fontSize: 14,
    color: theme.colors.warning,
    marginTop: 10,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.shadows.md.shadowOpacity,
    shadowRadius: theme.shadows.md.shadowRadius,
    elevation: theme.shadows.md.elevation,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.surface,
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.shadows.md.shadowOpacity,
    shadowRadius: theme.shadows.md.shadowRadius,
    elevation: theme.shadows.md.elevation,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statSubtext: {
    fontSize: 12,
    color: theme.colors.textDisabled ?? '#999',
    marginTop: 4,
  },
  statCardWarning: {
    borderWidth: 2,
    borderColor: theme.colors.warning,
  },
  linksContainer: {
    gap: 12,
  },
  link: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: theme.colors.surface,
  },
  syncBanner: {
    backgroundColor: theme.colors.warning,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncBannerOffline: {
    backgroundColor: theme.colors.textDisabled ?? '#757575',
  },
  syncBannerIcon: {
    fontSize: 20,
  },
  syncBannerTextContainer: {
    flex: 1,
  },
  syncBannerText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  syncBannerSubtext: {
    color: theme.colors.surface,
    fontSize: 11,
    opacity: 0.9,
    marginTop: 2,
  },
  countdownBanner: {
    backgroundColor: theme.colors.success ?? '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  countdownText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '500',
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