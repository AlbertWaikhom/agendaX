import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useWorkspace } from '../context/WorkspaceContext';

// Screens
import { DashboardScreen } from '../screens/home/DashboardScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { ExpensesScreen } from '../screens/expenses/ExpensesScreen';
import { UrlsScreen } from '../screens/urls/UrlsScreen';
import { MoreScreen } from '../screens/more/MoreScreen';

export type RootTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Events: undefined;
  Expenses: undefined;
  URLs: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { tasks } = useWorkspace();
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.glassBorder,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
        lazy: true,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'URLs') {
            iconName = focused ? 'link' : 'link-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return (
            <View
              style={[
                styles.iconWrapper,
                focused && [
                  styles.iconWrapperActive,
                  { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` },
                ],
              ]}
            >
              <Ionicons name={iconName} size={focused ? 20 : 18} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarBadge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
          tabBarBadgeStyle: [styles.badge, { backgroundColor: colors.primary }],
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarLabel: 'Events',
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarLabel: 'Expenses',
        }}
      />
      <Tab.Screen
        name="URLs"
        component={UrlsScreen}
        options={{
          tabBarLabel: 'URLs',
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  tabBarLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 2,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  iconWrapperActive: {
    borderWidth: 1,
    transform: [{ scale: 1.05 }],
  },
  badge: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
});
