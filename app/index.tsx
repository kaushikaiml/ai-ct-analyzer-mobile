import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, StyleSheet, StatusBar,
  SafeAreaView, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const C = {
  bg: '#030d1a', card: '#071828', border: '#0a3a5a',
  blue: '#00c8ff', green: '#00ff9d', orange: '#ff7b3a',
  red: '#ff2d6b', purple: '#9b6dff', yellow: '#ffd700',
  text: '#cce8ff', muted: '#4a7a9b',
};

const Pill = ({ text, color }: { text: string; color: string }) => (
  <View style={[styles.pill, { backgroundColor: color + '18', borderColor: color + '55' }]}>
    <Text style={[styles.pillText, { color }]}>{text}</Text>
  </View>
);

const Section = ({ icon, title, color, children }: any) => (
  <View style={[styles.section, { borderColor: color + '33' }]}>
    <View style={[styles.sectionHeader, { borderBottomColor: color + '22' }]}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const Row = ({ text, color }: { text: string; color: string }) => (
  <View style={[styles.row, { borderLeftColor: color }]}>
    <Text style={[styles.rowDot, { color }]}>◆</Text>
    <Text style={styles.rowText}>{text}</Text>
  </View>
);

const NumRow = ({ num, text, color }: { num: number; text: string; color: string }) => (
  <View style={[styles.row, { borderLeftColor: color }]}>
    <View style={[styles.numBadge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.numText, { color }]}>{num}</Text>
    </View>
    <Text style={styles.rowText}>{text}</Text>
  </View>
);

const InfoBox = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={[styles.infoBox, { borderColor: color + '22' }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, { color }]}>{value}</Text>
  </View>
);

export default function App() {
  const [image, setImage] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission needed', 'Please allow photo access'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!res.canceled) { setImage(res.assets[0]); setResult(null); }
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', { uri: image.uri, type: 'image/jpeg', name: 'ct_scan.jpg' } as any);
      const response = await fetch('https://ai-ct-analyzer-backend.onrender.com/predict', {
        method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      setResult(data);
    } catch (e) {
      Alert.alert('Error', 'Server se connect nahi ho pa raha.');
    }
    setLoading(false);
  };

  const getSeverityColor = (s: string) => {
    if (s === 'Normal') return C.green;
    if (s === 'Very High') return C.red;
    return C.orange;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#041020" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.topBar}>
          <View>
            <Text style={styles.topBarBrand}>MEDISCAN AI</Text>
            <Text style={styles.topBarSub}>Advanced Diagnostics</Text>
          </View>
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineText}>● SYSTEM ONLINE</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}><Text style={{ fontSize: 28 }}>🔬</Text></View>
          <Text style={styles.heroTitle}>CT Scan AI Analyzer</Text>
          <Text style={styles.heroSub}>Lung Cancer Detection System • 93.5% Accuracy</Text>
          <View style={styles.heroPills}>
            {['CNN Deep Learning', 'Real-time Analysis', '4 Cancer Types'].map((t, i) => (
              <View key={i} style={styles.heroPill}><Text style={styles.heroPillText}>{t}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.uploadHeader}>
              <View style={styles.uploadIconBox}><Text style={{ fontSize: 16 }}>📁</Text></View>
              <View>
                <Text style={styles.uploadTitle}>Upload CT Scan</Text>
                <Text style={styles.uploadSub}>DICOM / PNG / JPG supported</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.dropzone} onPress={pickImage}>
              {image ? (
                <>
                  <Text style={styles.fileSelectedText}>✅ File Selected</Text>
                  <Text style={styles.fileNameText}>{image.uri.split('/').pop()}</Text>
                </>
              ) : (
                <>
                  <Text style={{ color: C.blue, fontSize: 24, marginBottom: 6 }}>⬆</Text>
                  <Text style={styles.dropzoneText}>Tap to upload CT scan</Text>
                  <Text style={styles.dropzoneSub}>Supports all image formats</Text>
                </>
              )}
            </TouchableOpacity>
            {image && (
              <View style={styles.previewBox}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
                <Text style={styles.previewLabel}>CT Scan Preview</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.analyzeBtn, (!image || loading) && styles.analyzeBtnDisabled]}
              onPress={analyze} disabled={!image || loading}>
              <Text style={[styles.analyzeBtnText, (!image || loading) && { color: C.muted }]}>
                {loading ? '🔄 AI Processing...' : '🔬 Run AI Analysis'}
              </Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={C.blue} size="large" />
              <Text style={styles.loadingText}>🧠 AI Analyzing CT Scan...</Text>
              <Text style={styles.loadingSub}>Running deep learning inference</Text>
            </View>
          )}

          {result && (
            <>
              <View style={styles.reportHeader}>
                <Text style={styles.reportHeaderBrand}>MEDISCAN AI • DIAGNOSTIC REPORT</Text>
                <Text style={styles.reportHeaderDate}>📅 {result.report_date}</Text>
                <Text style={styles.reportHeaderPowered}>Powered by CNN Deep Learning Model</Text>
              </View>

              <View style={[styles.diagnosisCard, { borderColor: getSeverityColor(result.severity) + '55' }]}>
                <Text style={styles.diagnosisLabel}>PRIMARY DIAGNOSIS</Text>
                <Text style={[styles.diagnosisName, { color: getSeverityColor(result.severity) }]}>{result.diagnosis}</Text>
                <View style={styles.statsRow}>
                  <InfoBox label="AI CONFIDENCE" value={result.confidence} color={C.green} />
                  <InfoBox label="SEVERITY" value={result.severity} color={getSeverityColor(result.severity)} />
                  <InfoBox label="5-YR SURVIVAL" value={result.survival_rate?.split('(')[0]} color={C.blue} />
                </View>
                <Text style={styles.diagnosisDesc}>{result.description}</Text>
                <View style={styles.prognosisBox}>
                  <Text style={styles.prognosisLabel}>PROGNOSIS</Text>
                  <Text style={styles.prognosisText}>{result.prognosis}</Text>
                </View>
              </View>

              <Section icon="📊" title="CANCER STAGING (ESTIMATED)" color={C.blue}>
                {[
                  { label: 'PROBABLE STAGE', value: result.staging?.probable_stage },
                  { label: 'TNM CLASSIFICATION', value: result.staging?.tnm },
                  { label: 'NOTE', value: result.staging?.note },
                ].map((item, i) => (
                  <View key={i} style={styles.stagingBox}>
                    <Text style={styles.stagingLabel}>{item.label}</Text>
                    <Text style={styles.stagingValue}>{item.value}</Text>
                  </View>
                ))}
              </Section>

              <Section icon="🔍" title="RADIOLOGICAL FINDINGS" color={C.blue}>
                {result.findings?.map((f: string, i: number) => <Row key={i} text={f} color={C.blue} />)}
              </Section>

              <Section icon="⚠️" title="ASSOCIATED SYMPTOMS" color={C.orange}>
                <View style={styles.pillWrap}>
                  {result.symptoms?.map((s: string, i: number) => <Pill key={i} text={s} color={C.orange} />)}
                </View>
              </Section>

              <Section icon="🧬" title="RISK FACTORS" color={C.yellow}>
                <View style={styles.pillWrap}>
                  {result.risk_factors?.map((r: string, i: number) => <Pill key={i} text={r} color={C.yellow} />)}
                </View>
              </Section>

              <Section icon="💊" title="RECOMMENDED TREATMENT PLAN" color={C.green}>
                {result.treatment?.map((t: string, i: number) => <NumRow key={i} num={i + 1} text={t} color={C.green} />)}
              </Section>

              <Section icon="🏥" title="SPECIALIST REFERRAL" color={C.purple}>
                {result.specialist_referral?.map((s: string, i: number) => <Row key={i} text={s} color={C.purple} />)}
              </Section>

              <Section icon="🔬" title="ADDITIONAL INVESTIGATIONS" color="#00ccff">
                {result.additional_tests?.map((t: string, i: number) => <NumRow key={i} num={i + 1} text={t} color="#00ccff" />)}
              </Section>

              <Section icon="📅" title="FOLLOW-UP PLAN" color={C.yellow}>
                {result.followup_plan?.map((f: string, i: number) => <Row key={i} text={f} color={C.yellow} />)}
              </Section>

              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerTitle}>⚕️ MEDICAL DISCLAIMER</Text>
                <Text style={styles.disclaimerText}>
                  Must be reviewed by a board-certified radiologist or oncologist before any clinical decision.
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#041020' },
  scroll: { flex: 1, backgroundColor: C.bg },
  topBar: { backgroundColor: '#041020', borderBottomWidth: 1, borderBottomColor: C.blue + '33', padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topBarBrand: { color: C.blue, fontSize: 11, letterSpacing: 3, fontWeight: '700' },
  topBarSub: { color: C.muted, fontSize: 10 },
  onlineBadge: { backgroundColor: C.green + '18', borderWidth: 1, borderColor: C.green + '44', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  onlineText: { color: C.green, fontSize: 10 },
  hero: { backgroundColor: '#041828', padding: 28, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.border },
  heroIcon: { width: 60, height: 60, backgroundColor: C.blue + '15', borderWidth: 2, borderColor: C.blue + '44', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle: { color: C.blue, fontSize: 22, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  heroSub: { color: C.muted, fontSize: 13, marginBottom: 14 },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  heroPill: { backgroundColor: C.blue + '12', borderWidth: 1, borderColor: C.blue + '33', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  heroPillText: { color: C.blue, fontSize: 11 },
  container: { padding: 14 },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  uploadHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  uploadIconBox: { width: 36, height: 36, backgroundColor: C.blue + '15', borderWidth: 1, borderColor: C.blue + '44', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  uploadTitle: { color: C.blue, fontSize: 15, fontWeight: '600' },
  uploadSub: { color: C.muted, fontSize: 11 },
  dropzone: { backgroundColor: '#040f1c', borderWidth: 2, borderColor: C.blue + '44', borderStyle: 'dashed', borderRadius: 14, padding: 24, alignItems: 'center', marginBottom: 14 },
  dropzoneText: { color: C.text, fontSize: 13, marginBottom: 4 },
  dropzoneSub: { color: C.muted, fontSize: 11 },
  fileSelectedText: { color: C.green, fontSize: 14, marginBottom: 4 },
  fileNameText: { color: C.muted, fontSize: 11 },
  previewBox: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  previewImage: { width: '100%', height: 200 },
  previewLabel: { position: 'absolute', bottom: 8, left: 12, color: C.muted, fontSize: 11 },
  analyzeBtn: { backgroundColor: C.blue, padding: 16, borderRadius: 14, alignItems: 'center' },
  analyzeBtnDisabled: { backgroundColor: '#0a1e30' },
  analyzeBtnText: { color: '#000', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  loadingCard: { backgroundColor: C.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.blue + '33', marginBottom: 14, gap: 8 },
  loadingText: { color: C.blue, fontSize: 15, marginTop: 8 },
  loadingSub: { color: C.muted, fontSize: 12 },
  reportHeader: { backgroundColor: '#041828', borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.blue + '33', alignItems: 'center' },
  reportHeaderBrand: { color: C.muted, fontSize: 10, letterSpacing: 3, marginBottom: 4 },
  reportHeaderDate: { color: C.blue, fontSize: 12, marginBottom: 4 },
  reportHeaderPowered: { color: C.muted, fontSize: 10 },
  diagnosisCard: { backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 14, borderWidth: 2 },
  diagnosisLabel: { color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 6 },
  diagnosisName: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  infoBox: { flex: 1, backgroundColor: '#040f1c', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1 },
  infoLabel: { color: C.muted, fontSize: 9, letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 12, fontWeight: '700' },
  diagnosisDesc: { color: '#7aa8c8', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  prognosisBox: { backgroundColor: '#040f1c', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.border },
  prognosisLabel: { color: C.muted, fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  prognosisText: { color: C.text, fontSize: 13 },
  section: { backgroundColor: C.card, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, gap: 8 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  row: { backgroundColor: '#0a1e30', borderRadius: 10, padding: 11, marginBottom: 8, borderLeftWidth: 3, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowDot: { fontSize: 10, marginTop: 3 },
  rowText: { color: C.text, fontSize: 13, lineHeight: 20, flex: 1 },
  numBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 11, fontWeight: '700' },
  pill: { borderWidth: 1, borderRadius: 30, paddingHorizontal: 12, paddingVertical: 5, margin: 3 },
  pillText: { fontSize: 12 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  stagingBox: { backgroundColor: '#040f1c', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  stagingLabel: { color: C.muted, fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  stagingValue: { color: C.text, fontSize: 13 },
  disclaimer: { backgroundColor: '#0a0800', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#3a2a0055', alignItems: 'center', marginBottom: 30 },
  disclaimerTitle: { color: '#6a5500', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  disclaimerText: { color: '#4a3a00', fontSize: 11, lineHeight: 18, textAlign: 'center' },
});