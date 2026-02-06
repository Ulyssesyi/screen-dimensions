const { getWindowsScreenDimensions } = require('./dist/index.js');

console.log('Testing enhanced Windows screen detection...');

async function testWindowsDetection() {
  try {
    console.log('Attempting to get Windows screen dimensions...');
    const result = await getWindowsScreenDimensions();
    console.log('✅ Success! Retrieved screen dimensions:', result);
  } catch (error) {
    console.log('❌ Error occurred:', error.message);
    console.log(
      "This may be due to system-level restrictions that are beyond the library's control."
    );
  }
}

testWindowsDetection();
