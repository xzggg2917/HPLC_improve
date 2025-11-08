# HPLC文件管理系统 - 功能说明

## 已实现功能

### 1. 全局数据管理（AppContext）
✅ 创建了 `frontend/src/contexts/AppContext.tsx`
- 统一管理Methods、Factors、Gradient数据
- 提供数据更新方法：`updateMethodsData`, `updateFactorsData`, `updateGradientData`
- 管理文件状态：`fileHandle`, `currentFilePath`, `isDirty`
- 自动同步数据到localStorage

### 2. 文件保存功能
✅ 在 `App.tsx` 中实现完整的文件保存逻辑

#### New File (新建文件)
- 清空所有数据，创建新的工作空间
- 如果有未保存的数据，提示用户先保存

#### Save File (保存文件)
**首次保存：**
- 使用 `showSaveFilePicker` 弹出另存为对话框
- 用户选择保存位置和文件名
- 保存文件句柄（fileHandle）供后续使用

**后续保存：**
- 直接使用已保存的fileHandle写入原文件
- 无需再次选择文件位置
- 自动清除 `isDirty` 标记

#### Save As (另存为)
- 始终弹出文件选择对话框
- 可以将数据保存到新位置
- 更新fileHandle为新文件

### 3. 文件加载功能
✅ Open File 功能完整实现

- 使用 `showOpenFilePicker` 选择JSON文件
- 解析文件内容并验证数据格式
- 将数据加载到Context中
- 所有页面自动更新显示加载的数据
- 如果有未保存的数据，先提示用户保存

### 4. 关闭前保存提示
✅ 使用 `beforeunload` 事件监听

- 当用户关闭浏览器/标签页时
- 如果 `isDirty === true`（有未保存的数据）
- 浏览器会显示标准的确认对话框
- 提示用户保存数据

### 5. 页面集成
✅ MethodsPage - 完全集成Context
- 数据变更自动同步到Context
- 文件加载时自动更新页面
- 数据变更时设置 `isDirty = true`

✅ FactorsPage - 完全集成Context
- 试剂数据统一管理
- 自动同步到Context和localStorage

⚠️ HPLCGradientPage - 部分集成
- 由于该页面使用了额外的字段（stepNo, flowRate, curve等）
- 需要进一步调整数据结构适配
- 当前仍使用localStorage作为临时方案

## 数据文件格式

保存的JSON文件结构：
```json
{
  "version": "1.0.0",
  "lastModified": "2025-01-08T12:00:00.000Z",
  "methods": {
    "sampleCount": 10,
    "preTreatmentReagents": [
      { "id": "1", "name": "Acetone", "volume": 5 }
    ],
    "mobilePhaseA": [
      { "id": "1", "name": "Acetonitrile", "percentage": 60 }
    ],
    "mobilePhaseB": [
      { "id": "2", "name": "Water", "percentage": 40 }
    ]
  },
  "factors": [
    {
      "id": "1",
      "name": "Acetone",
      "density": 0.791,
      "safetyScore": 1.995,
      "healthScore": 0.809,
      "envScore": 0.310,
      "recycleScore": 0,
      "disposal": 2,
      "power": 1
    }
  ],
  "gradient": [
    {
      "id": "1",
      "stepNo": 0,
      "time": 0,
      "phaseA": 60,
      "phaseB": 40,
      "flowRate": 1.0,
      "curve": "linear"
    }
  ]
}
```

## 用户界面提示

### Header右侧显示
- **文件名**：显示当前打开的文件名
- **未保存标记**：红色 "⚠ 未保存" 图标（当isDirty=true时）

### 菜单项
- **File > New File**: 创建新文件
- **File > Open File**: 打开文件
- **File > Save File**: 保存文件（未保存时显示红色图标）
- **File > Save As**: 另存为

## 使用流程

### 第一次使用
1. 用户在Methods、Factors页面配置数据
2. 点击 **File > Save File**
3. 系统弹出"另存为"对话框
4. 用户选择保存位置和文件名（如：`my_analysis.json`）
5. 文件保存成功，Header显示文件名
6. `isDirty` 标记清除

### 后续编辑
1. 用户修改任何数据
2. `isDirty` 自动设置为true，Header显示"未保存"
3. 点击 **File > Save File**
4. 系统直接保存到原文件（无需选择位置）
5. `isDirty` 标记清除

### 打开已有文件
1. 点击 **File > Open File**
2. 选择之前保存的JSON文件
3. 系统解析文件内容
4. 所有页面自动显示加载的数据
5. Header显示文件名

### 关闭系统前
1. 如果有未保存的数据（isDirty=true）
2. 浏览器显示确认对话框："确定要离开吗？"
3. 用户可以选择：
   - 取消：返回保存数据
   - 离开：丢弃未保存的数据

## 技术实现细节

### File System Access API
使用现代浏览器的File System Access API：
- `showSaveFilePicker()`: 另存为对话框
- `showOpenFilePicker()`: 打开文件对话框
- `createWritable()`: 创建可写流
- `FileHandle`: 保持文件引用以支持直接保存

### 浏览器兼容性
- Chrome/Edge 86+: ✅ 完全支持
- Firefox: ❌ 不支持（需要降级方案）
- Safari: ❌ 不支持（需要降级方案）

对于不支持的浏览器，可以添加降级方案：
- 使用 `<a download>` 进行文件下载
- 使用 `<input type="file">` 进行文件上传

## 下一步优化

1. **HPLCGradientPage完全集成**
   - 统一数据结构
   - 移除对localStorage的直接依赖

2. **浏览器兼容性**
   - 检测API支持情况
   - 提供降级方案

3. **数据验证**
   - 加载文件时更严格的数据验证
   - 版本兼容性检查

4. **自动保存**
   - 可选的自动保存功能
   - 定期备份到浏览器存储

5. **文件历史**
   - 记录最近打开的文件
   - 快速访问历史文件
