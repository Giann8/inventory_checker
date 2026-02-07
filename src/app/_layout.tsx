import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import NavigationFooter from '../components/navigation_footer';

export default function Layout() {
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
