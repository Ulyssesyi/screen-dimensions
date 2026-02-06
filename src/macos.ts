import { execa } from 'execa';

export interface ScreenDimensions {
  width: number;
  height: number;
}

export interface WorkAreaDimensions extends ScreenDimensions {
  x: number;
  y: number;
}

export interface ScreenInfo {
  screen: ScreenDimensions;
  workArea: WorkAreaDimensions;
}

/**
 * 获取macOS屏幕尺寸和工作区域尺寸
 * 使用system_profiler或screenresolution工具获取屏幕信息
 */
export async function getMacOSScreenInfo(): Promise<ScreenInfo> {
  try {
    // 首先尝试使用system_profiler获取显示信息
    const { stdout } = await execa(
      'system_profiler',
      ['SPDisplaysDataType', '-json'],
      { reject: false }
    );

    if (stdout) {
      try {
        const displayData = JSON.parse(stdout);
        const displays = displayData.SPDisplaysDataType;

        if (displays && displays.length > 0) {
          // 首先尝试找到标记为主显示器的显示器
          let primaryDisplay = displays.find(
            (display: any) => display.spdisplays_main
          );
          // 如果没找到主显示器，尝试找内置显示器
          if (!primaryDisplay) {
            primaryDisplay = displays.find(
              (display: any) => display.spdisplays_is_builtin
            );
          }
          // 如果还没找到，使用第一个显示器
          if (!primaryDisplay) {
            primaryDisplay = displays[0];
          }

          if (primaryDisplay && primaryDisplay.spdisplays_pixels) {
            // 解析分辨率，格式如 "2560 x 1440"
            const resolutionMatch =
              primaryDisplay.spdisplays_pixels.match(/(\d+)\s*x\s*(\d+)/);

            if (resolutionMatch) {
              const width = parseInt(resolutionMatch[1]);
              const height = parseInt(resolutionMatch[2]);

              return {
                screen: {
                  width,
                  height,
                },
                workArea: {
                  x: 0,
                  y: 0,
                  width,
                  height,
                },
              };
            }
          }
        }
      } catch (parseError) {
        // 如果JSON解析失败，尝试其他方法
      }
    }

    // 备用方法：尝试使用screenresolution工具
    try {
      const { stdout: resolutionStdout } = await execa(
        'screenresolution',
        ['get'],
        { reject: false }
      );

      // screenresolution输出格式如 "Display 1: 1920x1080x32@0"
      const resolutionMatch = resolutionStdout.match(
        /(\d+)x(\d+).*?@(-?\d+,-?\d+)/
      );

      if (resolutionMatch) {
        const width = parseInt(resolutionMatch[1]);
        const height = parseInt(resolutionMatch[2]);
        const position = resolutionMatch[3].split(',');
        const x = parseInt(position[0]) || 0;
        const y = parseInt(position[1]) || 0;

        return {
          screen: {
            width,
            height,
          },
          workArea: {
            x,
            y,
            width,
            height,
          },
        };
      }
    } catch (screenResError) {
      // 忽略screenresolution错误，继续尝试其他方法
    }

    // 如果上述方法都失败，抛出错误，这样会触发catch块中的osascript回退
    throw new Error('All primary methods failed');
  } catch (error) {
    // 尝试使用更基本的方法
    try {
      // 使用osascript获取屏幕尺寸
      const script = `
        tell application "Finder"
          set desktopBounds to bounds of window of desktop
          set screenWidth to item 3 of desktopBounds
          set screenHeight to item 4 of desktopBounds
          return {screenWidth, screenHeight}
        end tell
      `;

      const { stdout } = await execa('osascript', ['-e', script], {
        reject: false,
      });

      if (stdout) {
        const [width, height] = stdout.trim().split(',').map(Number);
        if (!isNaN(width) && !isNaN(height)) {
          return {
            screen: {
              width,
              height,
            },
            workArea: {
              x: 0,
              y: 0,
              width,
              height,
            },
          };
        }
      }
    } catch (osascriptError: any) {
      // 忽略osascript错误
    }

    // 如果所有方法都失败，返回一个合理的默认值
    return {
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
    };
  }
}
