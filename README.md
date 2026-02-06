# Cross-Platform Screen Dimensions

A cross-platform library to get screen dimensions and work area dimensions for Windows, macOS, and Linux.

## Installation

```bash
npm install cross-platform-screen-dimensions
```

## Usage

### Basic Usage (Auto-detect platform)

```javascript
import getScreenDimensions from 'cross-platform-screen-dimensions';

async function example() {
  try {
    const screenInfo = await getScreenDimensions();

    console.log(
      'Screen dimensions:',
      screenInfo.screen.width,
      'x',
      screenInfo.screen.height
    );
    console.log(
      'Work area:',
      screenInfo.workArea.x,
      'x',
      screenInfo.workArea.y,
      '-',
      screenInfo.workArea.width,
      'x',
      screenInfo.workArea.height
    );
  } catch (error) {
    console.error('Error getting screen dimensions:', error.message);
  }
}

example();
```

### Explicit Platform Functions

```javascript
import {
  getWindowsScreenDimensions,
  getMacOSScreenDimensions,
  getLinuxScreenDimensions,
} from 'cross-platform-screen-dimensions';

// Only for Windows
const windowsInfo = await getWindowsScreenDimensions();

// Only for macOS
const macosInfo = await getMacOSScreenDimensions();

// Only for Linux
const linuxInfo = await getLinuxScreenDimensions();
```

### TypeScript Usage

```typescript
import getScreenDimensions, {
  ScreenInfo,
  ScreenDimensions,
  WorkAreaDimensions,
} from 'cross-platform-screen-dimensions';

async function typedExample(): Promise<void> {
  const screenInfo: ScreenInfo = await getScreenDimensions();

  const screen: ScreenDimensions = screenInfo.screen;
  const workArea: WorkAreaDimensions = screenInfo.workArea;

  console.log(`Screen: ${screen.width}x${screen.height}`);
  console.log(
    `Work Area: (${workArea.x}, ${workArea.y}) ${workArea.width}x${workArea.height}`
  );
}
```

## API

### `getScreenDimensions(): Promise<ScreenInfo>`

Returns a promise that resolves to a `ScreenInfo` object containing screen and work area dimensions.
Automatically detects the current platform and uses the appropriate method.

### `getWindowsScreenDimensions(): Promise<ScreenInfo>`

Explicitly gets screen dimensions on Windows using PowerShell and WMI.

### `getMacOSScreenDimensions(): Promise<ScreenInfo>`

Explicitly gets screen dimensions on macOS using system_profiler or screenresolution.

### `getLinuxScreenDimensions(): Promise<ScreenInfo>`

Explicitly gets screen dimensions on Linux using xrandr, xdpyinfo or other display utilities.

## Returned Object Structure

```typescript
interface ScreenInfo {
  screen: {
    width: number; // Screen width in pixels
    height: number; // Screen height in pixels
  };
  workArea: {
    x: number; // Work area X coordinate
    y: number; // Work area Y coordinate
    width: number; // Work area width in pixels
    height: number; // Work area height in pixels
  };
}
```

## Supported Platforms

- Windows (7, 8, 10, 11) - Uses PowerShell and WMI
- macOS (10.12+) - Uses system_profiler or screenresolution
- Linux - Uses xrandr, xdpyinfo, or wmctrl

## Requirements

- On Windows: PowerShell must be available
- On Linux: xrandr, xdpyinfo, or other X11 utilities must be installed
- Node.js 14+

## License

MIT
