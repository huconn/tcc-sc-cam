# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TSC-CAM is an Electron + React application built with Vite. It appears to be in early development stages for a camera application.

## Tech Stack

- **Frontend**: React 19 with Vite
- **Desktop Framework**: Electron 38
- **Build Tool**: Vite 7
- **Package Manager**: npm
- **Linting**: ESLint 9 with React hooks and refresh plugins

## Development Commands

```bash
# Run the full application (Vite dev server + Electron)
npm run dev

# Run only the Vite development server
npm run dev:vite

# Run only Electron (waits for Vite on port 5173)
npm run dev:electron
```

## Project Structure

- `src/` - React application source code
  - `main.jsx` - React entry point
  - `App.jsx` - Main React component
- `public/` - Static assets
- `vite.config.js` - Vite configuration
- `eslint.config.js` - ESLint configuration

## Important Notes

1. **Missing Electron Main Process**: The project currently lacks an Electron main process file (typically `electron.js` or `main.js` in the root). This needs to be created for the Electron app to function properly.

2. **Development Server**: The Electron dev script waits for the Vite server on `http://localhost:5173` before launching.

3. **Module Type**: The project uses ES modules (`"type": "module"` in package.json).

4. **Concurrent Development**: Uses `concurrently` to run both Vite and Electron in parallel during development.