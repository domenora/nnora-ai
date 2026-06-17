import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nnora.ai',
  appName: 'Nnora',
  webDir: 'dist',
  server: {
    // For live-reload during development only — comment out for production builds
    // url: 'http://YOUR_LOCAL_IP:5173',
    // cleartext: true,
  },
  plugins: {
    // @capgo/capacitor-llm configuration
    // Model files should be placed in the app's Documents/models directory
    // or downloaded post-install via the downloadModel() helper in localLLMService.ts
  },
  ios: {
    contentInset: 'always',
    // Minimum iOS version for ExecuTorch/MediaPipe models
    // Apple Intelligence requires iOS 26+ but custom models work on iOS 16+
    preferredContentMode: 'mobile',
  },
  android: {
    // minSdkVersion 28 required by @capgo/capacitor-llm
    // Set in android/variables.gradle after `npx cap add android`
    backgroundColor: '#FDFCF8',
  },
};

export default config;
