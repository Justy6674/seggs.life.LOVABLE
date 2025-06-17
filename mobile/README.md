# Mobile App Development Guide

## Overview

This directory contains configuration and documentation for extending seggs.life to native iOS and Android platforms. The web app is designed with mobile-first principles and can be extended to native platforms using React Native or Capacitor.

## Current Status

- ✅ **PWA Ready**: Web app is fully installable as a Progressive Web App
- ✅ **Mobile-First Design**: All screens are responsive and touch-optimized
- ✅ **Offline Support**: Service worker and caching implemented
- 🔄 **Native Builds**: Ready for React Native or Capacitor implementation

## Recommended Approach: React Native

### Why React Native?
- Shared codebase with existing React components
- Native performance for sensitive operations (encryption, notifications)
- Better integration with device security features
- Superior user experience for the target demographic

### Implementation Plan

1. **Phase 1: Core Migration**
   - Set up React Native project structure
   - Migrate core components from `src/components`
   - Implement Firebase SDK for React Native
   - Set up navigation with React Navigation

2. **Phase 2: Platform-Specific Features**
   - iOS: Integrate with Keychain Services for secure storage
   - Android: Implement Android Keystore for encryption keys
   - Push notifications via Firebase Cloud Messaging
   - Biometric authentication (Face ID, Touch ID, Fingerprint)

3. **Phase 3: Enhanced Security**
   - App background obfuscation (privacy mode)
   - Screenshot protection
   - Deep linking security
   - Advanced panic lock features

## Capacitor Alternative

If React Native proves challenging, Capacitor offers a simpler migration path:

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init seggs-life com.seggslife.app
npx cap add ios
npx cap add android
```

### Capacitor Plugins Needed
- `@capacitor/app` - App state management
- `@capacitor/device` - Device information
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/local-notifications` - Local reminders
- `@capacitor/preferences` - Secure storage
- `@capacitor/biometric-auth` - Biometric authentication

## Security Considerations for Mobile

### Data Protection
- Use platform-specific secure storage (Keychain/Keystore)
- Implement certificate pinning for API calls
- Enable app transport security (iOS) / network security config (Android)
- Root/jailbreak detection for additional security

### Privacy Features
- Background app obfuscation (hide content when app switcher is shown)
- Screenshot/screen recording prevention
- Disable text selection on sensitive content
- Implement app lock timeout

### Notification Security
- All notifications remain completely non-explicit
- Use Twilio for SMS instead of push notifications when possible
- Implement quiet hours and notification scheduling
- Allow users to customize notification appearance

## Development Environment Setup

### React Native Setup
```bash
# Install React Native CLI
npm install -g react-native-cli

# Create new project (when ready)
npx react-native init SeggsLifeApp --template react-native-template-typescript

# iOS Dependencies (macOS only)
cd ios && pod install

# Required packages
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
npm install react-native-keychain react-native-biometrics
npm install @react-navigation/native @react-navigation/stack
```

### Project Structure (Proposed)
```
mobile/
├── src/
│   ├── components/       # Shared from web app
│   ├── screens/         # Mobile-specific screen components
│   ├── navigation/      # React Navigation setup
│   ├── services/        # Platform-specific services
│   ├── hooks/          # Mobile-specific hooks
│   └── utils/          # Platform utilities
├── ios/                # iOS-specific configuration
├── android/           # Android-specific configuration
└── README.md         # This file
```

## Component Migration Guide

### Shared Components
These components can be directly shared between web and mobile:
- Form inputs and validation
- Cards and layout components
- Typography and spacing utilities
- Icons and visual elements

### Platform-Specific Adaptations
- Navigation: Web router → React Navigation
- Notifications: Web push → React Native push notifications
- Storage: localStorage → AsyncStorage + Keychain
- Camera: Web camera API → React Native camera
- Biometrics: Web WebAuthn → React Native biometrics

## Testing Strategy

### Mobile-Specific Testing
- Device-specific screen sizes and orientations
- Platform-specific gesture behaviors
- Background/foreground app state transitions
- Push notification delivery and handling
- Biometric authentication flows
- Security features (screenshot protection, etc.)

### Privacy Testing
- Verify no sensitive data appears in app switcher
- Test notification content in various states
- Validate secure storage implementation
- Confirm panic lock functionality
- Test data deletion completeness

## Deployment

### iOS App Store
- App Store Connect setup
- Privacy policy compliance (required for intimacy apps)
- Age rating: 17+ (Mature content)
- App Store review guidelines compliance
- TestFlight beta testing

### Google Play Store
- Google Play Console setup
- Content rating: Adults only (18+)
- Privacy policy and data handling disclosure
- Play Store review guidelines compliance
- Internal testing track

## Future Enhancements

### Advanced Mobile Features
- Apple Watch / Wear OS complications for discreet reminders
- Voice memo integration for thought bubbles
- Location-based prompts and suggestions
- Calendar integration for intimate scheduling
- Health app integration (with user consent)

### Platform Integration
- iOS Shortcuts integration for quick actions
- Android App Shortcuts for common tasks
- Widget support for daily prompts (privacy-conscious)
- Share extensions for easy content sharing between partners

## Privacy and Security Compliance

### Platform Requirements
- iOS: App Tracking Transparency framework compliance
- Android: Data collection disclosure requirements
- Both: Biometric data handling guidelines
- Both: Secure backup and restore procedures

### Legal Considerations
- GDPR compliance for EU users
- CCPA compliance for California users
- Age verification systems
- Terms of service for mobile platforms
- Privacy policy updates for mobile features

---

**Note**: This is a living document that should be updated as mobile development progresses. All mobile implementations must maintain the same privacy-first, tasteful, and mature approach as the web application. 