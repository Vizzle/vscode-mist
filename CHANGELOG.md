# 更新日志

## 0.3.16 - 2020-06-09

### Fixed

- 修复 Android 调试时不支持中文路径的问题

### Improved

- Android 调试支持 bizCode 为空的配置

## 0.3.15 - 2020-06-03

### Added

- 规范 mock 数据文件格式 `*.mock.json`

### Fixed

- 修复 json 文件修改后预览不能实时更新的问题
- 修复部分情况数组类型检查误报问题

### Improved

- 预览功能优化
  - 添加了一些 Android 预览机型
  - 预览窗口标题中显示模板文件名
  - 打开预览时不转移窗口焦点
- 检查同一个 `vars` 字典中的变量引用，避免未定义行为
- 更新预置变量、函数

## 0.3.14 - 2020-05-06

### Fixed

- 修复 Android 调试时获取设备 IP 问题

### Improved

- postNotification 增加 params 属性
