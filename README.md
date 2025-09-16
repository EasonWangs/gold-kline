# 黄金K线图 - 实时监测应用

一个基于AKTools本地服务的黄金价格实时监测应用，使用上海金交所数据提供专业的K线图表和价格分析功能。

## 🌟 功能特性

- **实时价格监测**: 每30秒自动更新上海金交所Au99.99黄金价格
- **多货币支持**: 支持美元/盎司和人民币/克双货币切换
- **专业K线图**: 使用 TradingView 的 lightweight-charts 库
- **真实历史数据**: 基于AKTools本地服务，获取上海金交所历史K线数据
- **本地数据源**: 使用本地部署的AKTools服务，数据稳定可靠
- **价格统计**: 显示当日最高价、最低价等价格信息
- **趋势分析**: 实时显示价格变化和市场趋势
- **响应式设计**: 完美适配桌面和移动设备
- **现代UI**: 使用 Tailwind CSS 打造的美观界面

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **图表库**: Lightweight Charts (TradingView)
- **样式框架**: Tailwind CSS
- **图标库**: Lucide React
- **HTTP客户端**: Axios

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

### 3. 确保AKTools服务运行
确保本地AKTools服务已启动并在 `http://127.0.0.1:8888` 运行

### 4. 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 5. 构建生产版本
```bash
npm run build
```

## 🌐 数据源

### AKTools本地服务
- **数据源**: 上海金交所 (Shanghai Gold Exchange)
- **服务地址**: `http://127.0.0.1:8888/api/public`
- **实时数据**: `spot_quotations_sge` 接口
- **历史数据**: `spot_hist_sge` 接口
- **黄金品种**: Au99.99 (上海金交所标准黄金)

### 汇率转换
- **美元汇率**: 通过Coinbase免费API获取实时USD/CNY汇率
- **单位转换**: 自动处理人民币/克 ↔ 美元/盎司转换 (1盎司 = 31.1035克)
- **备用汇率**: 如汇率API不可用，使用默认汇率7.2

## 🔧 项目结构

```
src/
├── components/          # React 组件
│   ├── GoldChart.tsx   # K线图组件
│   ├── Header.tsx      # 页面头部
│   ├── PriceInfo.tsx   # 价格信息面板
│   └── CurrencySwitch.tsx # 货币切换器
├── services/           # API 服务
│   └── goldApi.ts      # 多数据源API集成
├── types/              # TypeScript 类型定义
│   └── gold.ts         # 黄金相关类型
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## ⚙️ AKTools服务部署

### 本地服务要求
1. 确保AKTools服务已在本地部署并运行
2. 服务应在 `http://127.0.0.1:8888` 端口提供服务
3. 确保以下接口可访问：
   - `GET /api/public/spot_quotations_sge?symbol=Au99.99`
   - `GET /api/public/spot_hist_sge?symbol=Au99.99`

### 服务状态检查
```bash
# 检查服务是否运行
curl http://127.0.0.1:8888

# 测试实时价格接口
curl "http://127.0.0.1:8888/api/public/spot_quotations_sge?symbol=Au99.99"

# 测试历史数据接口
curl "http://127.0.0.1:8888/api/public/spot_hist_sge?symbol=Au99.99"
```

## 📈 数据格式

### 实时价格数据
```typescript
interface GoldPrice {
  price: number;          // 当前价格
  currency: 'USD' | 'CNY'; // 货币单位
  timestamp: number;      // 时间戳
  change: number;         // 价格变化
  changePercent: number;  // 变化百分比
  high24h: number;        // 24小时最高价
  low24h: number;         // 24小时最低价
  volume: number;         // 成交量
}
```

### K线历史数据
```typescript
interface CandlestickData {
  time: number;           // 时间戳
  open: number;           // 开盘价
  high: number;           // 最高价
  low: number;            // 最低价
  close: number;          // 收盘价
  volume: number;         // 成交量
}
```

## 💱 货币转换

### 支持的货币对
- **USD/盎司**: 美元每盎司黄金价格
- **CNY/克**: 人民币每克黄金价格

### 转换逻辑
- 1盎司 = 31.1035克
- 实时汇率通过Coinbase API获取
- 自动处理单位转换和汇率计算

## 🎨 界面功能

### 价格显示
- 实时价格更新
- 涨跌幅显示（绿涨红跌）
- 24小时价格区间
- 货币单位切换

### K线图表
- 专业交易图表界面
- 多时间周期选择
- 交互式缩放和平移
- 十字线价格显示
- 加载状态和错误提示

## 🚀 部署

### 生产环境部署
```bash
npm run build
```

### 注意事项
- 生产环境需要确保AKTools服务可访问
- 如果部署到服务器，需要修改API地址指向AKTools服务器
- 可在 `src/services/goldApi.ts` 中配置不同环境的API地址

## 🔧 配置选项

### API 配置
在 `src/services/goldApi.ts` 中可以配置：
- AKTools服务地址
- 请求超时时间
- 汇率API设置
- 错误处理逻辑

### 图表配置
在 `src/components/GoldChart.tsx` 中可以配置：
- 图表主题和颜色
- 时间周期选项
- 图表尺寸
- 交互功能

## 📝 开发说明

### 修改数据源
1. 在 `goldApi.ts` 中修改AKTOOLS_BASE_URL
2. 根据需要调整数据接口和参数
3. 测试新数据源的集成

### 自定义货币支持
1. 更新 `CurrencySwitch.tsx` 组件
2. 在 `goldApi.ts` 中添加新的汇率转换逻辑
3. 更新类型定义以支持新货币

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请联系开发者。 