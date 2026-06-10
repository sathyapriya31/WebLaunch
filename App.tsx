/**
 * WebLaunch React Native App
 * Redesigned for premium aesthetics, presets, history, and browser controls.
 */

import React, {useState, useRef} from 'react';
import { WebView } from 'react-native-webview';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
  Platform,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

const PRESETS = [
  { id: 'google', name: 'Google', url: 'https://www.google.com', icon: '🔍' },
  { id: 'github', name: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { id: 'reactnative', name: 'React Native', url: 'https://reactnative.dev', icon: '⚛️' },
];

const getTheme = (isDark: boolean) => ({
  bg: isDark ? '#0f172a' : '#f8fafc',
  card: isDark ? '#1e293b' : '#ffffff',
  text: isDark ? '#f8fafc' : '#0f172a',
  textMuted: isDark ? '#94a3b8' : '#64748b',
  primary: isDark ? '#818cf8' : '#6366f1',
  primaryLight: isDark ? '#1e1b4b' : '#e0e7ff',
  border: isDark ? '#334155' : '#e2e8f0',
  inputBg: isDark ? '#1e293b' : '#ffffff',
  headerBg: isDark ? '#1e293b' : '#ffffff',
  divider: isDark ? '#334155' : '#e2e8f0',
  statusBar: isDark ? 'light-content' as const : 'dark-content' as const,
  shadow: isDark
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      }
    : {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      },
});

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = getTheme(isDarkMode);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.headerBg}
        translucent
      />
      <AppContent />
    </SafeAreaProvider>
  );
}

function normalizeUrl(input: string) {
  if (!input) return '';
  const trimmed = input.trim();
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    return 'https://' + trimmed;
  }
  return trimmed;
}

function getDisplayDomain(url: string) {
  try {
    return url
      .replace('https://', '')
      .replace('http://', '')
      .replace('www.', '')
      .split('/')[0];
  } catch {
    return url;
  }
}

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = getTheme(isDarkMode);

  const [urlInput, setUrlInput] = useState('https://www.example.com');
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([
    'https://reactnative.dev',
    'https://github.com',
  ]);

  // WebView navigation and loading states
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const webviewRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const launch = (url: string) => {
    if (!url || url.trim() === '' || url.trim() === 'https://') return;
    const normalized = normalizeUrl(url);
    setOpenUrl(normalized);
    setUrlInput(normalized);

    // Add to history and keep unique
    setHistory((prev) => {
      const filtered = prev.filter((item) => item !== normalized);
      return [normalized, ...filtered].slice(0, 5);
    });

    Keyboard.dismiss();
  };

  const handleLaunchPress = () => {
    launch(urlInput);
  };

  const handlePresetPress = (url: string) => {
    launch(url);
  };

  const clearInput = () => {
    setUrlInput('https://');
  };

  const removeHistoryItem = (urlToRemove: string) => {
    setHistory((prev) => prev.filter((url) => url !== urlToRemove));
  };

  // WebView lifecycle handlers
  const handleLoadStart = () => {
    setIsLoading(true);
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 0.15,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  const handleLoadProgress = (event: any) => {
    const progress = event.nativeEvent.progress;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  const handleLoadEnd = () => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    });
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  // Progress Bar width interpolation
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
      {openUrl ? (
        <View style={styles.webContainer}>
          {/* WebView Header Bar */}
          <View style={[styles.webHeader, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setOpenUrl(null)}
              style={[styles.backButton, { backgroundColor: theme.primaryLight }]}
            >
              <Text style={[styles.backText, { color: theme.primary }]}>✕ Close</Text>
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.text }]}>
                {getDisplayDomain(openUrl)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => webviewRef.current?.reload()}
              style={styles.refreshButton}
              title="Refresh"
            >
              <Text style={[styles.refreshIcon, { color: theme.textMuted }]}>↻</Text>
            </TouchableOpacity>
          </View>

          {/* Animated Progress Bar */}
          {isLoading && (
            <View style={[styles.progressContainer, { backgroundColor: theme.divider }]}>
              <Animated.View style={[styles.progressBar, { width: progressWidth, backgroundColor: theme.primary }]} />
            </View>
          )}

          {/* Actual WebView */}
          <WebView
            ref={webviewRef}
            source={{ uri: openUrl }}
            startInLoadingState
            onLoadStart={handleLoadStart}
            onLoadProgress={handleLoadProgress}
            onLoadEnd={handleLoadEnd}
            onNavigationStateChange={handleNavigationStateChange}
            style={styles.webview}
            renderLoading={() => (
              <View style={[styles.loaderOverlay, { backgroundColor: theme.bg }]}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            )}
          />

          {/* Browser Navigation Footer */}
          <View style={[styles.webFooter, { backgroundColor: theme.headerBg, borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => webviewRef.current?.goBack()}
              disabled={!canGoBack}
              style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
            >
              <Text style={[styles.navButtonText, { color: canGoBack ? theme.primary : theme.textMuted }]}>
                ◀ Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => webviewRef.current?.goForward()}
              disabled={!canGoForward}
              style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
            >
              <Text style={[styles.navButtonText, { color: canGoForward ? theme.primary : theme.textMuted }]}>
                Forward ▶
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={[styles.brandIconWrap, { backgroundColor: theme.primaryLight }]}>
              <Text style={styles.brandIcon}>🌐</Text>
            </View>
            <Text style={[styles.brandTitle, { color: theme.text }]}>WebLaunch</Text>
            <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
              Instantly run websites inside a clean, native app container
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, theme.shadow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Launch Workspace</Text>
            
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
              <Text style={styles.inputPrefix}>🔗</Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={urlInput}
                onChangeText={setUrlInput}
                placeholder="Enter URL (e.g. vercel.com)"
                placeholderTextColor={theme.textMuted}
                keyboardType={Platform.OS === 'web' ? 'default' : 'url'}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={handleLaunchPress}
              />
              {urlInput.length > 0 && (
                <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
                  <Text style={[styles.clearButtonText, { color: theme.textMuted }]}>✖</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={handleLaunchPress}
              style={[styles.openButton, { backgroundColor: theme.primary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.openButtonText}>Launch Workspace</Text>
            </TouchableOpacity>
          </View>

          {/* Presets Grid */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Presets</Text>
            <View style={styles.presetsGrid}>
              {PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  onPress={() => handlePresetPress(preset.url)}
                  style={[styles.presetCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetIcon}>{preset.icon}</Text>
                  <Text style={[styles.presetName, { color: theme.text }]}>{preset.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Launch History */}
          {history.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Launches</Text>
              <View style={[styles.historyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {history.map((url, idx) => (
                  <View
                    key={url + idx}
                    style={[
                      styles.historyItem,
                      idx < history.length - 1 && { borderBottomColor: theme.divider, borderBottomWidth: 1 }
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => launch(url)}
                      style={styles.historyLink}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.historyIcon}>⏱</Text>
                      <Text numberOfLines={1} style={[styles.historyText, { color: theme.text }]}>
                        {getDisplayDomain(url)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeHistoryItem(url)}
                      style={styles.historyDelete}
                    >
                      <Text style={[styles.historyDeleteText, { color: theme.textMuted }]}>✖</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 12 : 28,
    marginBottom: 28,
  },
  brandIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandIcon: {
    fontSize: 34,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputPrefix: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 6,
  },
  clearButtonText: {
    fontSize: 14,
  },
  openButton: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    paddingLeft: 4,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  presetCard: {
    flex: 1,
    minWidth: '28%',
    maxWidth: '46%',
    margin: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  presetName: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  historyLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    fontSize: 15,
    marginRight: 10,
    opacity: 0.8,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  historyDelete: {
    padding: 6,
    marginLeft: 10,
  },
  historyDeleteText: {
    fontSize: 12,
  },
  webContainer: {
    flex: 1,
  },
  webHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backText: {
    fontWeight: '700',
    fontSize: 13,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 14,
    maxWidth: '85%',
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 3,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  webview: {
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFooter: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    borderTopWidth: 1,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default App;
