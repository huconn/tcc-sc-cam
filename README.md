# TSC-CAM (Telechips SOC Camera Configuration Tool)

TSC-CAM is a desktop application for configuring camera systems on Telechips TCC807x (Dolphin5) System-on-Chip platforms. It provides an intuitive visual interface for designing camera pipelines and generates Device Tree Source (DTS) files for Linux kernel integration.

## Features

- **Visual Camera Pipeline Design** - Drag-and-drop interface for creating camera data paths
- **MIPI CSI Configuration** - Configure multiple MIPI CSI interfaces with virtual channels
- **ISP Management** - Configure Image Signal Processing units with CFA patterns and memory sharing
- **Camera Multiplexer** - Design complex input/output routing for multiple camera sources
- **DTS Generation** - Export configurations as Device Tree Source files for kernel integration
- **Dual Core Support** - Separate configurations for main and sub cores
- **Configuration Management** - Save and load complete system configurations as JSON

## System Requirements

- Node.js 18 or higher
- npm 9 or higher
- Windows, macOS, or Linux

## Installation

```bash
# Clone the repository
git clone https://github.com/huconn/tcc-sc-cam
cd tcc-sc-cam

# Install dependencies
npm install

# Run the application
npm run dev
```

## Development

### Available Scripts

```bash
npm run dev          # Run full application (Vite + Electron)
npm run dev:vite     # Run Vite development server only
npm run dev:electron # Run Electron only (waits for Vite)
npm run build        # Build for production
npm run package      # Package application for distribution
npm run make         # Create distributable packages
```

### Project Structure

```
electron/
├── main.js                    # Electron main process
├── src/
│   ├── App.tsx               # Main application component
│   ├── components/           # React components
│   │   ├── CameraMux/        # Camera multiplexer configuration
│   │   ├── ExternalDevices/  # External device management
│   │   ├── ISPConfiguration/ # ISP unit configuration
│   │   ├── MIPIConfiguration/# MIPI CSI interface configuration
│   │   ├── Overview/         # System overview visualization
│   │   └── Preview/          # Camera preview functionality
│   ├── hooks/                # Custom React Hooks (reusable logic)
│   │   ├── useDebugToggle.ts # Keyboard shortcut debug toggles
│   │   ├── useLocalStorage.ts# localStorage state management
│   │   ├── useWindowSize.ts  # Window size tracking
│   │   └── useElectronAPI.ts # Electron environment detection
│   ├── services/             # Business logic services
│   ├── controllers/          # Application controllers
│   ├── store/                # State management (Zustand)
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions (DTS generation)
├── dist/                     # Build output
└── out/                      # Packaged application
```

## Technology Stack

- **Framework**: Electron 38 + React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Package Management**: npm

## Configuration Components

### MIPI CSI
- Virtual channel configuration (VC0-VC3)
- Data lane settings (1-4 lanes)
- HS settle timing adjustment
- Interleave mode support

### ISP (Image Signal Processor)
- Color Filter Array (CFA) patterns
- Memory sharing options
- Bypass mode configuration
- Multiple ISP unit support

### Camera Multiplexer
- Input/output port mapping
- Dynamic routing configuration
- Multiple camera source support

### Video Processing
- **SVDW**: Video grabber and blender configuration
- **VWDMA**: Video Write DMA with IR encoding
- **CIED**: Camera Image Error Detection
- **MDW**: Memory Display Writer settings

## Usage

### Basic Workflow

1. **Configure External Devices**: Set up camera sensors and their properties
2. **Setup MIPI CSI**: Configure MIPI interfaces and virtual channels
3. **Configure ISP**: Set up image processing parameters
4. **Design Pipeline**: Use the Overview tab to visually connect components
5. **Export Configuration**:
   - Save as JSON for later editing
   - Export as DTS files for kernel integration

### Exporting DTS Files

1. Complete your camera configuration
2. Click "Export DTS" in the header
3. Select output directory
4. Two files will be generated:
   - `main-core.dts` - Main core configuration
   - `sub-core.dts` - Sub core configuration

### Saving/Loading Configurations

- **Save**: File → Save Configuration (Ctrl+S)
- **Load**: File → Load Configuration (Ctrl+O)
- Configurations are saved as JSON files

## Supported Hardware

- **SoC**: Telechips TCC807x (Dolphin5)
- **Camera Interfaces**: MIPI CSI-2
- **ISP Units**: Multiple ISP instances
- **Video Input**: SVDW, VWDMA
- **Error Detection**: CIED
- **Memory Writer**: MDW

## Development Guidelines

### Code Style
- TypeScript with strict type checking
- React functional components with hooks
- Zustand for state management
- Tailwind CSS for styling

### File Naming
- React components: PascalCase (e.g., `DeviceBlock.tsx`)
- Utilities: camelCase (e.g., `dtsGenerator.ts`)
- Types: PascalCase with `.types.ts` extension

### Testing
```bash
# Run tests (when available)
npm test
```

## Building for Production

### Using Electron Builder

#### Default Build Commands (with Git Hash)
These commands automatically append the git commit hash to the version (e.g., `0.9.0-9053b5b`):

```bash
# Build the application only (without installer)
npm run build

# Build installer for Windows (includes git hash)
npm run build:win

# Build installer for macOS (includes git hash)
npm run build:mac

# Build installer for Linux (includes git hash)
npm run build:linux

# Build installer for current platform (includes git hash)
npm run dist
```

#### Alternative Version Strategies

```bash
# Simple version without git hash (e.g., 0.9.0)
npm run build:win:simple
npm run build:mac:simple
npm run build:linux:simple

# With build number (e.g., 0.9.0-20250119.1823)
npm run build:win:build

# With both build number and git hash (e.g., 0.9.0-20250119.1823-9053b5b)
npm run build:win:full
```

#### Setting Custom Build Numbers
For CI/CD environments, you can set a custom build number:

```bash
# Windows
set BUILD_NUMBER=123
npm run build:win:build
# Result: 0.9.0-123

# Linux/macOS
export BUILD_NUMBER=123
npm run build:mac:build
```

The installer files will be generated in the `dist` directory:
- Windows: `Telechips SOC Configuration Tool Setup {version}-{hash}.exe`
- macOS: `.dmg` and `.zip` files with version-hash
- Linux: `.AppImage`, `.deb`, and `.rpm` files with version-hash

## Custom React Hooks

The application uses custom React Hooks to encapsulate reusable logic. See [src/hooks/README.md](src/hooks/README.md) for detailed documentation.

### Available Hooks

#### useDebugToggle
Manages keyboard shortcut-based debug feature toggles (Ctrl+Shift+D, Ctrl+Shift+L).

```tsx
const [visible] = useDebugToggle({
  key: 'D',
  featureEnabled: debugShowDtsMap,
  debugName: 'DTS Map'
});
```

#### useLocalStorage
Synchronizes React state with localStorage automatically.

```tsx
const [currentSoc, setCurrentSoc] = useLocalStorage('selectedSoc', '');
```

#### useWindowSize
Tracks browser window size and resolution in real-time.

```tsx
const { width, height, resolution, scale, dpr } = useWindowSize();
```

#### useElectronAPI
Detects Electron environment and provides API access.

```tsx
const { isElectron, api, version } = useElectronAPI();
```

### Benefits
- Code reusability: 66 lines reduced (94% reduction)
- Consistent patterns across the application
- Type-safe with TypeScript
- Easy to test and maintain

## Troubleshooting

### Common Issues

1. **Port 5173 already in use**: Kill the process using the port or change the Vite port in `vite.config.ts`
2. **Electron not starting**: Ensure Vite dev server is running first (`npm run dev:vite`)
3. **Build failures**: Clear `node_modules` and reinstall (`rm -rf node_modules && npm install`)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[License information to be added]

## Support

For issues and questions, please use the GitHub issue tracker.

## Acknowledgments

- Telechips for SoC documentation and support
- Electron and React communities
- Open source contributors
