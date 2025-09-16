import axios from 'axios';
import { MetalPrice, MetalType, CandlestickData } from '../types/gold';

// AKTools本地服务配置
const AKTOOLS_BASE_URL = '/api/public';

// 贵金属品种配置
const METAL_SYMBOLS = {
  gold: 'Au99.99',    // 上海黄金交易所 Au99.99
  silver: 'Ag99.99'   // 上海黄金交易所 Ag99.99
};

// 获取金属中文名称
const getMetalName = (metal: MetalType): string => {
  return metal === 'gold' ? '黄金' : '白银';
};



// 获取实时贵金属价格（黄金：人民币/克，白银：人民币/千克）
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

    // AKTools返回的价格数据
    let price = parseFloat(latestData.现价);

    // 尝试获取真实的高低价数据
    let high = price;
    let low = price;
    let change = 0;
    let changePercent = 0;

    // 检查API是否提供高低价数据
    if (latestData.最高 && latestData.最低) {
      high = parseFloat(latestData.最高);
      low = parseFloat(latestData.最低);
    }

    // 检查API是否提供涨跌数据
    if (latestData.涨跌 !== undefined) {
      change = parseFloat(latestData.涨跌) || 0;
    }

    if (latestData.涨跌幅 !== undefined) {
      changePercent = parseFloat(latestData.涨跌幅) || 0;
    }

    const metalName = getMetalName(metal);
    console.log(`AKTools - ${metalName}CNY价格: ${price.toFixed(2)}`);
    console.log(`${metalName}当日高低价: 最高=${high.toFixed(2)}, 最低=${low.toFixed(2)}, 涨跌=${change.toFixed(2)}, 涨跌幅=${changePercent.toFixed(2)}%`);
    console.log(`${metalName}API原始数据字段:`, Object.keys(latestData));

    return { price, high, low, change, changePercent };
  } catch (error) {
    const metalName = getMetalName(metal);
    console.error(`AKTools${metalName}实时数据获取失败:`, error);
    throw error;
  }
};

// 获取历史数据
const fetchHistoricalData = async (metal: MetalType = 'gold', days: number = 30): Promise<CandlestickData[]> => {
  try {
    const metalName = getMetalName(metal);
    const symbol = METAL_SYMBOLS[metal];
    console.log(`🔍 开始获取${days}天的${metalName}CNY历史数据...`);
    console.log(`📡 请求URL: ${AKTOOLS_BASE_URL}/spot_hist_sge?symbol=${symbol}`);

    const response = await axios.get(`${AKTOOLS_BASE_URL}/spot_hist_sge`, {
      params: { symbol },
      timeout: 15000
    });

    console.log(`✅ ${metalName}历史数据请求成功，状态码:`, response.status);

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
    const metalName = getMetalName(metal);
    console.error(`AKTools${metalName}历史数据获取失败:`, error);
    return []; // 返回空数组表示数据不可用
  }
};

export { getMetalName };

export const fetchMetalPrice = async (metal: MetalType = 'gold'): Promise<MetalPrice | null> => {
  try {
    const metalData = await fetchRealMetalPrice(metal);
    const metalName = getMetalName(metal);

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
    const metalName = getMetalName(metal);
    console.error(`获取CNY${metalName}价格失败:`, error);
    return null; // 返回null表示数据不可用
  }
};

export { fetchHistoricalData };