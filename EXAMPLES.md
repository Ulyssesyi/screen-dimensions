# Cross-Platform Screen Dimensions - Examples

## Basic Usage

```javascript
import getScreenDimensions from 'cross-platform-screen-dimensions';

async function main() {
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
    console.error('Could not get screen dimensions:', error.message);
  }
}

main();
```

## TypeScript Usage

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

## Platform-Specific Usage

```javascript
import {
  getWindowsScreenDimensions,
  getMacOSScreenDimensions,
  getLinuxScreenDimensions,
} from 'cross-platform-screen-dimensions';

async function platformSpecific() {
  // Only for Windows
  try {
    const windowsInfo = await getWindowsScreenDimensions();
    console.log('Windows screen info:', windowsInfo);
  } catch (error) {
    console.error('Not on Windows or error occurred:', error.message);
  }

  // Only for macOS
  try {
    const macosInfo = await getMacOSScreenDimensions();
    console.log('macOS screen info:', macosInfo);
  } catch (error) {
    console.error('Not on macOS or error occurred:', error.message);
  }

  // Only for Linux
  try {
    const linuxInfo = await getLinuxScreenDimensions();
    console.log('Linux screen info:', linuxInfo);
  } catch (error) {
    console.error('Not on Linux or error occurred:', error.message);
  }
}
```

## Advanced Usage with Error Handling

```javascript
import getScreenDimensions from 'cross-platform-screen-dimensions';

async function robustScreenInfo() {
  try {
    const screenInfo = await getScreenDimensions();

    // Calculate aspect ratio
    const aspectRatio = screenInfo.screen.width / screenInfo.screen.height;

    // Determine screen size category
    const screenSize =
      screenInfo.screen.width >= 2560
        ? 'Ultra HD+'
        : screenInfo.screen.width >= 1920
          ? 'Full HD'
          : screenInfo.screen.width >= 1366
            ? 'HD+'
            : 'Standard';

    console.log({
      dimensions: `${screenInfo.screen.width}x${screenInfo.screen.height}`,
      aspectRatio: aspectRatio.toFixed(2),
      screenSize,
      workAreaAvailable:
        screenInfo.workArea.width < screenInfo.screen.width ||
        screenInfo.workArea.height < screenInfo.screen.height,
    });

    return screenInfo;
  } catch (error) {
    console.warn(
      'Could not determine screen dimensions, using defaults:',
      error.message
    );

    // Return reasonable defaults
    return {
      screen: { width: 1920, height: 1080 },
      workArea: { x: 0, y: 0, width: 1920, height: 1080 },
    };
  }
}
```

## Integration with UI Frameworks

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import getScreenDimensions from 'cross-platform-screen-dimensions';

function ScreenInfoComponent() {
  const [screenInfo, setScreenInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadScreenInfo() {
      try {
        setLoading(true);
        const info = await getScreenDimensions();
        setScreenInfo(info);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadScreenInfo();
  }, []);

  if (loading) return <div>Detecting screen dimensions...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!screenInfo) return <div>Could not determine screen dimensions</div>;

  return (
    <div>
      <h3>Screen Information</h3>
      <p>
        Screen: {screenInfo.screen.width}×{screenInfo.screen.height}
      </p>
      <p>
        Work Area: {screenInfo.workArea.x},{screenInfo.workArea.y}{' '}
        {screenInfo.workArea.width}×{screenInfo.workArea.height}
      </p>
      <p>
        Usable Space:{' '}
        {Math.round(
          ((screenInfo.workArea.width * screenInfo.workArea.height) /
            (screenInfo.screen.width * screenInfo.screen.height)) *
            100
        )}
        %
      </p>
    </div>
  );
}

export default ScreenInfoComponent;
```

## Testing Your Application

When testing applications that use screen dimensions, you can mock this library:

```javascript
// __mocks__/cross-platform-screen-dimensions.js
export default jest.fn(() =>
  Promise.resolve({
    screen: { width: 1920, height: 1080 },
    workArea: { x: 0, y: 0, width: 1920, height: 1080 },
  })
);

export const getWindowsScreenDimensions = jest.fn(() =>
  Promise.resolve({
    screen: { width: 1920, height: 1080 },
    workArea: { x: 0, y: 0, width: 1920, height: 1080 },
  })
);

export const getMacOSScreenDimensions = jest.fn(() =>
  Promise.resolve({
    screen: { width: 2560, height: 1600 },
    workArea: { x: 0, y: 0, width: 2560, height: 1600 },
  })
);

export const getLinuxScreenDimensions = jest.fn(() =>
  Promise.resolve({
    screen: { width: 1366, height: 768 },
    workArea: { x: 0, y: 0, width: 1366, height: 768 },
  })
);
```

This library provides a reliable way to get screen and work area dimensions across all major operating systems with a consistent API.
