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
import {
  HouseIcon,
  BasketIcon,
  PlantIcon,
} from "./src/components/icons/AndeanIcons";
import { colors } from "./src/constants/colors";
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
          if (route.name === "Home") {
            return (
              <HouseIcon
                size={size}
                color={focused ? colors.primary : colors.textSecondary}
              />
            );
          } else if (route.name === "Categories") {
            return (
              <BasketIcon
                size={size}
                color={focused ? colors.primary : colors.textSecondary}
              />
            );
          } else if (route.name === "Progress") {
            return (
              <PlantIcon
                size={size}
                color={focused ? colors.primary : colors.textSecondary}
              />
            );
          } else {
            return <Ionicons name="help-outline" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
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
