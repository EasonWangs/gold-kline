import axios from 'axios';
import { fetchRealMetalPrice, getMetalName } from './metalApi';
import type { MetalType } from '../types/gold';

// 钉钉 Webhook 配置管理
const WEBHOOK_STORAGE_KEY = 'dingtalk_webhook_url';

/**
 * 获取钉钉 Webhook URL
 */
export const getDingTalkWebhookUrl = (): string | null => {
  return localStorage.getItem(WEBHOOK_STORAGE_KEY);
};

/**
 * 设置钉钉 Webhook URL
 */
export const setDingTalkWebhookUrl = (url: string): void => {
  localStorage.setItem(WEBHOOK_STORAGE_KEY, url);
};

/**
 * 验证 Webhook URL 格式
 */
export const validateWebhookUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'oapi.dingtalk.com' &&
           urlObj.pathname === '/robot/send' &&
           urlObj.searchParams.has('access_token');
  } catch {
    return false;
  }
};

// 钉钉消息类型
interface DingTalkMessage {
  msgtype: 'text' | 'markdown';
  text?: {
    content: string;
  };
  markdown?: {
    title: string;
    text: string;
  };
  at?: {
    atMobiles?: string[];
    isAtAll?: boolean;
  };
}

/**
 * 发送钉钉消息
 */
const sendDingTalkMessage = async (message: DingTalkMessage): Promise<boolean> => {
  try {
    const webhookUrl = getDingTalkWebhookUrl();

    if (!webhookUrl) {
      console.error('❌ 未配置钉钉 Webhook URL');
      return false;
    }

    if (!validateWebhookUrl(webhookUrl)) {
      console.error('❌ 钉钉 Webhook URL 格式不正确');
      return false;
    }

    console.log('📢 发送钉钉消息:', message);

    const response = await axios.post(webhookUrl, message, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data.errcode === 0) {
      console.log('✅ 钉钉消息发送成功');
      return true;
    } else {
      console.error('❌ 钉钉消息发送失败:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ 钉钉消息发送异常:', error);
    return false;
  }
};

/**
 * 格式化价格显示
 */
const formatPrice = (price: number, metal: MetalType): string => {
  const unit = metal === 'gold' ? '元/克' : '元/千克';
  return `¥${price.toFixed(2)} ${unit}`;
};

/**
 * 格式化涨跌信息
 */
const formatChange = (change: number, changePercent: number): string => {
  const symbol = change >= 0 ? '+' : '';
  const arrow = change >= 0 ? '📈' : '📉';
  return `${arrow} ${symbol}¥${change.toFixed(2)} (${symbol}${changePercent.toFixed(2)}%)`;
};

/**
 * 获取当前时间字符串
 */
const getCurrentTimeString = (): string => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Shanghai'
  });
};

/**
 * 推送黄金开盘价（每日 9:00）
 */
export const sendGoldOpeningPrice = async (): Promise<boolean> => {
  try {
    console.log('🌅 开始推送黄金开盘价...');

    const goldData = await fetchRealMetalPrice('gold');
    if (!goldData) {
      console.error('❌ 无法获取黄金开盘价数据');
      return false;
    }

    const metalName = getMetalName('gold');
    const currentTime = getCurrentTimeString();

    // 构造开盘价消息
    const message: DingTalkMessage = {
      msgtype: 'markdown',
      markdown: {
        title: `黄金开盘价提醒`,
        text: `# 🌅 黄金开盘价提醒

**关键词：** 黄金

**时间：** ${currentTime}

**开盘价：** ${formatPrice(goldData.open, 'gold')}

**当前价：** ${formatPrice(goldData.price, 'gold')}

**今日变化：** ${formatChange(goldData.change, goldData.changePercent)}

**今日最高：** ${formatPrice(goldData.high, 'gold')}

**今日最低：** ${formatPrice(goldData.low, 'gold')}

---
*数据来源：上海金交所 Au99.99*
*推送时间：每个交易日 09:00*
*黄金价格实时监控提醒*`
      }
    };

    return await sendDingTalkMessage(message);
  } catch (error) {
    console.error('❌ 推送黄金开盘价失败:', error);
    return false;
  }
};

/**
 * 推送黄金收盘价（每日 16:00）
 */
export const sendGoldClosingPrice = async (): Promise<boolean> => {
  try {
    console.log('🌆 开始推送黄金收盘价...');

    const goldData = await fetchRealMetalPrice('gold');
    if (!goldData) {
      console.error('❌ 无法获取黄金收盘价数据');
      return false;
    }

    const metalName = getMetalName('gold');
    const currentTime = getCurrentTimeString();

    // 构造收盘价消息
    const message: DingTalkMessage = {
      msgtype: 'markdown',
      markdown: {
        title: `黄金收盘价总结`,
        text: `# 🌆 黄金收盘价总结

**关键词：** 黄金

**时间：** ${currentTime}

**收盘价：** ${formatPrice(goldData.price, 'gold')}

**开盘价：** ${formatPrice(goldData.open, 'gold')}

**全日涨跌：** ${formatChange(goldData.change, goldData.changePercent)}

**今日最高：** ${formatPrice(goldData.high, 'gold')}

**今日最低：** ${formatPrice(goldData.low, 'gold')}

**日振幅：** ${(((goldData.high - goldData.low) / goldData.open) * 100).toFixed(2)}%

---
*数据来源：上海金交所 Au99.99*
*推送时间：每个交易日 16:00*
*黄金价格实时监控提醒*`
      }
    };

    return await sendDingTalkMessage(message);
  } catch (error) {
    console.error('❌ 推送黄金收盘价失败:', error);
    return false;
  }
};

/**
 * 测试钉钉推送功能
 */
export const testDingTalkNotification = async (): Promise<boolean> => {
  try {
    console.log('🧪 测试钉钉推送功能...');

    const currentTime = getCurrentTimeString();

    const message: DingTalkMessage = {
      msgtype: 'text',
      text: {
        content: `🧪 黄金推送测试消息\n\n关键词：黄金\n\n测试时间：${currentTime}\n\n黄金价格推送服务已启动，将在每个交易日的 09:00 和 16:00 自动推送黄金开盘价和收盘价信息。\n\n黄金价格实时监控提醒功能测试完成。`
      }
    };

    return await sendDingTalkMessage(message);
  } catch (error) {
    console.error('❌ 测试钉钉推送失败:', error);
    return false;
  }
};

/**
 * 检查是否为交易日
 */
export const isTradingDay = (): boolean => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六

  // 周一到周五为交易日
  return dayOfWeek >= 1 && dayOfWeek <= 5;
};

/**
 * 检查当前是否为推送时间
 */
export const shouldSendNotification = (type: 'opening' | 'closing'): boolean => {
  if (!isTradingDay()) {
    return false;
  }

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  if (type === 'opening') {
    // 9:00 推送开盘价
    return hour === 9 && minute === 0;
  } else if (type === 'closing') {
    // 16:00 推送收盘价
    return hour === 16 && minute === 0;
  }

  return false;
};