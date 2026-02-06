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
export async function getScreenDimensions(): Promise<ScreenInfo> {
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
export async function getWindowsScreenDimensions(): Promise<WindowsScreenInfo> {
  return await getWindowsScreenInfo();
}

/**
 * 显式获取macOS屏幕信息
 */
export async function getMacOSScreenDimensions(): Promise<MacOSScreenInfo> {
  return await getMacOSScreenInfo();
}

/**
 * 显式获取Linux屏幕信息
 */
export async function getLinuxScreenDimensions(): Promise<LinuxScreenInfo> {
  return await getLinuxScreenInfo();
}

// 导出类型定义
export type { ScreenDimensions, WorkAreaDimensions, ScreenInfo };

// 默认导出
export default getScreenDimensions;
