# Welcome to your Expo app 👋

## Build a standalone Android app

This project uses a local native Android build. Expo Go is not supported because the app includes the native OCR module.

Install Android Studio, Android SDK 36, an Android SDK platform-tools package, and a JDK supported by Expo SDK 57. Set `ANDROID_HOME` and make sure `adb` is on your `PATH`.

Install dependencies and generate/update the native project:

```bash
npm install
npx expo prebuild --platform android
```

For an installable development APK:

```bash
npm run build:android:debug
npm run install:android:debug
```

For a release APK, create a private keystore and add `android/keystore.properties` (this file is ignored by git):

```properties
storeFile=/absolute/path/to/reactocr-upload.jks
storePassword=your-keystore-password
keyAlias=reactocr
keyPassword=your-key-password
```

Then build the signed artifact:

```bash
npm run build:android:release
```

The release APK is at `android/app/build/outputs/apk/release/app-release.apk`. For Google Play, create an Android App Bundle with `./android/gradlew -p android bundleRelease` and upload `android/app/build/outputs/bundle/release/app-release.aab` in Play Console. The Android application ID is `com.jhunt.reactocr`; change it in `app.json` before publishing if needed.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
