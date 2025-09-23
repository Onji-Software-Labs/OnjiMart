import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from './signup';
import LoginScreen from './login'; // Your existing login page

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false
      }}
      initialRouteName="signup"
    >
      <Stack.Screen name="signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}