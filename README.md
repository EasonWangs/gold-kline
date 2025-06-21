# 黄金K线图 - 实时监测应用

一个现代化的黄金价格实时监测应用，提供专业的K线图表和价格分析功能。

## 🌟 功能特性

- **实时价格监测**: 每30秒自动更新黄金价格
- **多货币支持**: 支持美元/盎司和人民币/克双货币切换
- **专业K线图**: 使用 TradingView 的 lightweight-charts 库
- **真实历史数据**: 集成多个API数据源，提供真实的历史K线数据
- **多时间周期**: 支持1分钟到1周的多种时间周期
- **价格统计**: 显示24小时最高价、最低价、成交量等
- **趋势分析**: 实时显示价格变化和市场趋势
- **智能备用**: 多API数据源自动切换，确保数据可用性
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

### 3. 配置API密钥（可选）
创建 `.env` 文件并添加API密钥：
```bash
# GoldAPI.io API密钥 (https://goldapi.io/)
VITE_GOLDAPI_KEY=your_goldapi_key_here

# Alpha Vantage API密钥 (https://www.alphavantage.co/support/#api-key)
# 免费注册，每天500次请求
VITE_ALPHAVANTAGE_KEY=your_alphavantage_key_here
```

### 4. 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 5. 构建生产版本
```bash
npm run build
```

## 🌐 API 数据源

### 主要数据源
1. **GoldAPI.io** (主要)
   - 提供实时和历史黄金价格
   - 支持多货币 (USD, CNY)
   - 需要API密钥，有免费配额

2. **Alpha Vantage** (备用历史数据)
   - 提供外汇市场XAU/USD数据
   - 免费API，每天500次请求
   - 需要注册获取API密钥

3. **Coinbase** (备用实时数据)
   - 免费汇率API，无需密钥
   - 提供XAU和CNY汇率数据
   - 用于实时价格备用计算

### 智能切换机制
- **实时价格**: GoldAPI.io → Coinbase备用
- **历史数据**: GoldAPI.io → Alpha Vantage备用
- **自动故障转移**: API配额用完或网络错误时自动切换
- **错误处理**: 优雅处理API限制和网络问题

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

## 🔑 API密钥获取

### GoldAPI.io
1. 访问 [https://goldapi.io/](https://goldapi.io/)
2. 注册免费账户
3. 获取API密钥（每月1000次免费请求）
4. 添加到 `.env` 文件中的 `VITE_GOLDAPI_KEY`

### Alpha Vantage
1. 访问 [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
2. 免费注册（不到20秒）
3. 获取API密钥（每天500次免费请求）
4. 添加到 `.env` 文件中的 `VITE_ALPHAVANTAGE_KEY`

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

### 环境变量配置
生产环境需要配置以下环境变量：
```bash
VITE_GOLDAPI_KEY=your_production_goldapi_key
VITE_ALPHAVANTAGE_KEY=your_production_alphavantage_key
```

### Vercel 部署
```bash
npm run build
# 在Vercel控制台配置环境变量
```

### Netlify 部署
```bash
npm run build
# 在Netlify控制台配置环境变量
```

## 🔧 配置选项

### API 配置
在 `src/services/goldApi.ts` 中可以配置：
- API 端点和密钥
- 请求超时时间
- 批量请求大小
- 错误重试逻辑

### 图表配置
在 `src/components/GoldChart.tsx` 中可以配置：
- 图表主题和颜色
- 时间周期选项
- 图表尺寸
- 交互功能

## 📝 开发说明

### 添加新的数据源
1. 在 `goldApi.ts` 中添加新的API函数
2. 更新错误处理和备用逻辑
3. 测试API集成和数据格式

### 自定义货币支持
1. 更新 `CurrencySwitch.tsx` 组件
2. 在 `goldApi.ts` 中添加汇率转换逻辑
3. 更新类型定义

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请联系开发者。 