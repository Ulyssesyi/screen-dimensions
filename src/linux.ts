import { execa } from 'execa';
import { platform } from 'process';

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
 * 获取Linux屏幕尺寸和工作区域尺寸
 * 使用xrandr、xdpyinfo或其他桌面环境命令获取屏幕信息
 */
export async function getLinuxScreenInfo(): Promise<ScreenInfo> {
  try {
    // 首先尝试使用xrandr获取屏幕信息（适用于大多数Linux桌面环境）
    const { stdout } = await execa('xrandr', ['--query'], { reject: false });

    if (stdout) {
      // 解析xrandr输出查找当前连接的显示器
      const lines = stdout.split('\n');
      let primaryLine = null;
      let connectedLines = [];

      for (const line of lines) {
        if (line.includes(' connected')) {
          connectedLines.push(line);
        }
        if (line.includes(' primary')) {
          primaryLine = line;
          break;
        }
      }

      // 如果没有找到主显示器，使用第一个连接的显示器
      const targetLine = primaryLine || connectedLines[0];

      if (targetLine) {
        // 匹配分辨率，例如 "1920x1080+0+0"
        const resolutionMatch = targetLine.match(/(\d+x\d+)([+-]\d+[+-]\d+)?/);

        if (resolutionMatch) {
          const [fullMatch, resolution, position] = resolutionMatch;
          const [width, height] = resolution.split('x').map(Number);

          let x = 0;
          let y = 0;

          // 解析位置信息
          if (position) {
            const posMatch = position.match(/([+-]\d+)([+-]\d+)/);
            if (posMatch) {
              x = parseInt(posMatch[1]);
              y = parseInt(posMatch[2]);
            }
          }

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
      }
    }
  } catch (xrandrError) {
    // xrandr不可用时忽略错误
  }

  try {
    // 尝试使用xdpyinfo获取屏幕信息
    const { stdout } = await execa('xdpyinfo', [], { reject: false });

    if (stdout) {
      // 查找屏幕尺寸信息
      const dimensionMatch = stdout.match(/dimensions:\s+(\d+)x(\d+)\s+pixels/);

      if (dimensionMatch) {
        const [, width, height] = dimensionMatch;

        return {
          screen: {
            width: parseInt(width),
            height: parseInt(height),
          },
          workArea: {
            x: 0,
            y: 0,
            width: parseInt(width),
            height: parseInt(height),
          },
        };
      }
    }
  } catch (xdpyinfoError) {
    // xdpyinfo不可用时忽略错误
  }

  try {
    // 尝试使用wmctrl获取工作区信息（如果安装了窗口管理器）
    const { stdout } = await execa('wmctrl', ['-d'], { reject: false });

    if (stdout) {
      // 解析桌面信息
      const lines = stdout.split('\n');
      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 6) {
          const geometry = parts[5]; // 格式通常是 WxH+X+Y
          const geomMatch = geometry.match(/(\d+)x(\d+)\+(\d+)\+(\d+)/);

          if (geomMatch) {
            const [, width, height, x, y] = geomMatch.map(Number);

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
        }
      }
    }
  } catch (wmctrlError) {
    // wmctrl不可用时忽略错误
  }

  try {
    // 尝试使用xprop获取根窗口属性
    const { stdout } = await execa(
      'xprop',
      ['-root', '_NET_DESKTOP_GEOMETRY'],
      { reject: false }
    );

    if (stdout) {
      const geomMatch = stdout.match(
        /_NET_DESKTOP_GEOMETRY\(\w+\) = (\d+), (\d+)/
      );
      if (geomMatch) {
        const [, width, height] = geomMatch.map(Number);

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
  } catch (xpropError) {
    // xprop不可用时忽略错误
  }

  // 如果所有方法都失败，则返回默认值
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
