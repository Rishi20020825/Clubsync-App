import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    
    <>
      <StatusBar style="light" backgroundColor="#6366f1" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'ClubSync',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            title: 'Event Details' 
          }} 
        />
      </Stack>
    </>
  );
}