// Mock the individual platform functions
jest.mock('../windows', () => ({
  getWindowsScreenInfo: jest.fn(),
}));
jest.mock('../macos', () => ({
  getMacOSScreenInfo: jest.fn(),
}));
jest.mock('../linux', () => ({
  getLinuxScreenInfo: jest.fn(),
}));

import { ScreenInfo } from '../types';

describe('Cross-Platform Screen Dimensions', () => {
  const originalPlatform = process.platform;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original platform
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true,
    });
  });

  describe('default export', () => {
    it('should call Windows function on win32 platform', async () => {
      // Temporarily override process.platform
      const platformDescriptor = Object.getOwnPropertyDescriptor(
        process,
        'platform'
      );
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true,
      });

      const mockResult: ScreenInfo = {
        screen: { width: 1920, height: 1080 },
        workArea: { x: 0, y: 0, width: 1920, height: 1080 },
      };

      const { getWindowsScreenInfo } = require('../windows');
      (getWindowsScreenInfo as jest.MockedFunction<any>).mockResolvedValueOnce(
        mockResult
      );

      // Dynamically import to get fresh copy of the function with updated platform
      const module = await import('../index');
      const result = await module.default();

      expect(getWindowsScreenInfo).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);

      // Restore the original descriptor
      if (platformDescriptor) {
        Object.defineProperty(process, 'platform', platformDescriptor);
      }
    });

    it('should call macOS function on darwin platform', async () => {
      // Temporarily override process.platform
      const platformDescriptor = Object.getOwnPropertyDescriptor(
        process,
        'platform'
      );
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        configurable: true,
      });

      const mockResult: ScreenInfo = {
        screen: { width: 2560, height: 1600 },
        workArea: { x: 0, y: 0, width: 2560, height: 1600 },
      };

      const { getMacOSScreenInfo } = require('../macos');
      (getMacOSScreenInfo as jest.MockedFunction<any>).mockResolvedValueOnce(
        mockResult
      );

      // Dynamically import to get fresh copy of the function with updated platform
      const module = await import('../index');
      const result = await module.default();

      expect(getMacOSScreenInfo).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);

      // Restore the original descriptor
      if (platformDescriptor) {
        Object.defineProperty(process, 'platform', platformDescriptor);
      }
    });

    it('should call Linux function on linux platform', async () => {
      // Temporarily override process.platform
      const platformDescriptor = Object.getOwnPropertyDescriptor(
        process,
        'platform'
      );
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true,
      });

      const mockResult: ScreenInfo = {
        screen: { width: 1920, height: 1080 },
        workArea: { x: 0, y: 0, width: 1920, height: 1080 },
      };

      const { getLinuxScreenInfo } = require('../linux');
      (getLinuxScreenInfo as jest.MockedFunction<any>).mockResolvedValueOnce(
        mockResult
      );

      // Dynamically import to get fresh copy of the function with updated platform
      const module = await import('../index');
      const result = await module.default();

      expect(getLinuxScreenInfo).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);

      // Restore the original descriptor
      if (platformDescriptor) {
        Object.defineProperty(process, 'platform', platformDescriptor);
      }
    });

    it('should throw error for unsupported platforms', async () => {
      // Temporarily override process.platform
      const platformDescriptor = Object.getOwnPropertyDescriptor(
        process,
        'platform'
      );
      Object.defineProperty(process, 'platform', {
        value: 'freebsd', // Unsupported platform
        configurable: true,
      });

      // Dynamically import to get fresh copy of the function with updated platform
      const module = await import('../index');

      await expect(module.default()).rejects.toThrow(
        'Unsupported platform: freebsd'
      );

      // Restore the original descriptor
      if (platformDescriptor) {
        Object.defineProperty(process, 'platform', platformDescriptor);
      }
    });
  });
});
