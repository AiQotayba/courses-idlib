import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { CoursesScreen } from './src/screens/CoursesScreen';
import { CourseDetailScreen } from './src/screens/CourseDetailScreen';
import { LoginScreen } from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
    primary: '#0f172a',
  },
};

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <NavigationContainer theme={theme}>
        <StatusBar style="dark" />
        <Stack.Navigator
          screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#f8fafc' },
            headerTitleStyle: { fontWeight: '600', color: '#0f172a' },
            contentStyle: { backgroundColor: '#f8fafc' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Courses' }} />
          <Stack.Screen name="Courses" component={CoursesScreen} options={{ title: 'Catalog' }} />
          <Stack.Screen
            name="CourseDetail"
            component={CourseDetailScreen}
            options={{ title: 'Course' }}
          />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
