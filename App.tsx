import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import FlashcardScreen from "./src/screens/FlashcardScreen";
import QuizScreen from "./src/screens/QuizScreen";
import CategoriesScreen from "./src/screens/CategoriesScreen";
import ProgressScreen from "./src/screens/ProgressScreen";

// Types
export type RootStackParamList = {
  MainTabs: undefined;
  Flashcard: { category?: string };
  Quiz: { category?: string };
};

export type TabParamList = {
  Home: undefined;
  Categories: undefined;
  Progress: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Categories") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "Progress") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Flashcard"
          component={FlashcardScreen}
          options={{ title: "Flashcards" }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ title: "Quiz" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
