import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

// Screens
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import ProductsScreen from './screens/ProductsScreen'
import ProductDetailScreen from './screens/ProductDetailScreen'
import CartScreen from './screens/CartScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import OrdersScreen from './screens/OrdersScreen'
import ProfileScreen from './screens/ProfileScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

SplashScreen.preventAutoHideAsync()

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'inter': require('./assets/fonts/Inter-Regular.ttf'),
        })
      } catch (e) {
        console.warn(e)
      } finally {
        setFontsLoaded(true)
        await SplashScreen.hideAsync()
      }
    }
    prepare()
  }, [])

  if (!fontsLoaded) return null

  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            initialParams={{ setIsLoggedIn }}
          />
        </Stack.Navigator>
      ) : (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let icon = '🏠'
              if (route.name === 'Home') icon = '🏠'
              else if (route.name === 'Products') icon = '📦'
              else if (route.name === 'Cart') icon = '🛒'
              else if (route.name === 'Orders') icon = '📋'
              else if (route.name === 'Profile') icon = '👤'
              return <Text style={{ fontSize: size, color }}>{icon}</Text>
            },
            tabBarActiveTintColor: '#50AD41',
            tabBarInactiveTintColor: '#999',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Products" component={ProductsScreen} />
          <Tab.Screen name="Cart" component={CartScreen} />
          <Tab.Screen name="Orders" component={OrdersScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  )
}
