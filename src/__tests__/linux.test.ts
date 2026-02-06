import { getLinuxScreenInfo, ScreenInfo } from '../linux';
import { execa } from 'execa';

// Mock execa to avoid actually calling system commands during tests
jest.mock('execa', () => ({
  execa: jest.fn(),
}));

describe('Linux Screen Info', () => {
  const mockedExeca = execa as jest.MockedFunction<typeof execa>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return screen and work area information from xrandr', async () => {
    // Mock xrandr response
    const mockXrandrResponse = {
      stdout: `Screen 0: minimum 8 x 8, current 1920 x 1080, maximum 32767 x 32767
HDMI-1 connected primary 1920x1080+0+0 (normal left inverted right x axis y axis) 527mm x 296mm
   1920x1080     60.00*+  74.97    59.94    50.00    60.00    50.04
   1680x1050     59.95
   1600x900      60.00`,
    };

    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockXrandrResponse
    );

    const result: ScreenInfo = await getLinuxScreenInfo();

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
      'xrandr',
      ['--query'],
      expect.any(Object)
    );
  });

  it('should handle xrandr with multiple monitors', async () => {
    // Mock xrandr response with multiple monitors
    const mockXrandrResponse = {
      stdout: `Screen 0: minimum 8 x 8, current 3440 x 1440, maximum 32767 x 32767
DP-1 connected primary 2560x1440+0+0 (normal left inverted right x axis y axis) 708mm x 398mm
   2560x1440     59.95*+
   2560x1600     120.00   84.96
HDMI-1 connected 1920x1080+2560+0 (normal left inverted right x axis y axis) 600mm x 340mm
   1920x1080     60.00*+  59.94`,
    };

    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockXrandrResponse
    );

    const result: ScreenInfo = await getLinuxScreenInfo();

    // Should get the primary display (the one at +0+0)
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

  it('should fallback to xdpyinfo if xrandr fails', async () => {
    // Mock xrandr to fail
    (mockedExeca as jest.MockedFunction<any>).mockRejectedValueOnce(
      new Error('xrandr failed')
    );

    // Mock xdpyinfo response
    const mockXdpyinfoResponse = {
      stdout: `name of display: :0
version number: 11.0
dimensions:    1920x1080 pixels (531x299 millimeters)
resolution:    93x93 dots per inch
`,
    };
    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockXdpyinfoResponse
    );

    const result: ScreenInfo = await getLinuxScreenInfo();

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

  it('should fallback to wmctrl if xrandr and xdpyinfo fail', async () => {
    // Mock xrandr and xdpyinfo to fail
    (mockedExeca as jest.MockedFunction<any>).mockRejectedValueOnce(
      new Error('xrandr failed')
    );
    (mockedExeca as jest.MockedFunction<any>).mockRejectedValueOnce(
      new Error('xdpyinfo failed')
    );

    // Mock wmctrl response
    const mockWmctrlResponse = {
      stdout: `0  -1680 1920 1080 LG Ultra HD*+0+0  KF65R7152V
1  *0    1680 1050 LG ULTRAWIDE -1680+0  KF65R7152V`,
    };
    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockWmctrlResponse
    );

    const result: ScreenInfo = await getLinuxScreenInfo();

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

  it('should fallback to xprop if all other methods fail', async () => {
    // Mock all primary methods to fail
    (mockedExeca as jest.MockedFunction<any>).mockRejectedValueOnce(
      new Error('xrandr failed')
    );
    (mockedExeca as jest.MockedFunction<any>).mockRejectedValueOnce(
      new Error('xdpyinfo failed')
    );
    (mockedExeca as jest.MockedFunction<any>).mockRejectedValueOnce(
      new Error('wmctrl failed')
    );

    // Mock xprop response
    const mockXpropResponse = {
      stdout: `_NET_DESKTOP_GEOMETRY(CARDINAL) = 1920, 1080`,
    };
    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockXpropResponse
    );

    const result: ScreenInfo = await getLinuxScreenInfo();

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

  it('should return default values when all methods fail', async () => {
    // Mock all methods to fail
    (mockedExeca as jest.MockedFunction<any>)
      .mockRejectedValueOnce(new Error('xrandr failed'))
      .mockRejectedValueOnce(new Error('xdpyinfo failed'))
      .mockRejectedValueOnce(new Error('wmctrl failed'))
      .mockRejectedValueOnce(new Error('xprop failed'));

    const result: ScreenInfo = await getLinuxScreenInfo();

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

  it('should handle xrandr disconnected monitors', async () => {
    // Mock xrandr response with disconnected monitors
    const mockXrandrResponse = {
      stdout: `Screen 0: minimum 8 x 8, current 1920 x 1080, maximum 32767 x 32767
HDMI-1 disconnected (normal left inverted right x axis y axis)
VGA-1 connected 1920x1080+0+0 (normal left inverted right x axis y axis) 527mm x 296mm
   1920x1080     60.00*+`,
    };

    (mockedExeca as jest.MockedFunction<any>).mockResolvedValueOnce(
      mockXrandrResponse
    );

    const result: ScreenInfo = await getLinuxScreenInfo();

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
