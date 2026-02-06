import { getMacOSScreenInfo, ScreenInfo } from '../macos';
import { execa } from 'execa';

// Mock execa to avoid actually calling system commands during tests
jest.mock('execa', () => ({
  execa: jest.fn(),
}));

describe('macOS Screen Info', () => {
  const mockedExeca = execa as jest.MockedFunction<typeof execa>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return screen and work area information from system_profiler', async () => {
    // Mock system_profiler response
    const mockSystemProfilerResponse = {
      stdout: JSON.stringify({
        SPDisplaysDataType: [
          {
            spdisplays_pixels: '2560 x 1440',
            spdisplays_main: true,
          },
        ],
      }),
    };

    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockSystemProfilerResponse
    );

    const result: ScreenInfo = await getMacOSScreenInfo();

    expect(result).toEqual({
      screen: {
        width: 2560,
        height: 1440,
      },
      workArea: {
        x: 0,
        y: 0,
        width: 2560,
        height: 1440,
      },
    });

    expect(execa).toHaveBeenCalledWith(
      'system_profiler',
      ['SPDisplaysDataType', '-json'],
      expect.any(Object)
    );
  });

  it('should fallback to screenresolution if system_profiler fails', async () => {
    // Mock system_profiler to fail
    (mockedExeca as jest.MockedFunction<any>).mockRejectedValueOnce(
      new Error('system_profiler failed')
    );

    // Mock screenresolution response
    const mockScreenResolutionResponse = {
      stdout: 'Display 1: 1920x1080x32@0,0',
    };
    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockScreenResolutionResponse
    );

    const result: ScreenInfo = await getMacOSScreenInfo();

    expect(result).toEqual({
      screen: {
        width: 1920,
        height: 1080,
      },
      workArea: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
      },
    });
  });

  it('should handle system_profiler with multiple displays', async () => {
    // Mock system_profiler response with multiple displays
    const mockSystemProfilerResponse = {
      stdout: JSON.stringify({
        SPDisplaysDataType: [
          {
            spdisplays_pixels: '1440 x 900',
            spdisplays_main: false,
          },
          {
            spdisplays_pixels: '2560 x 1440',
            spdisplays_main: true, // This should be selected
          },
        ],
      }),
    };

    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockSystemProfilerResponse
    );

    const result: ScreenInfo = await getMacOSScreenInfo();

    expect(result).toEqual({
      screen: {
        width: 2560,
        height: 1440,
      },
      workArea: {
        x: 0,
        y: 0,
        width: 2560,
        height: 1440,
      },
    });
  });

  it('should fallback to osascript if other methods fail', async () => {
    // Mock system_profiler to fail (first call)
    (mockedExeca as jest.MockedFunction<any>).mockRejectedValueOnce(
      new Error('system_profiler failed')
    );

    // Mock osascript response (second call, in the catch block)
    const mockOsascriptResponse = {
      stdout: '2560, 1600',
    };
    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockOsascriptResponse
    );

    const result: ScreenInfo = await getMacOSScreenInfo();

    expect(result).toEqual({
      screen: {
        width: 2560,
        height: 1600,
      },
      workArea: {
        x: 0,
        y: 0,
        width: 2560,
        height: 1600,
      },
    });
  });

  it('should return default values when all methods fail', async () => {
    // Mock all methods to fail
    (mockedExeca as jest.MockedFunction<any>)
      .mockRejectedValueOnce(new Error('system_profiler failed'))
      .mockRejectedValueOnce(new Error('screenresolution failed'))
      .mockRejectedValueOnce(new Error('osascript failed'));

    const result: ScreenInfo = await getMacOSScreenInfo();

    expect(result).toEqual({
      screen: {
        width: 1920,
        height: 1080,
      },
      workArea: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
      },
    });
  });

  it('should parse system_profiler JSON correctly', async () => {
    // Mock system_profiler with valid JSON but no main display property
    const mockSystemProfilerResponse = {
      stdout: JSON.stringify({
        SPDisplaysDataType: [
          {
            spdisplays_pixels: '1920 x 1080',
          },
        ],
      }),
    };

    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockSystemProfilerResponse
    );

    const result: ScreenInfo = await getMacOSScreenInfo();

    expect(result).toEqual({
      screen: {
        width: 1920,
        height: 1080,
      },
      workArea: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
      },
    });
  });
});
