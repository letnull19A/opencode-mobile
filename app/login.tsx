import { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useConnections } from "../src/stores/connections"
import { useEvents } from "../src/stores/events"
import { HARDCODED_SERVER_URL } from "../src/lib/server-config"

export default function LoginScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const { activeConnection, addConnection, updateConnection, testConnection } = useConnections()
  const authError = useEvents((s) => s.authError)

  const [username, setUsername] = useState(activeConnection?.username || "")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (activeConnection?.username) setUsername(activeConnection.username)
  }, [activeConnection?.username])

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Введите логин и пароль")
      return
    }
    setIsLoggingIn(true)
    try {
      if (!activeConnection) {
        const result = await testConnection(
          {
            id: "",
            name: "devbox.web2bizz.team",
            type: "cloud",
            url: HARDCODED_SERVER_URL,
            username: username.trim(),
          },
          "onboarding",
          password,
        )
        if (!result.ok) throw new Error(result.error || "Connection failed")
        await addConnection(
          {
            name: "devbox.web2bizz.team",
            type: "cloud",
            url: HARDCODED_SERVER_URL,
            username: username.trim(),
          },
          password,
        )
      } else {
        const result = await testConnection(
          { ...activeConnection, username: username.trim() },
          "edit_test",
          password,
        )
        if (!result.ok) throw new Error(result.error || "Connection failed")
        await updateConnection(activeConnection.id, { username: username.trim() }, password)
        useEvents.getState().connect()
      }
      setPassword("")
      router.replace("/(tabs)")
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      Alert.alert("Ошибка подключения", msg)
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Ionicons name="lock-closed-outline" size={64} color={isDark ? "#ffffff" : "#0a0a0a"} />
          <Text style={[styles.title, isDark && styles.textDark]}>Вход</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Подключение к {HARDCODED_SERVER_URL}
          </Text>
          {authError ? (
            <Text style={styles.authErrorText}>Ошибка авторизации — проверьте логин и пароль</Text>
          ) : null}
        </View>

        <View style={[styles.serverBox, isDark && styles.serverBoxDark]}>
          <Ionicons name="cloud-outline" size={16} color={isDark ? "#888888" : "#666666"} />
          <Text style={[styles.serverText, isDark && styles.subtitleDark]} selectable>
            {HARDCODED_SERVER_URL}
          </Text>
        </View>

        <Text style={[styles.label, isDark && styles.labelDark]}>Логин</Text>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="username"
          placeholderTextColor={isDark ? "#666666" : "#999999"}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          testID="login-username-input"
        />

        <Text style={[styles.label, isDark && styles.labelDark]}>Пароль</Text>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="••••••••"
          placeholderTextColor={isDark ? "#666666" : "#999999"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          testID="login-password-input"
        />

        <TouchableOpacity
          style={[styles.loginButton, isDark && styles.loginButtonDark]}
          onPress={handleLogin}
          disabled={isLoggingIn}
          testID="login-button"
        >
          {isLoggingIn ? (
            <ActivityIndicator size="small" color={isDark ? "#0a0a0a" : "#ffffff"} />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color={isDark ? "#0a0a0a" : "#ffffff"} />
              <Text style={[styles.loginButtonText, isDark && styles.loginButtonTextDark]}>Войти</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  containerDark: { backgroundColor: "#0a0a0a" },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: "#0a0a0a", marginTop: 16 },
  textDark: { color: "#ffffff" },
  subtitle: { fontSize: 14, color: "#666666", marginTop: 8, textAlign: "center" },
  subtitleDark: { color: "#888888" },
  authErrorText: { fontSize: 13, color: "#ef4444", marginTop: 12, textAlign: "center" },
  serverBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  serverBoxDark: { backgroundColor: "#1a1a1a" },
  serverText: { fontSize: 13, color: "#666666", flex: 1 },
  label: { fontSize: 14, fontWeight: "600", color: "#0a0a0a", marginTop: 16, marginBottom: 8 },
  labelDark: { color: "#ffffff" },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0a0a0a",
  },
  inputDark: { backgroundColor: "#1a1a1a", color: "#ffffff" },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0a0a0a",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  loginButtonDark: { backgroundColor: "#ffffff" },
  loginButtonText: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  loginButtonTextDark: { color: "#0a0a0a" },
})
