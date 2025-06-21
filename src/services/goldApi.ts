import axios from 'axios';
import { GoldPrice, CandlestickData } from '../types/gold';

// GoldAPI.io 配置
const GOLDAPI_BASE_URL = 'https://www.goldapi.io/api';
const GOLDAPI_KEY = import.meta.env.VITE_GOLDAPI_KEY || 'goldapi-16d6wmitsmb4pgjia-io';

// 备用API配置 - 使用Coinbase免费汇率API
const COINBASE_API_URL = 'https://api.coinbase.com/v2/exchange-rates?currency=USD';

// Alpha Vantage API配置
const ALPHAVANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const ALPHAVANTAGE_KEY = import.meta.env.VITE_ALPHAVANTAGE_KEY || '113EWPKEPY6ONQEU'; // 需要用户提供真实密钥

// 转换常量
const OUNCE_TO_GRAM = 31.1035; // 1盎司 = 31.1035克

// 获取指定日期的历史数据 - GoldAPI.io
const fetchGoldAPIHistoricalData = async (date: string, currency: 'USD' | 'CNY' = 'USD'): Promise<CandlestickData | null> => {
  try {
    const symbol = currency === 'USD' ? 'XAU/USD' : 'XAU/CNY';
    const response = await axios.get(`${GOLDAPI_BASE_URL}/${symbol}/${date}`, {
      headers: {
        'x-access-token': GOLDAPI_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const data = response.data;
    
    // 检查是否是配额错误
    if (data.error && data.error.includes('quota exceeded')) {
      throw new Error('API quota exceeded');
    }
    
    if (!data || !data.price) {
      throw new Error('Invalid historical data response');
    }

    let price = data.price;
    let high = data.high_price || price;
    let low = data.low_price || price;
    
    // 如果是人民币，转换为人民币/克
    if (currency === 'CNY') {
      price = price / OUNCE_TO_GRAM;
      high = high / OUNCE_TO_GRAM;
      low = low / OUNCE_TO_GRAM;
    }

    // 转换日期为时间戳
    const timestamp = new Date(date).getTime() / 1000;

    return {
      time: timestamp,
      open: price, // GoldAPI.io不提供开盘价，使用当日价格
      high: high,
      low: low,
      close: price,
      volume: 0 // 不提供成交量数据
    };
  } catch (error) {
    console.error(`获取${date}历史数据失败:`, error);
    return null;
  }
};

// 获取Alpha Vantage历史数据
const fetchAlphaVantageHistoricalData = async (currency: 'USD' | 'CNY' = 'USD'): Promise<CandlestickData[]> => {
  try {
    // Alpha Vantage使用外汇API获取XAU/USD数据
    const response = await axios.get(ALPHAVANTAGE_BASE_URL, {
      params: {
        function: 'FX_DAILY',
        from_symbol: 'XAU',
        to_symbol: 'USD',
        apikey: ALPHAVANTAGE_KEY,
        outputsize: 'compact' // 获取最近100天数据
      },
      timeout: 15000
    });

    const data = response.data;
    
    // 检查API响应
    if (data.Information && data.Information.includes('demo')) {
      throw new Error('Alpha Vantage demo key limitation');
    }
    
    if (data.Error || !data['Time Series FX (Daily)']) {
      throw new Error('Invalid Alpha Vantage response');
    }

    const timeSeries = data['Time Series FX (Daily)'];
    const results: CandlestickData[] = [];
    
    // 获取汇率（如果需要转换为人民币）
    let exchangeRate = 1;
    if (currency === 'CNY') {
      try {
        const coinbaseResponse = await axios.get(COINBASE_API_URL, { timeout: 5000 });
        exchangeRate = parseFloat(coinbaseResponse.data.data.rates.CNY || '7.2');
      } catch (error) {
        console.warn('获取汇率失败，使用默认汇率7.2');
        exchangeRate = 7.2;
      }
    }

    // 转换数据格式
    Object.entries(timeSeries).forEach(([date, values]: [string, any]) => {
      const timestamp = new Date(date).getTime() / 1000;
      
      let open = parseFloat(values['1. open']);
      let high = parseFloat(values['2. high']);
      let low = parseFloat(values['3. low']);
      let close = parseFloat(values['4. close']);
      
      // 如果是人民币，转换单位
      if (currency === 'CNY') {
        open = (open * exchangeRate) / OUNCE_TO_GRAM;
        high = (high * exchangeRate) / OUNCE_TO_GRAM;
        low = (low * exchangeRate) / OUNCE_TO_GRAM;
        close = (close * exchangeRate) / OUNCE_TO_GRAM;
      }
      
      results.push({
        time: timestamp,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: 0
      });
    });

    // 按时间排序
    results.sort((a, b) => a.time - b.time);
    
    console.log(`Alpha Vantage获取到${results.length}条${currency}历史数据`);
    return results;
    
  } catch (error) {
    console.error('Alpha Vantage历史数据获取失败:', error);
    throw error;
  }
};

// 生成日期范围
const generateDateRange = (days: number): string[] => {
  const dates: string[] = [];
  const now = new Date();
  
  for (let i = days; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // 跳过周末（GoldAPI.io在周末可能没有数据）
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD格式
    }
  }
  
  return dates;
};

// 备用API获取黄金价格 - 使用Coinbase免费API
const fetchBackupGoldPrice = async (currency: 'USD' | 'CNY' = 'USD'): Promise<{ price: number; high: number; low: number; change: number; changePercent: number }> => {
  try {
    const response = await axios.get(COINBASE_API_URL, { timeout: 10000 });
    const data = response.data;
    
    if (!data || !data.data || !data.data.rates) {
      throw new Error('Backup API: Invalid response');
    }

    const rates = data.data.rates;
    
    // Coinbase返回的XAU是1美元能买多少盎司黄金，我们需要取倒数得到1盎司黄金的美元价格
    const xauRate = parseFloat(rates.XAU);
    if (!xauRate || xauRate === 0) {
      throw new Error('No XAU rate found');
    }
    
    const usdPerOunce = 1 / xauRate; // 美元/盎司
    let price = usdPerOunce;
    let high = price * 1.01; // 估算当日高点
    let low = price * 0.99;  // 估算当日低点
    let change = 0; // Coinbase API不提供变化数据
    let changePercent = 0;

    // 如果需要人民币价格
    if (currency === 'CNY') {
      // 获取美元到人民币汇率
      const cnyRate = parseFloat(rates.CNY || '7.2');
      price = (price * cnyRate) / OUNCE_TO_GRAM; // 转换为CNY/克
      high = (high * cnyRate) / OUNCE_TO_GRAM;
      low = (low * cnyRate) / OUNCE_TO_GRAM;
      
      console.log(`备用API - CNY价格: ${price.toFixed(2)} CNY/克 (基于汇率: ${cnyRate})`);
    } else {
      console.log(`备用API - USD价格: ${price.toFixed(2)} USD/盎司`);
    }

    return { price, high, low, change, changePercent };
  } catch (error) {
    console.error('备用API获取失败:', error);
    throw error;
  }
};

// 获取真实的黄金价格 (直接从API获取指定货币)
const fetchRealGoldPrice = async (currency: 'USD' | 'CNY' = 'USD'): Promise<{ price: number; high: number; low: number; change: number; changePercent: number }> => {
  try {
    // 首先尝试GoldAPI.io
    const symbol = currency === 'USD' ? 'XAU/USD' : 'XAU/CNY';
    
    const response = await axios.get(`${GOLDAPI_BASE_URL}/${symbol}`, {
      headers: {
        'x-access-token': GOLDAPI_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const data = response.data;
    
    // 检查是否是配额错误
    if (data.error && data.error.includes('quota exceeded')) {
      console.warn('GoldAPI.io配额用完，使用备用API');
      return await fetchBackupGoldPrice(currency);
    }
    
    if (!data || !data.price) {
      throw new Error('Invalid API response');
    }

    let price = data.price;
    let high = data.high_price || data.price * 1.01;
    let low = data.low_price || data.price * 0.99;
    let change = data.ch || 0;
    
    // 如果是人民币，API返回的是人民币/盎司，需要转换为人民币/克
    if (currency === 'CNY') {
      price = price / OUNCE_TO_GRAM;
      high = high / OUNCE_TO_GRAM;
      low = low / OUNCE_TO_GRAM;
      change = change / OUNCE_TO_GRAM;
      
      console.log(`GoldAPI - CNY价格转换: ${data.price} CNY/盎司 -> ${price.toFixed(2)} CNY/克`);
    }
    
    return {
      price: price,
      high: high,
      low: low,
      change: change,
      changePercent: data.chp || 0
    };
  } catch (error) {
    console.warn('GoldAPI.io获取失败，尝试备用API:', (error as Error).message || error);
    return await fetchBackupGoldPrice(currency);
  }
};

export const fetchGoldPrice = async (currency: 'USD' | 'CNY' = 'USD'): Promise<GoldPrice | null> => {
  try {
    // 直接获取指定货币的黄金价格
    const goldData = await fetchRealGoldPrice(currency);
    
    console.log(`${currency}黄金价格:`, goldData);
    
    return {
      price: Number(goldData.price.toFixed(2)),
      currency: currency,
      timestamp: Date.now(),
      change: Number(goldData.change.toFixed(2)),
      changePercent: Number(goldData.changePercent.toFixed(2)),
      high24h: Number(goldData.high.toFixed(2)),
      low24h: Number(goldData.low.toFixed(2)),
      volume: 0 // 不再使用模拟成交量数据
    };
  } catch (error) {
    console.error(`获取${currency}黄金价格失败:`, error);
    return null; // 返回null表示数据不可用
  }
};

export const fetchHistoricalData = async (days: number = 30, currency: 'USD' | 'CNY' = 'USD'): Promise<CandlestickData[]> => {
  try {
    console.log(`开始获取${days}天的${currency}历史数据...`);
    
    // 首先尝试GoldAPI.io的历史数据
    try {
      // 生成日期范围（排除周末）
      const dates = generateDateRange(days);
      console.log(`尝试从GoldAPI.io获取${dates.length}个交易日的数据`);
      
      // 并发获取历史数据（限制并发数量避免API限制）
      const batchSize = 5; // 每批5个请求
      const results: CandlestickData[] = [];
      
      for (let i = 0; i < dates.length; i += batchSize) {
        const batch = dates.slice(i, i + batchSize);
        const batchPromises = batch.map(date => fetchGoldAPIHistoricalData(date, currency));
        
        try {
          const batchResults = await Promise.all(batchPromises);
          const validResults = batchResults.filter(result => result !== null) as CandlestickData[];
          results.push(...validResults);
          
          // 添加延迟避免API限制
          if (i + batchSize < dates.length) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒延迟
          }
        } catch (error) {
          console.error(`GoldAPI.io批次${i}-${i + batchSize}获取失败:`, error);
          // 如果是配额错误，停止获取并尝试备用API
          if ((error as Error).message.includes('quota exceeded')) {
            console.warn('GoldAPI.io配额用完，切换到Alpha Vantage');
            throw new Error('GoldAPI quota exceeded');
          }
        }
      }
      
      // 按时间排序
      results.sort((a, b) => a.time - b.time);
      
      if (results.length > 0) {
        console.log(`GoldAPI.io成功获取${results.length}条历史数据`);
        return results;
      } else {
        throw new Error('GoldAPI.io未返回有效数据');
      }
      
    } catch (goldApiError) {
      console.warn('GoldAPI.io获取失败，尝试Alpha Vantage备用API:', (goldApiError as Error).message);
      
      // 尝试Alpha Vantage作为备用
      try {
        const alphaVantageResults = await fetchAlphaVantageHistoricalData(currency);
        
        if (alphaVantageResults.length > 0) {
          // 如果请求的天数少于返回的数据，截取最近的数据
          const limitedResults = alphaVantageResults.slice(-days);
          console.log(`Alpha Vantage备用API成功获取${limitedResults.length}条历史数据`);
          return limitedResults;
        } else {
          throw new Error('Alpha Vantage未返回有效数据');
        }
        
      } catch (alphaVantageError) {
        console.error('Alpha Vantage备用API也失败:', (alphaVantageError as Error).message);
        throw alphaVantageError;
      }
    }
    
  } catch (error) {
    console.error('所有历史数据API都失败:', error);
    
    // 提供详细的错误信息
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('quota exceeded')) {
      console.warn('API配额限制 - 需要升级API计划或等待配额重置');
    } else if (errorMessage.includes('demo')) {
      console.warn('需要有效的API密钥 - 请在环境变量中设置VITE_ALPHAVANTAGE_KEY');
    } else {
      console.warn('网络或API服务问题 - 请稍后重试');
    }
    
    return []; // 返回空数组表示数据不可用
  }
};

export const fetchRealTimeUpdates = async (currency: 'USD' | 'CNY' = 'USD'): Promise<GoldPrice | null> => {
  return fetchGoldPrice(currency);
}; 