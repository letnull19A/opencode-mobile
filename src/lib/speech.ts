import { useState, useCallback, useRef, useEffect } from "react"

// expo-speech-recognition requires a dev build (native module not in Expo Go).
// Make it optional so `npx expo start` in Expo Go doesn't crash at import time.
let ExpoSpeechRecognitionModule: any
let useSpeechRecognitionEvent: any
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("expo-speech-recognition") as typeof import("expo-speech-recognition")
  ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent
} catch {
  ExpoSpeechRecognitionModule = {
    requestPermissionsAsync: async () => ({ granted: false }),
    start: () => {},
    stop: () => {},
    abort: () => {},
  }
  useSpeechRecognitionEvent = () => {}
}

interface SpeechState {
  listening: boolean
  transcript: string
  error: string | null
}

interface SpeechActions {
  start: () => Promise<void>
  stop: () => void
  cancel: () => void
}

export function useSpeech(onResult: (text: string) => void): SpeechState & SpeechActions {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const pending = useRef("")

  useSpeechRecognitionEvent("start", () => {
    setListening(true)
    setError(null)
    setTranscript("")
    pending.current = ""
  })

  useSpeechRecognitionEvent("end", () => {
    setListening(false)
    // Deliver final transcript
    if (pending.current.trim()) {
      onResult(pending.current.trim())
    }
    setTranscript("")
    pending.current = ""
  })

  useSpeechRecognitionEvent("result", (event: any) => {
    const text = event.results[0]?.transcript || ""
    pending.current = text
    setTranscript(text)
  })

  useSpeechRecognitionEvent("error", (event: any) => {
    // "no-speech" is not really an error — user just didn't say anything
    if (event.error === "no-speech") {
      setListening(false)
      return
    }
    setError(event.message || event.error)
    setListening(false)
  })

  const start = useCallback(async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
    if (!result.granted) {
      setError("Microphone permission denied")
      return
    }
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: true,
    })
  }, [])

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop()
  }, [])

  const cancel = useCallback(() => {
    pending.current = ""
    ExpoSpeechRecognitionModule.abort()
    setListening(false)
    setTranscript("")
  }, [])

  // Stop the native recognition session when the screen unmounts — otherwise
  // the mic stays hot in the background. abort() is a no-op when not listening.
  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.abort()
    }
  }, [])

  return { listening, transcript, error, start, stop, cancel }
}
