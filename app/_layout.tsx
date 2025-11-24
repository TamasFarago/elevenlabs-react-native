import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ElevenLabsProvider } from '@elevenlabs/react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { IntakeFormProvider } from '@/src/context/IntakeFormContext';
import { VoiceAgentProvider } from '@/src/providers/VoiceAgentProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = (() => {
    const segment = segments[1] ?? 'home';
    return segment === 'index' ? 'home' : segment;
  })();

  const handleNavigate = (path: string) => {
    router.navigate(path as Parameters<typeof router.navigate>[0]);
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ElevenLabsProvider>
        <IntakeFormProvider>
          <VoiceAgentProvider currentRoute={currentRoute} onNavigate={handleNavigate}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </VoiceAgentProvider>
        </IntakeFormProvider>
      </ElevenLabsProvider>
    </ThemeProvider>
  );
}
