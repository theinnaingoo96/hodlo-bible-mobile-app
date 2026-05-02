# Gathengpu Dlo (HoDlo Bible Mobile App)

Gathengpu Dlo is a modern, high-performance Bible application built with React Native. It provides a seamless experience for reading, searching, and listening to the Bible in multiple languages.

## ✨ Features

- **Multi-language Support**: Read the Bible in English (EN), Myanmar (MM), and HoDlo (HD).
- **Offline First**: All Bible data is stored locally in a high-performance SQLite database.
- **Audio Playback**: Listen to Bible chapters with built-in audio player support.
- **Daily Verses**: Receive inspiring daily bible verses via local push notifications.
- **Search & History**: Quickly find verses and track your reading history.
- **Personalization**: Customizable themes (Dark/Light mode) and reader settings (font size, font family).
- **Smart Updates**: Automatic database and app version checking to ensure you always have the latest content.

## 🚀 Getting Started

### Prerequisites
- Node.js > 18
- React Native Environment Setup ([Follow official guide](https://reactnative.dev/docs/set-up-your-environment))
- Android Studio / Xcode

### Installation

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd HoDloBibleMobileApp
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **iOS Setup**
   ```sh
   cd ios && pod install && cd ..
   ```

### Running the App

- **Android**
  ```sh
  npm run android
  ```
- **iOS**
  ```sh
  npm run ios
  ```

## 🛠 Tech Stack

- **Framework**: React Native
- **State Management**: Redux Toolkit
- **Database**: SQLite (react-native-sqlite-storage)
- **Notifications**: Notifee
- **Icons**: FontAwesome 6
- **Device Info**: React Native Device Info

## 📦 Production Build

To build the app for production (Play Store/App Store):

### Android (AAB for Play Store)
We use APK splitting and Proguard to keep the app size optimized (~15-20MB per architecture).

```sh
cd android
./gradlew bundleRelease
```
The output will be at `android/app/build/outputs/bundle/release/app-release.aab`.

### Optimization Notes
- **Hermes**: Enabled for high-performance JS execution.
- **Proguard**: Enabled to shrink and obfuscate the code.
- **APK Splitting**: Enabled to reduce download size for end-users.

## 📚 Documentation

- [Audio Player Guide](AUDIO_PLAYER_README.md) - Technical details about the audio playback system.

## 📄 License

Copyright © 2026 Gathengpu Dlo. All rights reserved.
