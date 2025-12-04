import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { Image } from "expo-image";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";
import { formatDate } from "@/utils/storage";

type Props = NativeStackScreenProps<HomeStackParamList, "ExamResults">;

export default function ExamResultsScreen({ route, navigation }: Props) {
  const { segmentId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { segments, getExamResultsForSegment, addExamResult, deleteExamResult } = useData();

  const segment = useMemo(
    () => segments.find((s) => s.id === segmentId),
    [segments, segmentId]
  );

  const examResults = useMemo(
    () => getExamResultsForSegment(segmentId),
    [getExamResultsForSegment, segmentId]
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [marks, setMarks] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [voiceNoteUri, setVoiceNoteUri] = useState<string | null>(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const resetForm = () => {
    setMarks("");
    setTotalMarks("100");
    setNotes("");
    setImageUri(null);
    setVoiceNoteUri(null);
    setVoiceNoteDuration(0);
  };

  const startRecording = async () => {
    if (Platform.OS === "web") {
      Alert.alert(t("errorOccurred"), t("availableOnMobile"));
      return;
    }

    if (isRecording) {
      return;
    }

    if (isPlaying) {
      await stopPlaying();
    }

    try {
      const permission = await Audio.requestPermissionsAsync();
      
      if (!permission.granted) {
        if (permission.canAskAgain) {
          Alert.alert(
            t("errorOccurred"),
            t("microphonePermissionRequired"),
            [{ text: t("cancel"), style: "cancel" }]
          );
        } else {
          Alert.alert(
            t("errorOccurred"),
            t("microphonePermissionDenied"),
            Platform.OS !== "web"
              ? [
                  { text: t("cancel"), style: "cancel" },
                  {
                    text: t("openSettings"),
                    onPress: async () => {
                      try {
                        const { Linking } = require("react-native");
                        await Linking.openSettings();
                      } catch {
                      }
                    },
                  },
                ]
              : [{ text: t("cancel"), style: "cancel" }]
          );
        }
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setIsRecording(false);
      Alert.alert(t("errorOccurred"), t("tryAgain"));
    }
  };

  const stopRecording = async () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (!recordingRef.current) {
      setIsRecording(false);
      return;
    }

    try {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const status = await recordingRef.current.getStatusAsync();
      const durationSeconds = Math.round((status.durationMillis || 0) / 1000);

      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recordingRef.current.getURI();
      setVoiceNoteUri(uri);
      setVoiceNoteDuration(durationSeconds);
      setIsRecording(false);
      recordingRef.current = null;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setIsRecording(false);
      recordingRef.current = null;
    }
  };

  const playVoiceNote = async () => {
    if (!voiceNoteUri || isRecording) return;

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: voiceNoteUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (error) {
      console.error("Failed to play voice note:", error);
      setIsPlaying(false);
    }
  };

  const stopPlaying = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {
      }
      soundRef.current = null;
      setIsPlaying(false);
    }
  };

  const deleteVoiceNote = async () => {
    if (isPlaying) {
      await stopPlaying();
    }
    
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
      }
      soundRef.current = null;
    }

    setVoiceNoteUri(null);
    setVoiceNoteDuration(0);
    setIsPlaying(false);
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("errorOccurred"),
        "Please grant camera roll permissions to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("errorOccurred"),
        "Please grant camera permissions to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!marks.trim() || !totalMarks.trim()) {
      Alert.alert(t("errorOccurred"), "Please enter marks and total marks.");
      return;
    }

    const marksNum = parseInt(marks, 10);
    const totalNum = parseInt(totalMarks, 10);

    if (isNaN(marksNum) || isNaN(totalNum) || marksNum > totalNum) {
      Alert.alert(t("errorOccurred"), "Please enter valid marks.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addExamResult({
        segmentId,
        date: formatDate(new Date()),
        subject: segment?.subject || "",
        marks: marksNum,
        totalMarks: totalNum,
        notes: notes.trim() || undefined,
        imageUri: imageUri || undefined,
        voiceNoteUri: voiceNoteUri || undefined,
        voiceNoteDuration: voiceNoteDuration || undefined,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      resetForm();
      setShowAddModal(false);
      Alert.alert(t("resultAdded"), "");
    } catch (error) {
      console.error("Error adding exam result:", error);
      Alert.alert(t("errorOccurred"), t("tryAgain"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (resultId: string) => {
    Alert.alert(
      t("delete"),
      t("confirm") + "?",
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            await deleteExamResult(resultId);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const getPercentage = (marks: number, total: number) => {
    return Math.round((marks / total) * 100);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return AttendanceColors.present;
    if (percentage >= 60) return theme.primary;
    if (percentage >= 40) return theme.warning;
    return theme.error;
  };

  if (!segment) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="body">{t("errorOccurred")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={styles.header}>
          <View style={[styles.subjectBadge, { backgroundColor: theme.primary + "20" }]}>
            <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
              {segment.subject}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="h2" style={styles.title}>
          {t("examResults")}
        </ThemedText>

        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          {segment.partnerName}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Button onPress={() => setShowAddModal(true)}>
          {t("addResult")}
        </Button>
      </Animated.View>

      {examResults.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="file-text" size={48} color={theme.textSecondary} />
          </View>
          <ThemedText type="h4" style={styles.emptyTitle}>
            {t("noResults")}
          </ThemedText>
          <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {t("addFirstResult")}
          </ThemedText>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.resultsList}>
          {examResults.map((result, index) => {
            const percentage = getPercentage(result.marks, result.totalMarks);
            const gradeColor = getGradeColor(percentage);

            return (
              <Card key={result.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultInfo}>
                    <ThemedText type="body" style={[styles.resultDate, { color: theme.textSecondary }]}>
                      {new Date(result.date).toLocaleDateString()}
                    </ThemedText>
                    <View style={styles.marksContainer}>
                      <ThemedText type="h3" style={{ color: gradeColor }}>
                        {result.marks}/{result.totalMarks}
                      </ThemedText>
                      <View style={[styles.percentageBadge, { backgroundColor: gradeColor + "20" }]}>
                        <ThemedText type="small" style={{ color: gradeColor, fontWeight: "700" }}>
                          {percentage}%
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleDelete(result.id)}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      { backgroundColor: theme.error + "15", opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Feather name="trash-2" size={16} color={theme.error} />
                  </Pressable>
                </View>

                {result.notes ? (
                  <ThemedText type="small" style={[styles.notes, { color: theme.textSecondary }]}>
                    {result.notes}
                  </ThemedText>
                ) : null}

                {result.imageUri ? (
                  <Image
                    source={{ uri: result.imageUri }}
                    style={styles.resultImage}
                    contentFit="cover"
                  />
                ) : null}
              </Card>
            );
          })}
        </Animated.View>
      )}

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="h3" style={styles.modalTitle}>
              {t("uploadExamResult")}
            </ThemedText>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <ThemedText type="small" style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  {t("marks")}
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.backgroundDefault, color: theme.text },
                  ]}
                  value={marks}
                  onChangeText={setMarks}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <ThemedText type="small" style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  {t("totalMarks")}
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.backgroundDefault, color: theme.text },
                  ]}
                  value={totalMarks}
                  onChangeText={setTotalMarks}
                  keyboardType="number-pad"
                  placeholder="100"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </View>

            <ThemedText type="small" style={[styles.inputLabel, { color: theme.textSecondary }]}>
              {t("notes")}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: theme.backgroundDefault, color: theme.text },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t("addNotes")}
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.imageSection}>
              {imageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => setImageUri(null)}
                    style={[styles.removeImageButton, { backgroundColor: theme.error }]}
                  >
                    <Feather name="x" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.imageButtons}>
                  <Pressable
                    onPress={pickImage}
                    style={[styles.imageButton, { backgroundColor: theme.backgroundDefault }]}
                  >
                    <Feather name="image" size={20} color={theme.primary} />
                    <ThemedText type="small" style={{ color: theme.primary }}>
                      {t("pickImage")}
                    </ThemedText>
                  </Pressable>
                  {Platform.OS !== "web" ? (
                    <Pressable
                      onPress={takePhoto}
                      style={[styles.imageButton, { backgroundColor: theme.backgroundDefault }]}
                    >
                      <Feather name="camera" size={20} color={theme.primary} />
                      <ThemedText type="small" style={{ color: theme.primary }}>
                        {t("takePhoto")}
                      </ThemedText>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>

            <View style={styles.voiceNoteSection}>
              <ThemedText type="small" style={[styles.inputLabel, { color: theme.textSecondary }]}>
                {t("voiceNote")}
              </ThemedText>
              {voiceNoteUri ? (
                <View style={[styles.voiceNotePlayer, { backgroundColor: theme.backgroundDefault }]}>
                  <Pressable
                    onPress={isPlaying ? stopPlaying : playVoiceNote}
                    style={[styles.playButton, { backgroundColor: theme.primary }]}
                  >
                    <Feather name={isPlaying ? "pause" : "play"} size={20} color="#FFFFFF" />
                  </Pressable>
                  <View style={styles.voiceNoteInfo}>
                    <View style={styles.waveform}>
                      {[...Array(20)].map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.waveformBar,
                            {
                              backgroundColor: theme.primary,
                              height: 8 + Math.random() * 16,
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {formatDuration(voiceNoteDuration)}
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={deleteVoiceNote}
                    style={[styles.deleteVoiceButton, { backgroundColor: theme.error + "20" }]}
                  >
                    <Feather name="trash-2" size={16} color={theme.error} />
                  </Pressable>
                </View>
              ) : isRecording ? (
                <View style={[styles.recordingState, { backgroundColor: theme.error + "10" }]}>
                  <View style={[styles.recordingIndicator, { backgroundColor: theme.error }]} />
                  <ThemedText type="body" style={{ color: theme.error, fontWeight: "600" }}>
                    {t("recording")} {formatDuration(recordingDuration)}
                  </ThemedText>
                  <Pressable
                    onPress={stopRecording}
                    style={[styles.stopButton, { backgroundColor: theme.error }]}
                  >
                    <Feather name="square" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={startRecording}
                  style={[styles.recordButton, { backgroundColor: theme.backgroundDefault }]}
                >
                  <Feather name="mic" size={20} color={theme.primary} />
                  <ThemedText type="small" style={{ color: theme.primary }}>
                    {t("recordVoice")}
                  </ThemedText>
                </Pressable>
              )}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                style={[styles.modalButton, { backgroundColor: theme.backgroundDefault }]}
              >
                <ThemedText type="body">{t("cancel")}</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.primary, opacity: isSubmitting ? 0.6 : 1 },
                ]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF" }}>
                  {isSubmitting ? "..." : t("save")}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  subjectBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: "center",
  },
  resultsList: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  resultCard: {
    marginBottom: Spacing.sm,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  resultInfo: {
    flex: 1,
  },
  resultDate: {
    marginBottom: Spacing.xs,
  },
  marksContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  percentageBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  deleteButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  notes: {
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  resultImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    maxHeight: "90%",
  },
  modalTitle: {
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
    marginBottom: Spacing.lg,
  },
  imageSection: {
    marginBottom: Spacing.xl,
  },
  imageButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  imageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: BorderRadius.md,
  },
  removeImageButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceNoteSection: {
    marginBottom: Spacing.xl,
  },
  voiceNotePlayer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceNoteInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 24,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
  },
  deleteVoiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingState: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
});
