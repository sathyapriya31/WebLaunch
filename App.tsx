/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
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
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function normalizeUrl(input: string) {
  if (!input) return '';
  const trimmed = input.trim();
  // If user didn't provide a scheme, assume https
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    return 'https://' + trimmed;
  }
  return trimmed;
}

function AppContent() {
  const [urlInput, setUrlInput] = useState('https://www.example.com');
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const webviewRef = useRef<any>(null);

  const open = () => {
    const normalized = normalizeUrl(urlInput);
    setOpenUrl(normalized);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {openUrl ? (
        <View style={styles.webContainer}>
          <View style={styles.webHeader}>
            <TouchableOpacity
              onPress={() => setOpenUrl(null)}
              style={styles.backButton}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.headerUrl}>
              {openUrl}
            </Text>
          </View>
          <WebView
            ref={webviewRef}
            source={{uri: openUrl}}
            startInLoadingState
            style={styles.webview}
          />
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={urlInput}
            onChangeText={setUrlInput}
            placeholder="Enter a URL (e.g. example.com or https://...)"
            placeholderTextColor="#999"
            keyboardType={Platform.OS === 'web' ? 'default' : 'url'}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={open}
          />
          <TouchableOpacity onPress={open} style={styles.openButton}>
            <Text style={styles.openButtonText}>Open in WebView</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
  },
  openButton: {
    height: 48,
    backgroundColor: '#2563eb',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webHeader: {
    minHeight: 48,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  headerUrl: {
    marginLeft: 8,
    flex: 1,
    color: '#666',
    fontSize: 12,
  },
  webview: {
    flex: 1,
  },
});

export default App;
