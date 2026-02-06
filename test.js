const { default: getScreenDimensions } = require('./dist/index.js');

async function test() {
  try {
    console.log('Testing cross-platform screen dimensions...');
    const screenInfo = await getScreenDimensions();

    console.log(
      'Screen dimensions:',
      screenInfo.screen.width,
      'x',
      screenInfo.screen.height
    );
    console.log(
      'Work area:',
      screenInfo.workArea.x,
      'x',
      screenInfo.workArea.y,
      '-',
      screenInfo.workArea.width,
      'x',
      screenInfo.workArea.height
    );

    console.log('Success! Screen info retrieved.');
  } catch (error) {
    console.error('Error getting screen dimensions:', error.message);
    console.error(
      'Platform may not be supported or required tools are not available.'
    );
  }
}

test();
