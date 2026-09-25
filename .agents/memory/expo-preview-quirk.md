---
name: Expo preview shared-library warning
description: The managed Expo preview can run even when React Native DevTools cannot load a system GLib library.
---

The React Native DevTools install warning is non-blocking in this workspace: Metro and the Expo web/native preview still start and render normally.

**Why:** The managed runtime may not include the native library DevTools expects, while the app bundler itself remains healthy.

**How to apply:** Treat this specific warning as informational unless Metro fails or the preview is blank; do not change app code to work around it.