import axios from 'axios';
import { GoldPrice, MetalPrice, MetalType, CandlestickData } from '../types/gold';

// AKTools本地服务配置
const AKTOOLS_BASE_URL = '/api/public';

// 贵金属品种配置
const METAL_SYMBOLS = {
  gold: 'Au99.99',    // 上海黄金交易所 Au99.99
  silver: 'Ag99.99'   // 上海黄金交易所 Ag99.99
};

// 转换常量
const GRAM_TO_OUNCE = 31.1035; // 1盎司 = 31.1035克

// 获取实时贵金属价格（仅支持人民币/克）
const fetchRealMetalPrice = async (metal: MetalType = 'gold'): Promise<{ price: number; high: number; low: number; change: number; changePercent: number }> => {
  try {
    const symbol = METAL_SYMBOLS[metal];
    const response = await axios.get(`${AKTOOLS_BASE_URL}/spot_quotations_sge`, {
      params: { symbol },
      timeout: 10000
    });

    const data = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid API response');
    }

    // 获取最新的价格数据（数组最后一个元素）
    const latestData = data[data.length - 1];

    if (!latestData || !latestData.现价) {
      throw new Error('No valid price data');
    }

    // AKTools返回的是人民币/克价格
    let price = parseFloat(latestData.现价);
    let high = price * 1.01; // 估算当日高点
    let low = price * 0.99;  // 估算当日低点
    let change = 0; // AKTools API不提供变化数据
    let changePercent = 0;

    const metalName = metal === 'gold' ? '黄金' : '白银';
    console.log(`AKTools - ${metalName}CNY价格: ${price.toFixed(2)} CNY/克`);

    return { price, high, low, change, changePercent };
  } catch (error) {
    const metalName = metal === 'gold' ? '黄金' : '白银';
    console.error(`AKTools${metalName}实时数据获取失败:`, error);
    throw error;
  }
};

// 获取历史数据
const fetchHistoricalData = async (metal: MetalType = 'gold', days: number = 30): Promise<CandlestickData[]> => {
  try {
    const metalName = metal === 'gold' ? '黄金' : '白银';
    console.log(`开始获取${days}天的${metalName}CNY历史数据...`);

    const symbol = METAL_SYMBOLS[metal];
    const response = await axios.get(`${AKTOOLS_BASE_URL}/spot_hist_sge`, {
      params: { symbol },
      timeout: 15000
    });

    const data = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid historical data response');
    }

    const results: CandlestickData[] = [];

    // 转换数据格式并限制天数
    const limitedData = data.slice(-days); // 取最近的数据

    limitedData.forEach((item: any) => {
      if (!item.date || !item.open || !item.close || !item.high || !item.low) {
        return; // 跳过无效数据
      }

      const timestamp = new Date(item.date).getTime() / 1000;

      let open = parseFloat(item.open);
      let high = parseFloat(item.high);
      let low = parseFloat(item.low);
      let close = parseFloat(item.close);

      results.push({
        time: timestamp,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: 0 // AKTools不提供成交量数据
      });
    });

    // 按时间排序
    results.sort((a, b) => a.time - b.time);

    console.log(`AKTools成功获取${results.length}条${metalName}CNY历史数据`);
    return results;

  } catch (error) {
    const metalName = metal === 'gold' ? '黄金' : '白银';
    console.error(`AKTools${metalName}历史数据获取失败:`, error);
    return []; // 返回空数组表示数据不可用
  }
};

export const fetchMetalPrice = async (metal: MetalType = 'gold'): Promise<MetalPrice | null> => {
  try {
    const metalData = await fetchRealMetalPrice(metal);
    const metalName = metal === 'gold' ? '黄金' : '白银';

    console.log(`CNY${metalName}价格:`, metalData);

    return {
      price: Number(metalData.price.toFixed(2)),
      currency: 'CNY',
      timestamp: Date.now(),
      change: Number(metalData.change.toFixed(2)),
      changePercent: Number(metalData.changePercent.toFixed(2)),
      high24h: Number(metalData.high.toFixed(2)),
      low24h: Number(metalData.low.toFixed(2)),
      volume: 0, // 不使用模拟成交量数据
      metal
    };
  } catch (error) {
    const metalName = metal === 'gold' ? '黄金' : '白银';
    console.error(`获取CNY${metalName}价格失败:`, error);
    return null; // 返回null表示数据不可用
  }
};

// 保持向后兼容性
export const fetchGoldPrice = async (): Promise<GoldPrice | null> => {
  const result = await fetchMetalPrice('gold');
  if (!result) return null;

  const { metal, ...goldPrice } = result;
  return goldPrice;
};

export { fetchHistoricalData };

export const fetchRealTimeUpdates = async (metal: MetalType = 'gold'): Promise<MetalPrice | null> => {
  return fetchMetalPrice(metal);
};

// 保持向后兼容性
export const fetchGoldRealTimeUpdates = async (): Promise<GoldPrice | null> => {
  return fetchGoldPrice();
};