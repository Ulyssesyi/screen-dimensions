const { getWindowsScreenInfo } = require('./dist/windows');

async function testFixedWindowsScreenInfo() {
  console.log('Testing fixed Windows screen info...');
  try {
    const result = await getWindowsScreenInfo();
    console.log('Result:', result);
    console.log('Screen width:', result.screen.width);
    console.log('Screen height:', result.screen.height);
    console.log('WorkArea x:', result.workArea.x);
    console.log('WorkArea y:', result.workArea.y);
    console.log('WorkArea width:', result.workArea.width);
    console.log('WorkArea height:', result.workArea.height);
  } catch (error) {
    console.error('Error:', error);
  }
}

testFixedWindowsScreenInfo();
