import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#fff" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
      </SafeAreaView>
    </>
  );
}