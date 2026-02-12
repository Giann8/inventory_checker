import { Stack } from 'expo-router';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useEffect } from 'react';
import NavigationFooter from '../components/navigation_footer';
import { syncWithSupabase } from '../Middleware/supabase_sync';
import { useState } from 'react';
import * as Updates from 'expo-updates';
import LoadingScreenUpdates from '../components/loadingScreenUpdates';



export default function Layout() {
  const [loadingState, setLoadingState] = useState<'checking-update' | 'syncing-db' | 'ready'>('checking-update');
  useEffect(() => {
    initApp();
  }, []);

  async function initApp() {
    if (!__DEV__) {
      try {
        setLoadingState('checking-update');
        console.log('Controllo aggiornamenti...');
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.log('Aggiornamento disponibile, scaricamento in corso...');
          await Updates.fetchUpdateAsync();
          console.log('Aggiornamento scaricato, riavvio app...');
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.error('Errore durante il controllo degli aggiornamenti:', error);
      }
    }
    setLoadingState('syncing-db');
    await pullOnStartup();
    setLoadingState('ready');
  }
  // Pull automatico all'avvio dell'app
  const pullOnStartup = async () => {
    try {
      console.log('Sincronizzazione all\'avvio...');
      await syncWithSupabase();
      console.log('Pull completato con successo');
    } catch (error) {
      console.error('Errore nella sincronizzazione all\'avvio:', error);
      // Non mostra alert per non disturbare l'utente all'avvio
    }
  };

  if (loadingState === 'checking-update') {
    return (
      <View style={styles.container}>
        <LoadingScreenUpdates message="Controllo aggiornamenti..." />
      </View>
    );
  }

  if (loadingState === 'syncing-db') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C5F2D" />
        <Text style={styles.loadingText}>Sincronizzazione con il database...</Text>
      </View>
    );
  }

  if (loadingState === 'ready') {
    return (
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
        <NavigationFooter />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C5F2D',
    marginTop: 20,
  }
});
