# Custom React Hooks

This directory contains reusable React Custom Hooks.

## Table of Contents

- [useDebugToggle](#usedebugtoggle)
- [useLocalStorage](#uselocalstorage)
- [useWindowSize](#usewindowsize)
- [useElectronAPI](#useelectronapi)

---

## useDebugToggle

A Hook that manages keyboard shortcut-based toggle functionality for debug features.

### Features

- Toggle debug features with keyboard shortcuts
- Enable/disable control via feature flags
- Automatic store synchronization (optional)
- Customizable key combinations (Ctrl, Shift, Alt)
- Automatic debug logging

### Usage

#### Basic Usage (Display State Only)

```tsx
import { useDebugToggle } from '@/hooks/useDebugToggle';

const [visible] = useDebugToggle({
  key: 'D',                          // Ctrl+Shift+D
  featureEnabled: debugShowDtsMap,   // Feature flag from store
  debugName: 'DTS Map'               // Name for logging
});

// Conditional rendering
{debugShowDtsMap && visible && <MyComponent />}
```

#### Store Synchronization (Apply to All Components)

```tsx
useDebugToggle({
  key: 'L',
  featureEnabled: debugShowLayoutBorders,
  storeSetter: setDebugShowLayoutBorders,
  debugName: 'Layout Borders'
});

// Use store value in other components
{useCameraStore(s => s.debugShowLayoutBorders) && <Border />}
```

#### Custom Key Combinations

```tsx
useDebugToggle({
  key: 'R',
  featureEnabled: debugShowResolution,
  modifiers: {
    ctrl: true,
    shift: false,
    alt: true
  },
  debugName: 'Resolution Info'
});
// Shortcut: Ctrl+Alt+R
```

### API

```tsx
interface DebugToggleConfig {
  key: string;                    // Keyboard key (uppercase)
  featureEnabled: boolean;        // Feature flag
  storeSetter?: (value: boolean) => void;  // Store setter (optional)
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
  debugName: string;              // Name for debugging
}

function useDebugToggle(config: DebugToggleConfig): [boolean, Dispatch<SetStateAction<boolean>>]
```

---

## useLocalStorage

A Hook that automatically synchronizes React state with localStorage.

### Features

- Automatic localStorage read/write
- Synchronization between React state and localStorage
- Type-safe (TypeScript)
- Built-in error handling

### Usage

```tsx
import { useLocalStorage } from '@/hooks/useLocalStorage';

function App() {
  // Auto-sync with localStorage 'username' key
  const [name, setName] = useLocalStorage('username', 'Guest');
  
  // Calling setName automatically saves to localStorage
  setName('John');
  
  return <div>Hello, {name}</div>;
}
```

### API

```tsx
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void]
```

### Examples

#### Save User Settings

```tsx
const [settings, setSettings] = useLocalStorage('userSettings', {
  theme: 'dark',
  language: 'en'
});

// Automatically saves to localStorage when settings change
setSettings({ ...settings, theme: 'light' });
```

#### Persist Form Data

```tsx
const [formData, setFormData] = useLocalStorage('formDraft', {
  title: '',
  content: ''
});

// Form data persists even after closing the browser
```

---

## useWindowSize

A Hook that tracks browser window size and resolution information in real-time.

### Features

- Automatic detection of window size changes
- Screen resolution information
- Scale ratio calculation
- Device Pixel Ratio information

### Usage

```tsx
import { useWindowSize } from '@/hooks/useWindowSize';

function App() {
  const { width, height, resolution, scale, dpr } = useWindowSize();
  
  return (
    <div>
      <p>Window: {width}x{height}</p>
      <p>Screen: {resolution}</p>
      <p>Scale: {scale}</p>
      <p>DPR: {dpr}</p>
    </div>
  );
}
```

### API

```tsx
interface WindowSize {
  width: number;        // Browser window width
  height: number;       // Browser window height
  resolution: string;   // Screen resolution (e.g., "1920x1080")
  scale: string;        // Screen scale (e.g., "125%")
  dpr: number;          // Device Pixel Ratio
}

function useWindowSize(): WindowSize
```

### Examples

#### Responsive Layout

```tsx
const { width } = useWindowSize();

if (width < 768) {
  return <MobileLayout />;
} else {
  return <DesktopLayout />;
}
```

#### Display Debug Information

```tsx
const { resolution, scale, dpr } = useWindowSize();

return (
  <div className="debug-info">
    Resolution: {resolution} | Scale: {scale} | DPR: {dpr}
  </div>
);
```

---

## useElectronAPI

A Hook that detects Electron environment and provides access to Electron API.

### Features

- Automatic Electron environment detection
- Electron API object access
- Automatic app version loading
- Support for both browser and Electron environments

### Usage

```tsx
import { useElectronAPI } from '@/hooks/useElectronAPI';

function App() {
  const { isElectron, api, version } = useElectronAPI();
  
  if (isElectron) {
    // Electron-specific features
    const result = await api.readResourceFile('config.json');
  } else {
    // Browser-specific features
    const response = await fetch('/config.json');
  }
  
  return <div>App Version: {version}</div>;
}
```

### API

```tsx
interface ElectronAPI {
  getAppVersion?: () => Promise<string>;
  readResourceFile?: (filePath: string) => Promise<{ content?: string; error?: string }>;
  // Other Electron API methods as needed
}

interface UseElectronAPIResult {
  isElectron: boolean;       // Whether running in Electron
  api: ElectronAPI | undefined;  // Electron API object
  version: string;           // App version
}

function useElectronAPI(): UseElectronAPIResult
```

### Examples

#### File Reading (Environment-Specific)

```tsx
const { isElectron, api } = useElectronAPI();

async function loadConfig() {
  if (isElectron && api?.readResourceFile) {
    // Electron: Read file via IPC
    const result = await api.readResourceFile('/config.json');
    return JSON.parse(result.content || '{}');
  } else {
    // Browser: Read file via fetch
    const response = await fetch('/config.json');
    return response.json();
  }
}
```

#### Display Version

```tsx
const { version } = useElectronAPI();

return (
  <div className="app-version">
    v{version}
  </div>
);
```

---

## Adding New Hooks

### Step 1: Create Hook File

```tsx
// src/hooks/useMyHook.ts
import { useState, useEffect } from 'react';

export function useMyHook() {
  // Implement hook logic
  return value;
}
```

### Step 2: Add to index.ts

```tsx
// src/hooks/index.ts
export { useMyHook } from './useMyHook';
```

### Step 3: Use in Components

```tsx
import { useMyHook } from '@/hooks/useMyHook';
// or
import { useMyHook } from '@/hooks';
```

---

## Hook Writing Rules

### Naming

- Always start with `use`
- Use camelCase
- Clearly express functionality

### Structure

```tsx
export function useMyHook(config) {
  // 1. Declare state
  const [state, setState] = useState(initialValue);
  
  // 2. Handle side effects
  useEffect(() => {
    // Subscriptions, event listeners, etc.
    return () => {
      // Cleanup function
    };
  }, [dependencies]);
  
  // 3. Return value or functions
  return [state, setState];
}
```

### Important Notes

1. **Call Hooks at the Top Level Only**
   - Do not call inside conditions or loops
   - Do not call from regular functions

2. **Specify Dependencies Accurately**
   - Prevent missing dependencies in useEffect, useCallback, useMemo

3. **Write Cleanup Functions**
   - Always cleanup event listeners, timers, subscriptions

4. **Type Safety**
   - TypeScript type definitions required
   - Use generics when appropriate

---

## Hooks Used in Project

### App.tsx

```tsx
// 1. Debug toggles
const [dtsMapVisible] = useDebugToggle({
  key: 'D',
  featureEnabled: debugShowDtsMap,
  debugName: 'DTS Map'
});

useDebugToggle({
  key: 'L',
  featureEnabled: layoutBordersFeatureEnabled,
  storeSetter: setDebugShowLayoutBorders,
  debugName: 'Layout Borders'
});

// 2. Local storage
const [currentSoc, setCurrentSoc] = useLocalStorage('selectedSoc', '');
const [currentModule, setCurrentModule] = useLocalStorage('selectedModule', '');

// 3. Window size
const windowSize = useWindowSize();

// 4. Electron API
const { isElectron, version } = useElectronAPI();
```

---

## Code Improvement Results

### Before Changes

- Direct localStorage usage: 13 locations
- Browser info tracking: 36 lines
- Electron checks: 20 lines
- Total: ~70 lines

### After Changes

- Using Hooks: 4 lines
- Total: ~4 lines

**Result: 66 lines reduced (94% code reduction)**

---

## References

- [React Hooks Official Documentation](https://react.dev/reference/react)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
