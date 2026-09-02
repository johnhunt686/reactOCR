import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Button,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { recognize, type OCRResult } from "react-native-nitro-ocr";
import { SafeAreaView } from "react-native-safe-area-context";

const CAPTURE_INTERVAL_MS = 1200;

export default function HomeScreen() {
  const cameraRef = useRef<CameraView>(null);
  const busyRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!cameraReady || !isLive || Platform.OS === "web") {
      return;
    }

    let cancelled = false;

    const recognizeNextFrame = async () => {
      if (cancelled || busyRef.current || !cameraRef.current) {
        return;
      }

      busyRef.current = true;
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.55,
          skipProcessing: false,
        });

        if (!photo || cancelled) {
          return;
        }

        const nextResult = await recognize(photo.uri, {
          recognitionLevel: "fast",
          languages: ["en-US"],
        });

        if (!cancelled) {
          setResult(nextResult);
          setError(null);
          setUpdatedAt(new Date());
        }
      } catch (recognitionError) {
        if (!cancelled) {
          setError(
            recognitionError instanceof Error
              ? recognitionError.message
              : "Could not read this frame.",
          );
        }
      } finally {
        busyRef.current = false;
      }
    };

    void recognizeNextFrame();
    const interval = setInterval(
      () => void recognizeNextFrame(),
      CAPTURE_INTERVAL_MS,
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [cameraReady, isLive]);

  if (Platform.OS === "web") {
    return (
      <MessageScreen
        title="Native camera demo"
        message="Live OCR needs a development build on iOS or Android."
      />
    );
  }

  if (!permission) {
    return (
      <MessageScreen
        title="Starting camera"
        message="Checking camera permissions..."
        loading
      />
    );
  }

  if (!permission.granted) {
    return (
      <MessageScreen
        title="Camera access needed"
        message="Allow camera access to recognize text from the live preview."
        action={<Button title="Allow camera" onPress={requestPermission} />}
      />
    );
  }

  const lines = result?.blocks.flatMap((block) => block.lines) ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>NITRO OCR / LIVE</Text>
          <Text style={styles.title}>Point at text</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, !isLive && styles.statusDotPaused]} />
          <Text style={styles.statusText}>
            {isLive ? "SCANNING" : "PAUSED"}
          </Text>
        </View>
      </View>

      <View style={styles.cameraFrame}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
          onMountError={(mountError) => setError(mountError.message)}
        />
        <View style={styles.scanCorners} pointerEvents="none">
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </View>
        {!cameraReady && <ActivityIndicator color="#D7FF57" size="large" />}
        {isLive && cameraReady && (
          <View style={styles.scanLine} pointerEvents="none" />
        )}
      </View>

      <View style={styles.results}>
        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.sectionLabel}>RECOGNIZED TEXT</Text>
            <Text style={styles.captureMeta}>
              {updatedAt
                ? `Updated ${updatedAt.toLocaleTimeString()}`
                : "Waiting for first frame"}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLive ? "Pause live OCR" : "Resume live OCR"}
            style={styles.control}
            onPress={() => setIsLive((current) => !current)}
          >
            <Text style={styles.controlText}>
              {isLive ? "Pause" : "Resume"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.textScroll}
          contentContainerStyle={styles.textContent}
        >
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : result?.text ? (
            <Text style={styles.recognizedText}>{result.text}</Text>
          ) : (
            <Text style={styles.placeholder}>
              Hold steady over a sign, label, or page.
            </Text>
          )}
        </ScrollView>

        <View style={styles.footerStats}>
          <Text style={styles.stat}>
            {lines.length} {lines.length === 1 ? "LINE" : "LINES"}
          </Text>
          <Text style={styles.stat}>{result?.blocks.length ?? 0} BLOCKS</Text>
          <Text style={styles.stat}>ON-DEVICE</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function MessageScreen({
  title,
  message,
  action,
  loading = false,
}: {
  title: string;
  message: string;
  action?: ReactNode;
  loading?: boolean;
}) {
  return (
    <SafeAreaView style={styles.messageScreen}>
      <Text style={styles.eyebrow}>NITRO OCR / LIVE</Text>
      <Text style={styles.messageTitle}>{title}</Text>
      <Text style={styles.messageText}>{message}</Text>
      {loading && (
        <ActivityIndicator color="#D7FF57" style={styles.messageLoader} />
      )}
      {action}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#101312" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  eyebrow: {
    color: "#A8B0A8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  title: { color: "#F4F7EE", fontSize: 25, fontWeight: "700", marginTop: 4 },
  statusPill: {
    alignItems: "center",
    backgroundColor: "#1C241F",
    borderColor: "#344239",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statusDot: {
    backgroundColor: "#D7FF57",
    borderRadius: 5,
    height: 8,
    width: 8,
  },
  statusDotPaused: { backgroundColor: "#A8B0A8" },
  statusText: {
    color: "#D7FF57",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cameraFrame: {
    backgroundColor: "#202622",
    flex: 1,
    marginHorizontal: 12,
    minHeight: 260,
    overflow: "hidden",
    position: "relative",
  },
  scanCorners: {
    bottom: 28,
    left: 28,
    position: "absolute",
    right: 28,
    top: 28,
  },
  corner: {
    borderColor: "#D7FF57",
    height: 28,
    position: "absolute",
    width: 28,
  },
  cornerTopLeft: { borderLeftWidth: 2, borderTopWidth: 2, left: 0, top: 0 },
  cornerTopRight: { borderRightWidth: 2, borderTopWidth: 2, right: 0, top: 0 },
  cornerBottomLeft: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    bottom: 0,
    left: 0,
  },
  cornerBottomRight: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    bottom: 0,
    right: 0,
  },
  scanLine: {
    backgroundColor: "#D7FF57",
    height: 1,
    left: 28,
    opacity: 0.75,
    position: "absolute",
    right: 28,
    top: "50%",
  },
  results: {
    backgroundColor: "#F4F7EE",
    minHeight: 235,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  resultsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionLabel: {
    color: "#536057",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  captureMeta: { color: "#7A847B", fontSize: 12, marginTop: 4 },
  control: {
    backgroundColor: "#D7FF57",
    borderRadius: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  controlText: { color: "#182017", fontSize: 12, fontWeight: "800" },
  textScroll: { flex: 1, marginTop: 14 },
  textContent: { paddingBottom: 10 },
  recognizedText: { color: "#182017", fontSize: 22, lineHeight: 29 },
  placeholder: { color: "#8B948B", fontSize: 18, lineHeight: 26 },
  errorText: { color: "#B04338", fontSize: 14, lineHeight: 20 },
  footerStats: {
    borderTopColor: "#D9DED5",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  stat: { color: "#647066", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  messageScreen: {
    alignItems: "center",
    backgroundColor: "#101312",
    flex: 1,
    justifyContent: "center",
    padding: 32,
  },
  messageTitle: {
    color: "#F4F7EE",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  messageText: {
    color: "#A8B0A8",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    marginTop: 12,
    maxWidth: 320,
    textAlign: "center",
  },
  messageLoader: { marginTop: 4 },
});
