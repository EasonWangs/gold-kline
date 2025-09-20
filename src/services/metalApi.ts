import axios from 'axios';
import { MetalPrice, MetalType, CandlestickData } from '../types/gold';

// 本地服务配置
const API_BASE_URL = '/api/public';

// 贵金属品种配置
const METAL_SYMBOLS = {
  gold: 'Au99.99',    // 上海黄金交易所 Au99.99
  silver: 'Ag99.99'   // 上海黄金交易所 Ag99.99
};

// 历史数据缓存接口
interface HistoricalDataCache {
  data: CandlestickData[];
  timestamp: number;
  metal: MetalType;
  days: number;
}

// 内存缓存存储
const historicalDataCache = new Map<string, HistoricalDataCache>();

// 缓存键生成函数
const getCacheKey = (metal: MetalType, days: number): string => {
  return `${metal}_${days}`;
};

// 检查缓存是否有效（时间差小于1天）
const isCacheValid = (cache: HistoricalDataCache): boolean => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 1天的毫秒数
  const timeDiff = now - cache.timestamp;

  console.log(`📅 缓存时间检查: 当前时间=${new Date(now).toLocaleString()}, 缓存时间=${new Date(cache.timestamp).toLocaleString()}, 时间差=${Math.round(timeDiff / (60 * 60 * 1000))}小时`);

  return timeDiff < oneDay;
};

// 获取缓存的历史数据
const getCachedHistoricalData = (metal: MetalType, days: number): CandlestickData[] | null => {
  const cacheKey = getCacheKey(metal, days);
  const cache = historicalDataCache.get(cacheKey);

  if (!cache) {
    console.log(`💾 ${getMetalName(metal)}历史数据缓存未找到`);
    return null;
  }

  if (!isCacheValid(cache)) {
    console.log(`⏰ ${getMetalName(metal)}历史数据缓存已过期，清除缓存`);
    historicalDataCache.delete(cacheKey);
    return null;
  }

  console.log(`✅ 使用${getMetalName(metal)}历史数据缓存，共${cache.data.length}条数据`);
  return cache.data;
};

// 设置历史数据缓存
const setCachedHistoricalData = (metal: MetalType, days: number, data: CandlestickData[]): void => {
  const cacheKey = getCacheKey(metal, days);
  const cache: HistoricalDataCache = {
    data,
    timestamp: Date.now(),
    metal,
    days
  };

  historicalDataCache.set(cacheKey, cache);
  console.log(`💾 ${getMetalName(metal)}历史数据已缓存，共${data.length}条数据`);
};

// 获取金属中文名称
const getMetalName = (metal: MetalType): string => {
  return metal === 'gold' ? '黄金' : '白银';
};



// 获取实时贵金属价格（黄金：人民币/克，白银：人民币/千克）
const fetchRealMetalPrice = async (metal: MetalType = 'gold', previousClose?: number): Promise<{ price: number; open: number; high: number; low: number; change: number; changePercent: number }> => {
  try {
    const symbol = METAL_SYMBOLS[metal];
    const response = await axios.get(`${API_BASE_URL}/spot_quotations_sge`, {
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

    // API返回的价格数据
    let price = parseFloat(latestData.现价);

    // 尝试获取真实的OHLC数据
    let open = price; // 默认使用当前价
    let high = price;
    let low = price;
    let change = 0;
    let changePercent = 0;

    // 从分时数据中查找9:00:00的开盘价
    const openingData = data.find(item => {
      const timeStr = item.时间?.toString() || '';
      return timeStr.includes('9:00:00') || timeStr.includes('09:00:00');
    });

    if (openingData && openingData.现价) {
      open = parseFloat(openingData.现价);
      console.log(`找到开盘价数据: 时间=${openingData.时间}, 价格=${open.toFixed(2)}`);
    } else {
      // 检查API是否在latestData中提供开盘价数据
      if (latestData.开盘 !== undefined && latestData.开盘 !== null) {
        open = parseFloat(latestData.开盘);
      }
    }

    // 从分时数据数组中计算今日真实的最高价和最低价
    const prices = data
      .filter(item => item.现价 && !isNaN(parseFloat(item.现价)))
      .map(item => parseFloat(item.现价));

    if (prices.length > 0) {
      high = Math.max(...prices);
      low = Math.min(...prices);
      console.log(`从${prices.length}条分时数据中计算: 最高=${high.toFixed(2)}, 最低=${low.toFixed(2)}`);
    } else {
      // 备用方案：检查API是否在latestData中提供高低价数据
      if (latestData.最高 && latestData.最低) {
        high = parseFloat(latestData.最高);
        low = parseFloat(latestData.最低);
        console.log(`使用API提供的高低价: 最高=${high.toFixed(2)}, 最低=${low.toFixed(2)}`);
      }
    }

    // 使用传入的前一日收盘价作为基准价格
    let basePrice = previousClose || open; // 如果没有传入前一日收盘价，默认使用开盘价作为备用

    if (previousClose) {
      console.log(`使用传入的前一日收盘价: ${previousClose.toFixed(2)}`);
    } else {
      console.log(`未传入前一日收盘价，使用开盘价作为基准: ${basePrice.toFixed(2)}`);
    }

    // 基于当前价和基准价格计算涨跌额和涨跌幅
    change = price - basePrice;
    changePercent = basePrice !== 0 ? (change / basePrice) * 100 : 0;

    console.log(`涨跌计算: 当前价=${price.toFixed(2)}, 基准价=${basePrice.toFixed(2)}, 涨跌额=${change.toFixed(2)}, 涨跌幅=${changePercent.toFixed(2)}%`);

    // 备用方案：如果没有传入前一日收盘价且开盘价无效，尝试使用API提供的涨跌数据
    if (!previousClose && basePrice === open && (latestData.涨跌 !== undefined || latestData.涨跌幅 !== undefined)) {
      if (latestData.涨跌 !== undefined) {
        change = parseFloat(latestData.涨跌) || 0;
      }
      if (latestData.涨跌幅 !== undefined) {
        changePercent = parseFloat(latestData.涨跌幅) || 0;
      }
      console.log(`使用API涨跌数据: 涨跌额=${change.toFixed(2)}, 涨跌幅=${changePercent.toFixed(2)}%`);
    }

    const metalName = getMetalName(metal);
    console.log(`获取${metalName}CNY价格: ${price.toFixed(2)}`);
    console.log(`${metalName}当日OHLC: 开盘=${open.toFixed(2)}, 最高=${high.toFixed(2)}, 最低=${low.toFixed(2)}, 现价=${price.toFixed(2)}`);
    console.log(`${metalName}涨跌信息: 涨跌=${change.toFixed(2)}, 涨跌幅=${changePercent.toFixed(2)}%`);
    console.log(`${metalName}API原始数据字段:`, Object.keys(latestData));
    console.log(`${metalName}分时数据总条数:`, data.length);

    return { price, open, high, low, change, changePercent };
  } catch (error) {
    const metalName = getMetalName(metal);
    console.error(`${metalName}实时数据获取失败:`, error);
    throw error;
  }
};

// 获取历史数据
const fetchHistoricalData = async (metal: MetalType = 'gold', days: number = 30): Promise<CandlestickData[]> => {
  try {
    const metalName = getMetalName(metal);

    // 首先检查缓存（使用一个固定的缓存键，因为现在返回所有数据）
    const cacheKey = `${metal}_all`;
    const cache = historicalDataCache.get(cacheKey);

    if (cache && isCacheValid(cache)) {
      console.log(`✅ 使用${getMetalName(metal)}历史数据缓存，共${cache.data.length}条数据`);
      return cache.data;
    }

    if (cache && !isCacheValid(cache)) {
      console.log(`⏰ ${getMetalName(metal)}历史数据缓存已过期，清除缓存`);
      historicalDataCache.delete(cacheKey);
    }

    // 缓存未命中或已过期，从API获取数据
    const symbol = METAL_SYMBOLS[metal];
    console.log(`🔍 开始获取${metalName}CNY所有可用历史数据...`);
    console.log(`📡 请求URL: ${API_BASE_URL}/spot_hist_sge?symbol=${symbol}`);

    const response = await axios.get(`${API_BASE_URL}/spot_hist_sge`, {
      params: { symbol },
      timeout: 15000
    });

    console.log(`✅ ${metalName}历史数据请求成功，状态码:`, response.status);

    const data = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid historical data response');
    }

    const results: CandlestickData[] = [];

    // 转换所有可用数据格式（不限制天数，显示API返回的所有数据）
    const limitedData = data; // 使用所有可用数据

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
        volume: 0 // API不提供成交量数据
      });
    });

    // 按时间排序
    results.sort((a, b) => a.time - b.time);

    // 检查是否需要补充今日数据
    const today = new Date();
    const todayTimestamp = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000);

    // 检查最新的历史数据是否是今天的
    const hasToday = results.some(item => {
      const itemDate = Math.floor(item.time / 86400) * 86400;
      return itemDate === todayTimestamp;
    });

    // 如果没有今日数据，尝试从实时接口获取今日OHLC数据
    if (!hasToday) {
      try {
        console.log(`📈 历史数据中没有今日数据，尝试获取今日${metalName}实时OHLC数据...`);

        // 获取前一日收盘价作为基准
        let previousClose: number | undefined;
        if (results.length > 0) {
          previousClose = results[results.length - 1].close;
          console.log(`🔄 使用前一交易日收盘价作为基准: ${previousClose.toFixed(2)}`);
        }

        const todayData = await fetchRealMetalPrice(metal, previousClose);

        // 添加今日数据到结果中
        const todayCandle: CandlestickData = {
          time: todayTimestamp,
          open: Number(todayData.open.toFixed(2)),
          high: Number(todayData.high.toFixed(2)),
          low: Number(todayData.low.toFixed(2)),
          close: Number(todayData.price.toFixed(2)), // 使用当前价作为收盘价
          volume: 0
        };

        results.push(todayCandle);
        console.log(`✅ 成功添加今日${metalName}数据: 开盘=${todayCandle.open}, 最高=${todayCandle.high}, 最低=${todayCandle.low}, 当前=${todayCandle.close}`);

        // 重新排序
        results.sort((a, b) => a.time - b.time);
      } catch (error) {
        console.warn(`获取今日${metalName}实时数据失败:`, error);
      }
    } else {
      console.log(`📊 历史数据中已包含今日${metalName}数据`);
    }

    console.log(`成功获取${results.length}条${metalName}CNY历史数据`);

    // 将数据保存到缓存（使用新的缓存键）
    const cacheData: HistoricalDataCache = {
      data: results,
      timestamp: Date.now(),
      metal,
      days: results.length // 使用实际数据长度
    };
    historicalDataCache.set(cacheKey, cacheData);
    console.log(`💾 ${getMetalName(metal)}历史数据已缓存，共${results.length}条数据`);

    return results;

  } catch (error) {
    const metalName = getMetalName(metal);
    console.error(`${metalName}历史数据获取失败:`, error);
    return []; // 返回空数组表示数据不可用
  }
};

// 获取1分钟K线数据（基于实时分时数据）
const fetchMinuteKlineData = async (metal: MetalType = 'gold'): Promise<CandlestickData[]> => {
  try {
    const metalName = getMetalName(metal);
    const symbol = METAL_SYMBOLS[metal];
    console.log(`📈 开始获取${metalName}1分钟K线数据...`);

    const response = await axios.get(`${API_BASE_URL}/spot_quotations_sge`, {
      params: { symbol },
      timeout: 10000
    });

    const data = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid minute data response');
    }

    console.log(`${metalName}分时数据总条数:`, data.length);
    console.log(`${metalName}分时数据示例:`, data.slice(0, 2));

    // 将分时数据转换为1分钟K线格式
    const results: CandlestickData[] = [];
    const minuteGroups = new Map<string, any[]>();

    // 按分钟分组
    data.forEach((item: any) => {
      if (!item.时间 || !item.现价) return;

      // 解析时间
      const timeStr = item.时间.toString();
      let timestamp: number;

      if (timeStr.includes(':')) {
        // 如果只有时间，添加今天的日期
        const today = new Date();
        const timeParts = timeStr.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;

        const fullTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
          hours, minutes, seconds);
        timestamp = Math.floor(fullTime.getTime() / 1000);
      } else {
        // 如果是完整的时间戳
        timestamp = parseInt(item.时间);
      }

      // 按分钟分组（去掉秒数）
      const minuteTimestamp = Math.floor(timestamp / 60) * 60;
      const minuteKey = minuteTimestamp.toString();

      if (!minuteGroups.has(minuteKey)) {
        minuteGroups.set(minuteKey, []);
      }
      minuteGroups.get(minuteKey)!.push({
        ...item,
        timestamp: minuteTimestamp
      });
    });

    // 将每分钟的数据转换为OHLC格式
    for (const [minuteKey, minuteData] of minuteGroups.entries()) {
      if (minuteData.length === 0) continue;

      // 按时间排序
      minuteData.sort((a, b) => a.timestamp - b.timestamp);

      const prices = minuteData.map(d => parseFloat(d.现价));
      const open = prices[0];
      const close = prices[prices.length - 1];
      const high = Math.max(...prices);
      const low = Math.min(...prices);

      results.push({
        time: parseInt(minuteKey),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: minuteData.length // 用数据点数量作为成交量指标
      });
    }

    // 按时间排序
    results.sort((a, b) => a.time - b.time);

    console.log(`✅ 成功生成${results.length}条${metalName}1分钟K线数据`);
    return results;

  } catch (error) {
    const metalName = getMetalName(metal);
    console.error(`${metalName}1分钟K线数据获取失败:`, error);
    return [];
  }
};

export { getMetalName, fetchMinuteKlineData, fetchRealMetalPrice };

export const fetchMetalPrice = async (metal: MetalType = 'gold'): Promise<MetalPrice | null> => {
  try {
    // 先获取前一日收盘价
    let previousClose: number | undefined;
    try {
      // 优先尝试从所有数据缓存中获取前一日收盘价，避免重复请求
      const cacheKey = `${metal}_all`;
      let cache = historicalDataCache.get(cacheKey);
      let cachedData = cache?.data;

      // 如果第一次没找到缓存，等待100ms再检查一次（图表可能正在加载）
      if (!cachedData || cachedData.length < 2) {
        console.log(`⏳ 等待图表缓存建立...`);
        await new Promise(resolve => setTimeout(resolve, 100));
        cache = historicalDataCache.get(cacheKey);
        cachedData = cache?.data;
      }

      let historicalData: CandlestickData[];

      if (cachedData && cachedData.length >= 2) {
        // 使用已缓存的所有数据
        historicalData = cachedData;
        console.log(`📈 使用缓存的所有历史数据计算前一日收盘价`);
      } else {
        // 如果确实没有缓存，直接请求所有数据（与图表需求一致，避免重复请求）
        historicalData = await fetchHistoricalData(metal);
        console.log(`📈 请求所有历史数据计算前一日收盘价（同时满足图表需求）`);
      }

      if (historicalData.length >= 2) {
        // 如果有至少2天数据，取倒数第二天的收盘价（前一日收盘价）
        previousClose = historicalData[historicalData.length - 2].close;
      } else if (historicalData.length >= 1) {
        // 如果只有1天数据，使用该天的收盘价
        previousClose = historicalData[0].close;
      }
      if (previousClose) {
        console.log(`📈 获取到前一日收盘价: ${previousClose.toFixed(2)}`);
      }
    } catch (error) {
      console.warn('获取前一日收盘价失败，将使用开盘价作为基准:', error);
    }

    const metalData = await fetchRealMetalPrice(metal, previousClose);
    const metalName = getMetalName(metal);

    console.log(`CNY${metalName}价格:`, metalData);

    return {
      price: Number(metalData.price.toFixed(2)),
      open: Number(metalData.open.toFixed(2)),
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