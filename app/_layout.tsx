import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrganizerProvider } from '../context/OrganizerContext';

export default function RootLayout() {
  return (
    <OrganizerProvider>
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
        <Stack.Screen 
          name="organizer/dashboard" 
          options={{ title: 'Organizer Dashboard' }} 
        />
        <Stack.Screen 
          name="organizer/event/[id]" 
          options={{ title: 'Manage Event' }} 
        />
      </Stack>
    </OrganizerProvider>
  );
}