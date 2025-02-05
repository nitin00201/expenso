import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function _layout() {
  return (
    <Tabs
    screenOptions={{
      headerShown: false
    }}
    >
      <Tabs.Screen name='dashboard' options={{
        tabBarLabel:"Dshboard",
        tabBarIcon:({color,size})=>
      <FontAwesome name="dashboard" size={size} color={color} />      
        
      }}/>
      <Tabs.Screen name='explore' options={{
              tabBarLabel:"Search",
  
        tabBarIcon:({color,size})=>
      <Ionicons name="search" size={size} color={color} /> 
        
      }}/>
      <Tabs.Screen name='profile' options={{
              tabBarLabel:"Profile",
  
        tabBarIcon:({color,size})=>
      <Ionicons name="person-circle" size={size} color={color} /> 
        
      }}/>
  
    </Tabs>
  )
}