/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
    },
    'android.release': {
      type: 'android.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
    },
    'ios.debug': {
      type: 'ios.app',
      build:
        'xcodebuild -workspace ios/smartodo.xcworkspace -scheme smartodo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/smartodo.app',
    },
    'ios.release': {
      type: 'ios.app',
      build:
        'xcodebuild -workspace ios/smartodo.xcworkspace -scheme smartodo -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
      binaryPath:
        'ios/build/Build/Products/Release-iphonesimulator/smartodo.app',
    },
  },
  devices: {
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_4_API_30',
      },
    },
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15',
      },
    },
  },
  configurations: {
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
  },
};
