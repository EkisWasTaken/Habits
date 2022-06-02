import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from "./screens/Login";
import Home from './screens/Home';
import Habits from './screens/Habits';
import { auth } from './utils/Config';
import Colors from './utils/Colors';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const AuthScreens = () => {
  return(
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={Login}/>
    </AuthStack.Navigator>
  );
}

const Screens = () => {
  return(
    <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={({route}) => {
            return({
              headerStyle: {
                backgroundColor: Colors.blue,
              },
              headerTintColor: "white"
            })
          }}
        />
        <Stack.Screen 
          name="Habits" 
          component={Habits}
          options={({route}) => {
            return({
              title: route.params.day.dateString,
              headerStyle: {
                backgroundColor: route.params.color || Colors.blue,
              },
              headerTintColor: "white"
            })
          }}
          />
      </Stack.Navigator>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    if(auth.currentUser) {
      setIsAuthenticated(true);
    }
    auth.onAuthStateChanged(user => {
      if(user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    })
  }, [])

  return (
    <NavigationContainer>
      {isAuthenticated ? <Screens /> : <AuthScreens/>}
    </NavigationContainer>
  );
}
