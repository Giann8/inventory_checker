import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import NavigationFooter from '../components/navigation_footer';
import { syncWithSupabase } from '../Middleware/supabase_sync';

export default function Layout() {

  useEffect(() => {
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

    pullOnStartup();
  }, []);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
