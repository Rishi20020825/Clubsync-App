import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Stack
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ title: 'ClubSync' }}
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{}} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ title: 'Event Details' }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}