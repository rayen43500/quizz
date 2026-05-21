import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import JoinSessionScreen from './src/screens/JoinSessionScreen';
import QuizScreen from './src/screens/QuizScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#161b24' },
        headerTintColor: '#f1f5f9',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#0a0c10' },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Quisi' }} />
          <Stack.Screen name="Join" component={JoinSessionScreen} options={{ title: 'Rejoindre' }} />
          <Stack.Screen name="Quiz" component={QuizScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Ma progression' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Assistant' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historique' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
