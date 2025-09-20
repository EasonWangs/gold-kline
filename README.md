# 贵金属价格监测应用

一个基于 Vue.js 的实时贵金属（黄金/白银）价格监测应用，支持多金属切换，提供专业的K线图表和价格分析功能。

## 🌟 功能特性

- **多贵金属支持**: 支持黄金(Au99.99)和白银(Ag99.99)价格监测
- **实时价格更新**: 自动获取上海金交所最新价格数据
- **专业K线图**: 使用 TradingView Lightweight Charts 库
- **多时间周期**: 支持日线和1分钟线图表
- **智能数据缓存**: 避免重复API请求，提升性能
- **价格趋势分析**: 实时显示涨跌幅和价格变化
- **响应式设计**: 完美适配桌面和移动设备
- **现代UI**: 基于 Tailwind CSS 的美观界面

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Composition API + TypeScript
- **构建工具**: Vite
- **图表库**: TradingView Lightweight Charts
- **样式框架**: Tailwind CSS
- **图标库**: Lucide Vue Next
- **HTTP客户端**: Axios
- **日期处理**: Day.js

## 📦 安装和运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd gold-kline
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:5081` 启动。

### 4. 构建生产版本
```bash
npm run build
```

## 🌐 API服务

### 数据源配置
- **服务地址**: `http://127.0.0.1:5080/api/gold`
- **代理配置**: Vite开发服务器代理到本地API服务
- **实时数据**: `/spot_quotations_sge` 接口
- **历史数据**: `/spot_hist_sge` 接口

### 支持的贵金属品种
- **黄金**: Au99.99 (上海金交所标准黄金，人民币/克)
- **白银**: Ag99.99 (上海金交所标准白银，人民币/千克)

## 🔧 项目架构

```
src/
├── components/              # Vue组件
│   ├── GoldChart.vue       # K线图表组件
│   ├── Header.vue          # 页面头部
│   ├── PriceInfo.vue       # 价格信息面板
│   └── MetalSwitch.vue     # 贵金属切换器
├── composables/            # Vue组合式函数
│   └── useMetalData.ts     # 全局数据管理
├── services/               # API服务层
│   └── metalApi.ts         # 贵金属API集成
├── types/                  # TypeScript类型定义
│   └── gold.ts             # 贵金属相关类型
├── App.vue                 # 主应用组件
└── main.ts                 # 应用入口
```

## ⚙️ 开发配置

### Vite代理配置
```typescript
export default defineConfig({
  server: {
    port: 5081,
    proxy: {
      '/api/gold': {
        target: 'http://127.0.0.1:5080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
```

### API接口测试
```bash
# 测试黄金实时价格
curl "http://127.0.0.1:5080/api/gold/spot_quotations_sge?symbol=Au99.99"

# 测试黄金历史数据
curl "http://127.0.0.1:5080/api/gold/spot_hist_sge?symbol=Au99.99"

# 测试白银实时价格
curl "http://127.0.0.1:5080/api/gold/spot_quotations_sge?symbol=Ag99.99"
```

## 📈 数据格式

### API响应格式
```json
{
  "count": 148,
  "data": [...],
  "status": "success",
  "timestamp": "2025-09-20T13:34:37.000"
}
```

### 实时价格数据
```typescript
interface MetalPrice {
  price: number;           // 当前价格
  open: number;            // 开盘价
  currency: string;        // 货币单位
  timestamp: number;       // 时间戳
  change: number;          // 价格变化
  changePercent: number;   // 变化百分比
  high24h: number;         // 当日最高价
  low24h: number;          // 当日最低价
  volume: number;          // 成交量
  metal: MetalType;        // 金属类型
}
```

### K线历史数据
```typescript
interface CandlestickData {
  time: number;            // 时间戳
  open: number;            // 开盘价
  high: number;            // 最高价
  low: number;             // 最低价
  close: number;           // 收盘价
  volume: number;          // 成交量
}
```

## 🎨 界面功能

### 贵金属切换
- 黄金/白银快速切换
- 自动更新价格和图表数据
- 单位自动适配（黄金：元/克，白银：元/千克）

### 价格信息面板
- 实时价格显示
- 涨跌幅指示（绿涨红跌）
- 当日开盘价、最高价、最低价
- 更新时间显示

### K线图表
- 日线和1分钟线切换
- 专业交易图表界面
- 鼠标悬停显示详细价格信息
- 图表缩放和滚动功能
- 30天默认显示范围

## 🚀 核心特性

### 智能数据管理
- 全局状态管理（`useMetalData` 组合函数）
- 并行数据加载（历史数据和实时价格同时获取）
- 智能缓存机制（24小时缓存过期）
- 避免重复API请求

### 价格计算逻辑
- 自动提取9:00:00开盘价
- 基于分时数据计算当日高低价
- 使用前一日收盘价计算涨跌幅
- 实时价格变化监测

### 图表增强功能
- 鼠标悬停显示涨跌百分比
- 透明度优化的工具提示
- 自适应时间轴显示
- 线图和蜡烛图自动切换

## 🔧 开发指南

### 添加新贵金属品种
1. 在 `types/gold.ts` 中添加新的 `MetalType`
2. 在 `metalApi.ts` 中更新 `METAL_SYMBOLS` 配置
3. 在 `MetalSwitch.vue` 中添加切换选项

### 自定义图表配置
在 `GoldChart.vue` 中可以调整：
- 图表主题和颜色方案
- 时间周期和数据范围
- 交互功能和工具提示
- 图表尺寸和布局

### API集成修改
在 `metalApi.ts` 中可以配置：
- API服务器地址
- 请求超时设置
- 错误处理逻辑
- 数据缓存策略

## 📝 运行命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run lint:fix
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License