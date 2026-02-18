# Mobile App Conversion Strategy

This document outlines the strategies and tools to convert the current **FaceGuard Attendance System** (Next.js + Tailwind CSS) into a mobile application (Android/iOS).

## 1. The "Wrapper" Approach (Recommended)
**Tool:** Capacitor (by Ionic)
**Effort:** Low (< 1 Day)
**Best For:** Admin dashboards, internal tools, data visualization apps.

### How it works:
It takes your existing `npm run build` output (HTML/CSS/JS) and wraps it in a native webview container. It provides a bridge to access native features like Camera, Geolocation, and Push Notifications.

### Implementation Steps:
1.  **Install Capacitor:**
    ```bash
    npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
    npx cap init
    ```
2.  **Build your Web App:**
    ```bash
    npm run build
    ```
    *(Ensure `output: 'export'` is set in `next.config.mjs` for static export if needed, or point Capacitor to your server URL).*
3.  **Sync to Native:**
    ```bash
    npx cap add android
    npx cap sync
    ```
4.  **Run:** Open Android Studio (`npx cap open android`) and build the APK.

---

## 2. The "Native Rewrite" Approach (High Performance)
**Tool:** React Native (with Expo)
**Effort:** High (Rewriting UI components)
**Best For:** Consumer-facing apps requiring complex gestures, 60fps animations, or heavy device integration.

### AI-Assisted Workflow:
You can use AI tools to "translate" your existing React code to React Native.

1.  **Prompt for AI (e.g., Cursor, GitHub Copilot):**
    > "Convert this Next.js 'WorkerList' component to React Native using NativeWind (Tailwind). Replace `<div>` with `<View>`, `<p>` with `<Text>`, and use `FlatList` for the scrollable area."
2.  **Shared Logic:** Keep your existing API calls (`api/data_reader.py` logic equivalent on client) and state management hooks (`useState`, `useEffect`)—they work identically in React Native.
3.  **Styling:** Use **NativeWind** to keep using Tailwind CSS classes (`className="flex-1 bg-black"`).

---

## 3. Recommended AI & Low-Code Tools
If you want to speed up the process:

*   **DhiWise:** Import your code/design and it generates Flutter/React Native code.
*   **FlutterFlow:** Visual builder for mobile apps (requires separate rebuild).
*   **Cursor / Windsurf:** AI IDEs that can refactor web components into mobile components file-by-file.

## Summary
For **FaceGuard**, **Option 1 (Capacitor)** is the most logical first step. It requires zero code rewrite and instantly gives you an installable APK that looks exactly like your dashboard.
