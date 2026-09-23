import { Tabs } from "expo-router"
import { View, Text, useColorScheme } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useConnections } from "../../src/stores/connections"
import { useEvents } from "../../src/stores/events"

function ConnectionBadge({ isDark }: { isDark: boolean }) {
  const { t } = useTranslation()
  const activeConnection = useConnections((s) => s.activeConnection)
  const client = useConnections((s) => s.client)
  const authError = useEvents((s) => s.authError)
  const isConnected = !!activeConnection && !!client && !authError
  const isError = !!authError
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: isDark
          ? isConnected
            ? "#052e16"
            : isError
              ? "#3f0a0a"
              : "#1a1a1a"
          : isConnected
            ? "#dcfce7"
            : isError
              ? "#fef2f2"
              : "#f5f5f5",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark
          ? isConnected
            ? "#14532d"
            : isError
              ? "#7f1d1d"
              : "#2a2a2a"
          : isConnected
            ? "#bbf7d0"
            : isError
              ? "#fecaca"
              : "#e5e5e5",
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: isConnected ? "#22c55e" : isError ? "#ef4444" : "#999999",
        }}
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: isDark
            ? isConnected
              ? "#4ade80"
              : isError
                ? "#f87171"
                : "#888888"
            : isConnected
              ? "#15803d"
              : isError
                ? "#dc2626"
                : "#666666",
        }}
      >
        {isConnected ? t("common.connected") : isError ? t("common.error") : t("common.offline")}
      </Text>
    </View>
  )
}

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const { t } = useTranslation()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: (isDark ? "#ffffff" : "#0a0a0a") as unknown as string,
        tabBarInactiveTintColor: (isDark ? "#666666" : "#999999") as unknown as string,
        tabBarStyle: {
          backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
          borderTopColor: isDark ? "#1a1a1a" : "#e5e5e5",
        },
        headerStyle: {
          backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
        },
        headerTintColor: (isDark ? "#ffffff" : "#0a0a0a") as unknown as string,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.sessionsTab"),
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color as unknown as string} />,
          headerRight: () => <ConnectionBadge isDark={isDark} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.settingsTab"),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color as unknown as string} />,
        }}
      />
    </Tabs>
  )
}
