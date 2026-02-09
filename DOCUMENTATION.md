# Screen Dimensions Library

## 概述

这是一个跨平台的npm库，用于获取Windows、macOS和Linux系统的屏幕尺寸和工作区域尺寸信息。

## 项目结构

```
screen-dimensions/
├── src/
│   ├── index.ts          # 主入口文件，包含跨平台逻辑
│   ├── types.ts          # 类型定义
│   ├── windows.ts        # Windows平台实现
│   ├── macos.ts          # macOS平台实现
│   └── linux.ts          # Linux平台实现
├── dist/                 # 编译后的JavaScript文件
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── README.md             # 使用说明
└── test.js               # 简单测试脚本
```

## 功能特点

1. **跨平台支持**：自动检测操作系统并使用相应的方法获取屏幕信息
2. **完整类型定义**：提供TypeScript类型定义文件
3. **错误处理**：优雅地处理各种错误情况
4. **多API选项**：提供通用API和平台专用API

## 使用方法

### 基本使用

```javascript
import getScreenDimensions from 'screen-dimensions';

async function example() {
  try {
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
  } catch (error) {
    console.error('Error getting screen dimensions:', error.message);
  }
}
```

## 平台实现详情

### Windows

- 使用PowerShell和WMI获取屏幕信息
- 作为备用方案使用wmic命令

### macOS

- 使用system_profiler获取显示信息
- 作为备用方案使用screenresolution工具或osascript

### Linux

- 使用xrandr获取屏幕信息
- 作为备用方案使用xdpyinfo、wmctrl等工具

## 返回值结构

```typescript
interface ScreenInfo {
  screen: {
    width: number; // 屏幕宽度（像素）
    height: number; // 屏幕高度（像素）
  };
  workArea: {
    x: number; // 工作区域X坐标
    y: number; // 工作区域Y坐标
    width: number; // 工作区域宽度（像素）
    height: number; // 工作区域高度（像素）
  };
}
```

## 构建和发布

```bash
npm run build  # 编译TypeScript到JavaScript
npm publish    # 发布到npm
```
