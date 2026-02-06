import { getWindowsScreenInfo, ScreenInfo } from '../windows';
import { execa } from 'execa';

// Mock execa to avoid actually calling system commands during tests
jest.mock('execa', () => ({
  execa: jest.fn(),
}));

describe('Windows Screen Info', () => {
  const mockedExeca = execa as jest.MockedFunction<typeof execa>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return screen and work area information on Windows using PowerShell', async () => {
    // Mock PowerShell response
    const mockPowerShellResponse = {
      stdout: JSON.stringify({
        screenWidth: 1920,
        screenHeight: 1080,
        workAreaX: 0,
        workAreaY: 0,
        workAreaWidth: 1920,
        workAreaHeight: 1080,
      }),
    };

    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockPowerShellResponse
    );

    const result: ScreenInfo = await getWindowsScreenInfo();

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

    expect(execa).toHaveBeenCalledWith(
      'powershell',
      expect.arrayContaining(['-Command']),
      expect.any(Object)
    );
  });

  it('should fallback to PowerShell Bypass if regular PowerShell fails', async () => {
    // Mock regular PowerShell to fail
    (mockedExeca as jest.MockedFunction<any>).mockRejectedValueOnce(
      new Error('Access denied')
    );

    // Mock PowerShell Bypass response
    const mockPowerShellBypassResponse = {
      stdout:
        '{"screenWidth":1920,"screenHeight":1080,"workAreaX":0,"workAreaY":0,"workAreaWidth":1920,"workAreaHeight":1080}',
    };
    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockPowerShellBypassResponse
    );

    const result: ScreenInfo = await getWindowsScreenInfo();

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

  it('should fallback to WMI query if PowerShell methods fail', async () => {
    // Mock PowerShell method to fail
    (mockedExeca as jest.MockedFunction<any>).mockRejectedValueOnce(
      new Error('Execution Policy Error')
    ); // Simple PowerShell

    // Mock WMI response
    const mockWmiResponse = {
      stdout: '{"width":1920,"height":1080}',
    };
    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockWmiResponse
    );

    const result: ScreenInfo = await getWindowsScreenInfo();

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

  it('should handle PowerShell parsing errors and fallback', async () => {
    // Mock PowerShell returning invalid JSON
    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce({
      stdout: 'invalid json',
    }); // Simple PowerShell

    // Mock WMI with valid response
    const mockWmiResponse = {
      stdout: '{"width":2560,"height":1440}',
    };
    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockWmiResponse
    );

    const result: ScreenInfo = await getWindowsScreenInfo();

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

  it('should return default values when all methods fail', async () => {
    // Mock all methods to fail
    (mockedExeca as jest.MockedFunction<any>)
      .mockRejectedValueOnce(new Error('PowerShell Error')) // Simple PowerShell
      .mockRejectedValueOnce(new Error('WMI Error')) // WMI Query
      .mockRejectedValueOnce(new Error('Registry Error')); // Registry Query

    const result: ScreenInfo = await getWindowsScreenInfo();

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
