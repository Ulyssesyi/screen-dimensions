/**
 * 屏幕维度接口
 */
export interface ScreenDimensions {
  /**
   * 屏幕宽度（像素）
   */
  width: number;
  /**
   * 屏幕高度（像素）
   */
  height: number;
}

/**
 * 工作区域维度接口
 */
export interface WorkAreaDimensions extends ScreenDimensions {
  /**
   * 工作区域起始X坐标
   */
  x: number;
  /**
   * 工作区域起始Y坐标
   */
  y: number;
}

/**
 * 屏幕信息接口
 */
export interface ScreenInfo {
  /**
   * 屏幕维度信息
   */
  screen: ScreenDimensions;
  /**
   * 工作区域维度信息
   */
  workArea: WorkAreaDimensions;
}
