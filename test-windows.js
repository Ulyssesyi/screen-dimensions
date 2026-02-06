const { execa } = require('execa');

async function testPowerShell() {
  console.log('\n=== Testing PowerShell Method ===');
  try {
    const psScript = `
      Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        public class Win32Api {
          [DllImport("user32.dll")]
          public static extern bool EnumDisplayMonitors(IntPtr hdc, IntPtr lprcClip, MonitorEnumProc lpfnEnum, IntPtr dwData);
          [DllImport("user32.dll")]
          public static extern bool GetMonitorInfo(IntPtr hMonitor, ref MonitorInfoEx lpmi);
          
          public delegate bool MonitorEnumProc(IntPtr hMonitor, IntPtr hdcMonitor, ref Rect lprcMonitor, IntPtr dwData);
        }
        
        [StructLayout(LayoutKind.Sequential)]
        public struct Rect {
          public int left;
          public int top;
          public int right;
          public int bottom;
        }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        public struct MonitorInfoEx {
          public uint cbSize;
          public Rect rcMonitor;
          public Rect rcWork;
          public uint dwFlags;
          [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
          public string szDevice;
        }
      "@

      $monitors = @()
      $callback = [Win32Api+MonitorEnumProc] {
        param(
          [IntPtr]$hMonitor,
          [IntPtr]$hdcMonitor,
          [ref][Rect]$lprcMonitor,
          [IntPtr]$dwData
        )
        
        $monitorInfo = New-Object MonitorInfoEx
        $monitorInfo.cbSize = [System.Runtime.InteropServices.Marshal]::SizeOf([MonitorInfoEx])
        
        if ([Win32Api]::GetMonitorInfo($hMonitor, [ref]$monitorInfo)) {
          $monitor = @{
            ScreenWidth = $monitorInfo.rcMonitor.right - $monitorInfo.rcMonitor.left
            ScreenHeight = $monitorInfo.rcMonitor.bottom - $monitorInfo.rcMonitor.top
            WorkAreaX = $monitorInfo.rcWork.left
            WorkAreaY = $monitorInfo.rcWork.top
            WorkAreaWidth = $monitorInfo.rcWork.right - $monitorInfo.rcWork.left
            WorkAreaHeight = $monitorInfo.rcWork.bottom - $monitorInfo.rcWork.top
          }
          $monitors += $monitor
        }
        return $true
      }

      [Win32Api]::EnumDisplayMonitors([IntPtr]::Zero, [IntPtr]::Zero, $callback, [IntPtr]::Zero)

      # 如果有多个显示器，返回主显示器信息（通常x,y为0,0）
      $primaryMonitor = $monitors | Where-Object { $_.WorkAreaX -eq 0 -and $_.WorkAreaY -eq 0 } | Select-Object -First 1
      if (-not $primaryMonitor) {
        $primaryMonitor = $monitors[0]
      }

      $result = @{
        screenWidth = $primaryMonitor.ScreenWidth
        screenHeight = $primaryMonitor.ScreenHeight
        workAreaX = $primaryMonitor.WorkAreaX
        workAreaY = $primaryMonitor.WorkAreaY
        workAreaWidth = $primaryMonitor.WorkAreaWidth
        workAreaHeight = $primaryMonitor.WorkAreaHeight
      }

      $result | ConvertTo-Json
    `;

    const { stdout, stderr } = await execa(
      'powershell',
      ['-Command', psScript],
      { reject: false }
    );
    console.log('PowerShell stdout:', stdout);
    console.log('PowerShell stderr:', stderr);
    return stdout;
  } catch (error) {
    console.log('PowerShell error:', error.message);
    return null;
  }
}

async function testPowerShellBypass() {
  console.log('\n=== Testing PowerShell Bypass Method ===');
  try {
    const { stdout, stderr } = await execa(
      'powershell',
      [
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        `
      Add-Type -AssemblyName System.Windows.Forms
      $screen = [System.Windows.Forms.Screen]::PrimaryScreen
      $bounds = $screen.Bounds
      $work = $screen.WorkingArea
      "{\"screenWidth\":${bounds.Width},\"screenHeight\":${bounds.Height},\"workAreaX\":${work.X},\"workAreaY\":${work.Y},\"workAreaWidth\":${work.Width},\"workAreaHeight\":${work.Height}}"
    `,
      ],
      { reject: false }
    );
    console.log('PowerShell Bypass stdout:', stdout);
    console.log('PowerShell Bypass stderr:', stderr);
    return stdout;
  } catch (error) {
    console.log('PowerShell Bypass error:', error.message);
    return null;
  }
}

async function testWMIC() {
  console.log('\n=== Testing WMIC Method ===');
  try {
    const { stdout, stderr } = await execa(
      'wmic',
      [
        'path',
        'win32_videocontroller',
        'get',
        'CurrentHorizontalResolution,CurrentVerticalResolution',
        '/format:value',
      ],
      { reject: false }
    );
    console.log('WMIC stdout:', stdout);
    console.log('WMIC stderr:', stderr);
    return stdout;
  } catch (error) {
    console.log('WMIC error:', error.message);
    return null;
  }
}

async function testCMD() {
  console.log('\n=== Testing CMD Method ===');
  try {
    const { stdout: displayInfo, stderr } = await execa(
      'cmd',
      ['/c', 'wmic path win32_desktopmonitor get ScreenHeight,ScreenWidth'],
      { reject: false }
    );
    console.log('CMD stdout:', displayInfo);
    console.log('CMD stderr:', stderr);
    return displayInfo;
  } catch (error) {
    console.log('CMD error:', error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('Running Windows screen info tests...');

  await testPowerShell();
  await testPowerShellBypass();
  await testWMIC();
  await testCMD();

  console.log('\n=== Testing Complete ===');
}

runAllTests();
