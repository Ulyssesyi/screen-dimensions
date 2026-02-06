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
 * 获取Windows屏幕尺寸和工作区域尺寸
 * 使用多种方法获取屏幕信息，优先级：PowerShell -> WMI -> 注册表 -> 默认值
 */
export async function getWindowsScreenInfo(): Promise<ScreenInfo> {
  // 方法1: 尝试使用更简单的PowerShell命令
  try {
    const simplePsScript = `Add-Type -AssemblyName System.Windows.Forms; $screen = [System.Windows.Forms.Screen]::PrimaryScreen; $bounds = $screen.Bounds; $work = $screen.WorkingArea; '{"screenWidth":' + $bounds.Width + ',"screenHeight":' + $bounds.Height + ',"workAreaX":' + $work.X + ',"workAreaY":' + $work.Y + ',"workAreaWidth":' + $work.Width + ',"workAreaHeight":' + $work.Height + '}'`;

    const { stdout } = await execa(
      'powershell',
      ['-ExecutionPolicy', 'Bypass', '-Command', simplePsScript],
      { reject: false }
    );

    if (stdout && stdout.trim()) {
      try {
        const result = JSON.parse(stdout.trim());

        return {
          screen: {
            width: result.screenWidth,
            height: result.screenHeight,
          },
          workArea: {
            x: result.workAreaX,
            y: result.workAreaY,
            width: result.workAreaWidth,
            height: result.workAreaHeight,
          },
        };
      } catch (parseError) {
        // JSON解析失败，继续尝试其他方法
      }
    }
  } catch (psError) {
    // PowerShell可能受策略限制，继续尝试其他方法
  }

  // 方法2: 尝试使用WMI查询
  try {
    const wmiPsScript = `$monitor = Get-WmiObject -Class Win32_DesktopMonitor | Select-Object -First 1; if ($monitor) { '{"width":' + $monitor.ScreenWidth + ',"height":' + $monitor.ScreenHeight + '}' }`;

    const { stdout } = await execa(
      'powershell',
      ['-ExecutionPolicy', 'Bypass', '-Command', wmiPsScript],
      { reject: false }
    );

    if (stdout && stdout.trim()) {
      try {
        const result = JSON.parse(stdout.trim());

        if (result.width && result.height) {
          return {
            screen: { width: result.width, height: result.height },
            workArea: {
              x: 0,
              y: 0,
              width: result.width,
              height: result.height,
            },
          };
        }
      } catch (parseError) {
        // JSON解析失败，继续尝试其他方法
      }
    }
  } catch (wmiError) {
    // WMI查询失败，继续尝试其他方法
  }

  // 方法3: 尝试使用Registry查询
  try {
    const regScript = `reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Video" /s /v "DefaultSettings.XResolution" 2>$null | Select-Object -Last 1`;
    const { stdout: widthOutput } = await execa(
      'powershell',
      ['-ExecutionPolicy', 'Bypass', '-Command', regScript],
      { reject: false }
    );

    const regScript2 = `reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Video" /s /v "DefaultSettings.YResolution" 2>$null | Select-Object -Last 1`;
    const { stdout: heightOutput } = await execa(
      'powershell',
      ['-ExecutionPolicy', 'Bypass', '-Command', regScript2],
      { reject: false }
    );

    const widthMatch = widthOutput.match(
      /DefaultSettings\.XResolution\s+REG_DWORD\s+(\d+)/
    );
    const heightMatch = heightOutput.match(
      /DefaultSettings\.YResolution\s+REG_DWORD\s+(\d+)/
    );

    if (widthMatch && heightMatch) {
      const width = parseInt(widthMatch[1], 16); // 注册表中的值是十六进制
      const height = parseInt(heightMatch[1], 16);

      if (width && height && width > 100 && height > 100) {
        return {
          screen: { width, height },
          workArea: { x: 0, y: 0, width: width, height: height },
        };
      }
    }
  } catch (regError) {
    // 注册表查询失败，继续尝试其他方法
  }

  // 方法4: 最后的备用方法 - 返回常见分辨率
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
