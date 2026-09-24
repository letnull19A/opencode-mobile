import { useRef, useState } from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, useColorScheme } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import type BottomSheet from "@gorhom/bottom-sheet"
import { useClonedProjects } from "../../src/stores/cloned-projects"
import { useConnections } from "../../src/stores/connections"
import { DirectoryBrowserSheet } from "../../src/components/chat"
import { MOCK_HOME } from "../../src/lib/fs-mock"

export default function NewProjectScreen() {
  const isDark = useColorScheme() === "dark"
  const { t } = useTranslation()
  const projects = useClonedProjects((s) => s.projects)
  const { serverHome, clientForDirectory } = useConnections()
  // Target folder on the server everything clones into. Null = server default.
  // Mock mode (no backend yet): fall back to the mock home so the explorer
  // always has something to show, even offline.
  const [targetDir, setTargetDir] = useState<string | null>(null)
  const browserSheetRef = useRef<BottomSheet>(null)

  const effectiveDir = targetDir ?? serverHome ?? MOCK_HOME

  const goClone = () => {
    if (targetDir) router.push({ pathname: "/project/clone", params: { targetDir } })
    else router.push("/project/clone")
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.subtitle, isDark && styles.metaDark]}>{t("project.new.subtitle")}</Text>

      {/* Server folder picker — explorer sheet, no manual typing needed */}
      <TouchableOpacity
        style={[styles.folderBox, isDark && styles.folderBoxDark]}
        onPress={() => browserSheetRef.current?.expand()}
        testID="server-folder-picker"
      >
        <Ionicons name="folder-open-outline" size={20} color={isDark ? "#8b5cf6" : "#6d28d9"} />
        <View style={styles.folderTextWrap}>
          <Text style={[styles.folderLabel, isDark && styles.metaDark]}>{t("project.new.serverFolderLabel")}</Text>
          <Text style={[styles.folderPath, isDark && styles.textDark]} numberOfLines={1}>
            {effectiveDir ?? t("project.new.serverFolderUnknown")}
          </Text>
        </View>
        <Text style={[styles.changeText, isDark && styles.changeTextDark]}>{t("project.new.change")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cloneButton, isDark && styles.cloneButtonDark]}
        onPress={goClone}
        testID="clone-repo-button"
      >
        <Ionicons name="logo-github" size={22} color={isDark ? "#0a0a0a" : "#ffffff"} />
        <View style={styles.cloneTextWrap}>
          <Text style={[styles.cloneTitle, isDark && styles.cloneTitleDark]}>{t("project.new.cloneTitle")}</Text>
          <Text style={[styles.cloneHint, isDark && styles.metaDark]}>{t("project.new.cloneHint")}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={isDark ? "#0a0a0a" : "#ffffff"} />
      </TouchableOpacity>

      <Text style={[styles.sectionLabel, isDark && styles.metaDark]}>{t("project.new.myProjects")}</Text>

      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View style={[styles.row, isDark && styles.rowDark]} testID={`cloned-project-${item.id}`}>
            <Ionicons name="folder" size={18} color={isDark ? "#8b5cf6" : "#6d28d9"} />
            <View style={styles.rowContent}>
              <Text style={[styles.rowName, isDark && styles.textDark]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.rowPath, isDark && styles.metaDark]} numberOfLines={1}>
                {item.path}
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, isDark && styles.metaDark]}>{t("project.new.empty")}</Text>
          </View>
        }
      />

      <DirectoryBrowserSheet
        sheetRef={browserSheetRef}
        startDirectory={effectiveDir}
        clientForDirectory={clientForDirectory}
        isDark={isDark}
        onSelect={setTargetDir}
        useMock
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", padding: 16 },
  containerDark: { backgroundColor: "#0a0a0a" },
  subtitle: { fontSize: 14, color: "#666666", marginBottom: 16 },
  folderBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  folderBoxDark: { backgroundColor: "#1a1a1a" },
  folderTextWrap: { flex: 1 },
  folderLabel: { fontSize: 12, color: "#666666", textTransform: "uppercase", fontWeight: "600" },
  folderPath: { fontSize: 15, color: "#0a0a0a", marginTop: 2 },
  changeText: { fontSize: 14, fontWeight: "600", color: "#6d28d9" },
  changeTextDark: { color: "#a78bfa" },
  cloneButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0a0a0a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  cloneButtonDark: { backgroundColor: "#ffffff" },
  cloneTextWrap: { flex: 1 },
  cloneTitle: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  cloneTitleDark: { color: "#0a0a0a" },
  cloneHint: { fontSize: 13, color: "#999999", marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#666666", textTransform: "uppercase", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  rowDark: { backgroundColor: "#1a1a1a" },
  rowContent: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: "600", color: "#0a0a0a" },
  rowPath: { fontSize: 12, color: "#999999", marginTop: 1 },
  textDark: { color: "#ffffff" },
  metaDark: { color: "#888888" },
  empty: { paddingVertical: 32, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#666666" },
})
