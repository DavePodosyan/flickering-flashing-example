import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const creatDbIfNotExists = async (db: SQLiteDatabase) => {
    console.log('Creating database if not exists');
    console.log(FileSystem.documentDirectory)
    //drop table film if exists
    // await db.execAsync(`
    //   DROP TABLE IF EXISTS films;
    //   DROP TABLE IF EXISTS frames;
    // `);
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS films (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        title TEXT NOT NULL,
        iso INTEGER NOT NULL,
        camera TEXT,
        status TEXT NOT NULL DEFAULT 'in-camera',
        frame_count INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        completed_at DATETIME
      );
      CREATE TABLE IF NOT EXISTS frames (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        film_id INTEGER NOT NULL,
        aperture TEXT NOT NULL,
        shutter_speed TEXT NOT NULL,
        frame_no INTEGER NOT NULL,
        note TEXT,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
    );
    `);

  }


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName="rollio.db" onInit={creatDbIfNotExists}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </SQLiteProvider>

    </ThemeProvider>
  );
}

