const { execa } = require('execa');

async function testMethod1() {
  console.log('\n=== Testing Method 1: Simple PowerShell ===');
  try {
    const simplePsScript = `Add-Type -AssemblyName System.Windows.Forms; $screen = [System.Windows.Forms.Screen]::PrimaryScreen; $bounds = $screen.Bounds; $work = $screen.WorkingArea; "{\"screenWidth\":$($bounds.Width),\"screenHeight\":$($bounds.Height),\"workAreaX\":$($work.X),\"workAreaY\":$($work.Y),\"workAreaWidth\":$($work.Width),\"workAreaHeight\":$($work.Height)}"`;

    console.log('Executing command:', 'powershell', [
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      simplePsScript,
    ]);
    const { stdout, stderr } = await execa(
      'powershell',
      ['-ExecutionPolicy', 'Bypass', '-Command', simplePsScript],
      { reject: false }
    );

    console.log('stdout:', stdout);
    console.log('stderr:', stderr);

    if (stdout && stdout.trim()) {
      try {
        const result = JSON.parse(stdout.trim());
        console.log('Parsed result:', result);
        return result;
      } catch (parseError) {
        console.log('Parse error:', parseError.message);
        return null;
      }
    }
  } catch (error) {
    console.log('Error:', error.message);
    return null;
  }
}

async function testMethod2() {
  console.log('\n=== Testing Method 2: WMI Query ===');
  try {
    const wmiPsScript = `$monitor = Get-WmiObject -Class Win32_DesktopMonitor | Select-Object -First 1; if ($monitor) { "{\"width\":$($monitor.ScreenWidth),\"height\":$($monitor.ScreenHeight)}" }`;

    console.log('Executing command:', 'powershell', [
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      wmiPsScript,
    ]);
    const { stdout, stderr } = await execa(
      'powershell',
      ['-ExecutionPolicy', 'Bypass', '-Command', wmiPsScript],
      { reject: false }
    );

    console.log('stdout:', stdout);
    console.log('stderr:', stderr);

    if (stdout && stdout.trim()) {
      try {
        const result = JSON.parse(stdout.trim());
        console.log('Parsed result:', result);
        return result;
      } catch (parseError) {
        console.log('Parse error:', parseError.message);
        return null;
      }
    }
  } catch (error) {
    console.log('Error:', error.message);
    return null;
  }
}

async function testMethod3() {
  console.log('\n=== Testing Method 3: Registry Query ===');
  try {
    const regScript = `reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Video" /s /v "DefaultSettings.XResolution" 2>$null | Select-Object -Last 1`;
    console.log('Executing command:', 'powershell', [
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      regScript,
    ]);
    const { stdout: widthOutput, stderr: widthError } = await execa(
      'powershell',
      ['-ExecutionPolicy', 'Bypass', '-Command', regScript],
      { reject: false }
    );

    console.log('Width stdout:', widthOutput);
    console.log('Width stderr:', widthError);

    const regScript2 = `reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Video" /s /v "DefaultSettings.YResolution" 2>$null | Select-Object -Last 1`;
    console.log('Executing command:', 'powershell', [
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      regScript2,
    ]);
    const { stdout: heightOutput, stderr: heightError } = await execa(
      'powershell',
      ['-ExecutionPolicy', 'Bypass', '-Command', regScript2],
      { reject: false }
    );

    console.log('Height stdout:', heightOutput);
    console.log('Height stderr:', heightError);

    const widthMatch = widthOutput.match(
      /DefaultSettings\.XResolution\s+REG_DWORD\s+(\d+)/
    );
    const heightMatch = heightOutput.match(
      /DefaultSettings\.YResolution\s+REG_DWORD\s+(\d+)/
    );

    console.log('Width match:', widthMatch);
    console.log('Height match:', heightMatch);

    if (widthMatch && heightMatch) {
      const width = parseInt(widthMatch[1], 16);
      const height = parseInt(heightMatch[1], 16);
      console.log('Parsed resolution:', { width, height });
      return { width, height };
    }
  } catch (error) {
    console.log('Error:', error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('Running detailed Windows screen info tests...');

  const result1 = await testMethod1();
  if (result1) {
    console.log('\n=== Method 1 SUCCESS ===');
    return result1;
  }

  const result2 = await testMethod2();
  if (result2) {
    console.log('\n=== Method 2 SUCCESS ===');
    return result2;
  }

  const result3 = await testMethod3();
  if (result3) {
    console.log('\n=== Method 3 SUCCESS ===');
    return result3;
  }

  console.log('\n=== All methods failed, returning default ===');
  return {
    screen: { width: 1920, height: 1080 },
    workArea: { x: 0, y: 0, width: 1920, height: 1080 },
  };
}

runAllTests();
