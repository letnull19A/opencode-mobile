import { useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useColorScheme } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useSessions } from "../../src/stores/sessions"
import { useEvents } from "../../src/stores/events"
import type { Session } from "../../src/lib/sdk"

// Tasks = sessions where the agent is currently doing something:
// SSE sessionStatus busy/retry, plus optimistic sending (tap → SSE busy gap).
export default function TasksScreen() {
  const isDark = useColorScheme() === "dark"
  const { t } = useTranslation()
  const { sessions, loadSessions } = useSessions()
  const sessionStatus = useEvents((s) => s.sessionStatus)
  const statusText = useEvents((s) => s.statusText)
  const sending = useSessions((s) => s.sending)

  useFocusEffect(
    useCallback(() => {
      loadSessions()
    }, [loadSessions]),
  )

  const active = sessions.filter((session) => {
    const st = sessionStatus[session.id]
    return st?.type === "busy" || st?.type === "retry" || sending[session.id]
  })

  const renderItem = ({ item }: { item: Session }) => {
    const st = sessionStatus[item.id]
    const isRetry = st?.type === "retry"
    const text = statusText[item.id] || t("tasks.working")
    const shortDir = item.directory ? item.directory.split("/").filter(Boolean).pop() : null
    return (
      <TouchableOpacity
        style={[styles.row, isDark && styles.rowDark]}
        onPress={() =>
          router.push({
            pathname: "/session/[id]",
            params: { id: item.id, ...(item.directory ? { directory: item.directory } : {}) },
          })
        }
        testID={`task-item-${item.id}`}
      >
        <View style={[styles.dot, isRetry && styles.dotRetry]}>
          <View style={[styles.pulse, isRetry && styles.pulseRetry]} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.textDark]} numberOfLines={1}>
            {item.title || t("sessionsList.untitledSession")}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.status, isRetry && styles.statusRetry]} numberOfLines={1}>
              {isRetry ? t("tasks.retrying") : text}
            </Text>
            {shortDir && (
              <View style={styles.dirBadge}>
                <Ionicons name="folder-outline" size={12} color={isDark ? "#888888" : "#666666"} />
                <Text style={[styles.dirText, isDark && styles.metaDark]}>{shortDir}</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={isDark ? "#666666" : "#999999"} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={active}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty} testID="tasks-empty">
            <Ionicons name="checkmark-circle-outline" size={64} color={isDark ? "#444444" : "#cccccc"} />
            <Text style={[styles.emptyTitle, isDark && styles.textDark]}>{t("tasks.empty")}</Text>
            <Text style={[styles.emptyHint, isDark && styles.metaDark]}>{t("tasks.emptyHint")}</Text>
          </View>
        }
        contentContainerStyle={active.length === 0 ? styles.emptyContent : undefined}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  containerDark: { backgroundColor: "#0a0a0a" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  rowDark: { borderBottomColor: "#1a1a1a" },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  dotRetry: { backgroundColor: "#fef3c7" },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },
  pulseRetry: { backgroundColor: "#f59e0b" },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: "500", color: "#0a0a0a", marginBottom: 2 },
  textDark: { color: "#ffffff" },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  status: { fontSize: 13, color: "#15803d", flex: 1 },
  statusRetry: { color: "#b45309" },
  dirBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dirText: { fontSize: 11, color: "#666666" },
  metaDark: { color: "#888888" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyContent: { flex: 1 },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginTop: 16, color: "#0a0a0a" },
  emptyHint: { fontSize: 14, color: "#666666", marginTop: 8, textAlign: "center" },
})
