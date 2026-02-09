# Screen Dimensions Library

## Overview

This library provides a cross-platform solution for retrieving screen dimensions and work area dimensions across Windows, macOS, and Linux operating systems. It automatically detects the current platform and uses the most appropriate method to retrieve accurate screen information.

## Features

- **Cross-Platform Support**: Works seamlessly on Windows, macOS, and Linux
- **Comprehensive Information**: Returns both screen dimensions and work area dimensions
- **Robust Fallbacks**: Multiple methods per platform with intelligent fallbacks
- **TypeScript Support**: Full TypeScript definitions included
- **Promise-Based API**: Modern async/await interface
- **Error Handling**: Graceful degradation with sensible defaults

## Architecture

### Core Components

1. **Platform Detection**: Automatic OS detection using Node.js `process.platform`
2. **Platform-Specific Modules**:
   - `windows.ts`: PowerShell/WMI and WMI-based detection
   - `macos.ts`: system_profiler, screenresolution, and osascript-based detection
   - `linux.ts`: xrandr, xdpyinfo, wmctrl, and xprop-based detection
3. **Unified Interface**: `index.ts` provides consistent API across platforms

### Supported Methods (by Platform)

#### Windows

1. PowerShell with Win32 API (Primary)
2. WMIC (Fallback)

#### macOS

1. system_profiler (Primary)
2. screenresolution (Fallback)
3. osascript (Last resort)

#### Linux

1. xrandr (Primary)
2. xdpyinfo (Fallback)
3. wmctrl (Fallback)
4. xprop (Last resort)

## API Reference

### Main Function

```typescript
getScreenDimensions(): Promise<ScreenInfo>
```

Automatically detects platform and retrieves screen information.

### Platform-Specific Functions

```typescript
getWindowsScreenDimensions(): Promise<ScreenInfo>
getMacOSScreenDimensions(): Promise<ScreenInfo>
getLinuxScreenDimensions(): Promise<ScreenInfo>
```

### Return Type

```typescript
interface ScreenInfo {
  screen: {
    width: number;
    height: number;
  };
  workArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

## Error Handling Strategy

The library implements a progressive fallback strategy:

1. Attempt primary method for the detected platform
2. If primary method fails, attempt secondary methods
3. If all methods fail, return sensible default values (1920x1080)

## Testing Approach

The library includes comprehensive unit tests covering:

- Platform-specific functionality
- Fallback mechanisms
- Error conditions
- Cross-platform compatibility
- Type safety

Tests use mocking to simulate different system configurations without requiring actual platform-specific tools.

## Build Process

- TypeScript compilation to JavaScript (ES2018+)
- Generation of declaration files (.d.ts)
- Tree-shaking friendly module structure
- Compatible with both CommonJS and ES modules

## Security Considerations

- Only executes system commands with predefined, safe arguments
- No user input is passed to system commands
- Sandboxed execution environment
- No network connectivity required

## Performance Characteristics

- Single execution per call (no polling)
- Efficient command execution
- Caching considerations left to the caller
- Minimal resource usage

## Compatibility

- Node.js 14+ required
- Windows 7+, macOS 10.12+, Linux with X11
- All major package managers (npm, yarn, pnpm)

## Maintenance Guidelines

1. Platform-specific updates should be made in respective modules
2. New platform support should follow the established pattern
3. Fallback strategies should maintain backward compatibility
4. Tests should cover all new functionality

This library provides a reliable, well-tested foundation for cross-platform screen dimension detection in Node.js applications.
