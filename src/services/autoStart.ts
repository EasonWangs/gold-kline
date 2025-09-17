import { startScheduler } from './schedulerService';

/**
 * 自动启动钉钉推送服务
 * 在应用加载时自动调用
 */
export const initializeNotificationService = (): void => {
  try {
    console.log('🚀 初始化钉钉推送服务...');

    // 自动启动调度器
    startScheduler();

    console.log('✅ 钉钉推送服务初始化完成');
  } catch (error) {
    console.error('❌ 钉钉推送服务初始化失败:', error);
  }
};