import { sendGoldOpeningPrice, sendGoldClosingPrice, shouldSendNotification, isTradingDay } from './dingTalkService';

// 调度器状态
let isSchedulerRunning = false;
let schedulerInterval: NodeJS.Timeout | null = null;

/**
 * 启动调度器
 */
export const startScheduler = (): void => {
  if (isSchedulerRunning) {
    console.log('⚠️ 调度器已在运行中');
    return;
  }

  console.log('🚀 启动黄金价格推送调度器...');
  isSchedulerRunning = true;

  // 每分钟检查一次是否需要推送
  schedulerInterval = setInterval(async () => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Shanghai'
      });

      // 检查是否为交易日
      if (!isTradingDay()) {
        // 只在非交易日的第一次检查时输出日志
        if (now.getHours() === 9 && now.getMinutes() === 0) {
          console.log(`📅 ${now.toLocaleDateString('zh-CN')} 非交易日，跳过推送`);
        }
        return;
      }

      // 检查开盘价推送时间 (09:00)
      if (shouldSendNotification('opening')) {
        console.log(`🌅 ${timeString} - 推送黄金开盘价`);
        const success = await sendGoldOpeningPrice();

        if (success) {
          console.log('✅ 黄金开盘价推送成功');
        } else {
          console.error('❌ 黄金开盘价推送失败');
        }
      }

      // 检查收盘价推送时间 (16:00)
      if (shouldSendNotification('closing')) {
        console.log(`🌆 ${timeString} - 推送黄金收盘价`);
        const success = await sendGoldClosingPrice();

        if (success) {
          console.log('✅ 黄金收盘价推送成功');
        } else {
          console.error('❌ 黄金收盘价推送失败');
        }
      }

    } catch (error) {
      console.error('❌ 调度器执行异常:', error);
    }
  }, 60000); // 每分钟检查一次

  console.log('⏰ 调度器已启动，将在每个交易日的 09:00 和 16:00 自动推送黄金价格');
};

/**
 * 停止调度器
 */
export const stopScheduler = (): void => {
  if (!isSchedulerRunning) {
    console.log('⚠️ 调度器未运行');
    return;
  }

  console.log('🛑 停止黄金价格推送调度器...');

  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }

  isSchedulerRunning = false;
  console.log('✅ 调度器已停止');
};

/**
 * 获取调度器状态
 */
export const getSchedulerStatus = (): {
  isRunning: boolean;
  nextOpeningTime: string;
  nextClosingTime: string;
  isTradingDay: boolean;
} => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 计算下一个开盘时间
  const nextOpening = new Date(today);
  nextOpening.setHours(9, 0, 0, 0);

  // 如果今天的开盘时间已过，则计算下一个交易日
  if (now > nextOpening || !isTradingDay()) {
    nextOpening.setDate(nextOpening.getDate() + 1);
    // 如果是周六，跳到下周一
    if (nextOpening.getDay() === 6) {
      nextOpening.setDate(nextOpening.getDate() + 2);
    }
    // 如果是周日，跳到下周一
    if (nextOpening.getDay() === 0) {
      nextOpening.setDate(nextOpening.getDate() + 1);
    }
  }

  // 计算下一个收盘时间
  const nextClosing = new Date(today);
  nextClosing.setHours(16, 0, 0, 0);

  // 如果今天的收盘时间已过，则计算下一个交易日
  if (now > nextClosing || !isTradingDay()) {
    nextClosing.setDate(nextClosing.getDate() + 1);
    // 如果是周六，跳到下周一
    if (nextClosing.getDay() === 6) {
      nextClosing.setDate(nextClosing.getDate() + 2);
    }
    // 如果是周日，跳到下周一
    if (nextClosing.getDay() === 0) {
      nextClosing.setDate(nextClosing.getDate() + 1);
    }
  }

  return {
    isRunning: isSchedulerRunning,
    nextOpeningTime: nextOpening.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai'
    }),
    nextClosingTime: nextClosing.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai'
    }),
    isTradingDay: isTradingDay()
  };
};

/**
 * 手动触发开盘价推送（用于测试）
 */
export const triggerOpeningPriceNotification = async (): Promise<boolean> => {
  console.log('🧪 手动触发开盘价推送...');
  return await sendGoldOpeningPrice();
};

/**
 * 手动触发收盘价推送（用于测试）
 */
export const triggerClosingPriceNotification = async (): Promise<boolean> => {
  console.log('🧪 手动触发收盘价推送...');
  return await sendGoldClosingPrice();
};