import { getWindowsScreenInfo } from './windows';
import { getMacOSScreenInfo } from './macos';
import { getLinuxScreenInfo } from './linux';
import { platform } from 'process';
import { ScreenInfo, ScreenDimensions, WorkAreaDimensions } from './types';

type WindowsScreenInfo = ScreenInfo;
type MacOSScreenInfo = ScreenInfo;
type LinuxScreenInfo = ScreenInfo;

/**
 * 跨平台获取屏幕尺寸和工作区域尺寸
 * 自动检测当前操作系统并调用相应的函数
 */
async function getScreenDimensions(): Promise<ScreenInfo> {
  const os = platform;

  switch (os) {
    case 'win32':
      return await getWindowsScreenInfo();
    case 'darwin': // macOS
      return await getMacOSScreenInfo();
    case 'linux':
      return await getLinuxScreenInfo();
    default:
      throw new Error(
        `Unsupported platform: ${os}. This library supports Windows, macOS, and Linux.`
      );
  }
}

/**
 * 显式获取Windows屏幕信息
 */
async function getWindowsScreenDimensions(): Promise<WindowsScreenInfo> {
  return await getWindowsScreenInfo();
}

/**
 * 显式获取macOS屏幕信息
 */
async function getMacOSScreenDimensions(): Promise<MacOSScreenInfo> {
  return await getMacOSScreenInfo();
}

/**
 * 显式获取Linux屏幕信息
 */
async function getLinuxScreenDimensions(): Promise<LinuxScreenInfo> {
  return await getLinuxScreenInfo();
}

// 默认导出
export default getScreenDimensions;

// 确保CommonJS模块系统中也能正常使用默认导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = getScreenDimensions;
  module.exports.default = getScreenDimensions;
}
