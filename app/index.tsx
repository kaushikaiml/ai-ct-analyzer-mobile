import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, ActivityIndicator,
  SafeAreaView, StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) {
      setImage(res.assets[0]);
      setResult(null);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      type: 'image/jpeg',
      name: 'ct_scan.jpg',
    });
    try {
      const response = await fetch('https://ai-ct-analyzer-backend.onrender.com/predict')
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      setResult(data);
    } catch (e) {
      alert('Server se connect nahi ho pa raha!');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#030d1a" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSub}>MEDISCAN AI</Text>
          <Text style={styles.headerTitle}>🔬 CT Scan Analyzer</Text>
          <Text style={styles.headerDesc}>93.5% Accuracy • CNN Deep Learning</Text>
        </View>

        {/* Upload */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            {image ? (
              <>
                <Image source={{ uri: image.uri }} style={styles.preview} />
                <Text style={styles.selectedText}>✅ Image Selected</Text>
              </>
            ) : (
              <>
                <Text style={styles.uploadIcon}>⬆</Text>
                <Text style={styles.uploadText}>Tap to select CT Scan</Text>
                <Text style={styles.uploadSub}>Supports all image formats</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.analyzeBtn, (!image || loading) && styles.btnDisabled]}
            onPress={analyze}
            disabled={!image || loading}
          >
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.analyzeBtnText}>🔬 Run AI Analysis</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result && (
          <View>
            {/* Diagnosis */}
            <View style={[styles.card, styles.diagnosisCard]}>
              <Text style={styles.sectionLabel}>PRIMARY DIAGNOSIS</Text>
              <Text style={styles.diagnosisText}>{result.diagnosis}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>CONFIDENCE</Text>
                  <Text style={[styles.statValue, { color: '#00ff9d' }]}>{result.confidence}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>SEVERITY</Text>
                  <Text style={[styles.statValue, { color: '#ff7b3a' }]}>{result.severity}</Text>
                </View>
              </View>
              <Text style={styles.description}>{result.description}</Text>
            </View>

            {/* Findings */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔍 Radiological Findings</Text>
              {result.findings.map((f, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listDot}>◆</Text>
                  <Text style={styles.listText}>{f}</Text>
                </View>
              ))}
            </View>

            {/* Symptoms */}
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: '#ff7b3a' }]}>⚠️ Symptoms</Text>
              <View style={styles.pillContainer}>
                {result.symptoms.map((s, i) => (
                  <View key={i} style={styles.pill}>
                    <Text style={styles.pillText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Treatment */}
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: '#00ff9d' }]}>💊 Treatment Plan</Text>
              {result.treatment.map((t, i) => (
                <View key={i} style={styles.numItem}>
                  <View style={styles.numCircle}>
                    <Text style={styles.numText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.listText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                ⚕️ This report is for screening purposes only. Consult a qualified doctor before any medical decision.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030d1a' },
  header: {
    backgroundColor: '#041828',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#00c8ff33'
  },
  headerSub: { color: '#4a7a9b', fontSize: 11, letterSpacing: 3, marginBottom: 6 },
  headerTitle: { color: '#00c8ff', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  headerDesc: { color: '#4a7a9b', fontSize: 12 },
  card: {
    backgroundColor: '#071828',
    borderRadius: 16,
    padding: 20,
    margin: 12,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#0a3a5a'
  },
  diagnosisCard: { borderColor: '#ff7b3a55' },
  uploadBox: {
    backgroundColor: '#040f1c',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00c8ff44',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16
  },
  preview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 8 },
  selectedText: { color: '#00ff9d', fontSize: 14 },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadText: { color: '#cce8ff', fontSize: 15, marginBottom: 4 },
  uploadSub: { color: '#4a7a9b', fontSize: 12 },
  analyzeBtn: {
    backgroundColor: '#00c8ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  btnDisabled: { backgroundColor: '#0a1e30' },
  analyzeBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  sectionLabel: { color: '#4a7a9b', fontSize: 10, letterSpacing: 2, marginBottom: 8 },
  diagnosisText: { color: '#ff7b3a', fontSize: 24, fontWeight: '700', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: '#040f1c',
    borderRadius: 10, padding: 12, alignItems: 'center'
  },
  statLabel: { color: '#4a7a9b', fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700' },
  description: { color: '#7aa8c8', fontSize: 13, lineHeight: 20 },
  cardTitle: { color: '#00c8ff', fontSize: 15, fontWeight: '600', marginBottom: 14 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  listDot: { color: '#00c8ff', marginRight: 8, marginTop: 2 },
  listText: { color: '#cce8ff', fontSize: 13, lineHeight: 20, flex: 1 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    backgroundColor: '#ff7b3a18',
    borderWidth: 1,
    borderColor: '#ff7b3a55',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  pillText: { color: '#ff7b3a', fontSize: 12 },
  numItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  numCircle: {
    width: 22, height: 22,
    backgroundColor: '#00ff9d22',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  numText: { color: '#00ff9d', fontSize: 12, fontWeight: '700' },
  disclaimer: {
    margin: 12,
    backgroundColor: '#0a0800',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30
  },
  disclaimerText: { color: '#4a3a00', fontSize: 12, textAlign: 'center', lineHeight: 18 }
});
