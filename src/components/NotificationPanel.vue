<template>
  <div class="chart-container p-6 space-y-6">
    <!-- 头部 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <Bell class="w-6 h-6 text-blue-400" />
        <div>
          <h2 class="text-xl font-semibold text-white">钉钉推送服务</h2>
          <p class="text-sm text-slate-400">黄金价格自动推送到钉钉群</p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <div :class="[
          'flex items-center space-x-2 px-3 py-1 rounded-full text-sm',
          schedulerStatus.isRunning
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        ]">
          <div :class="[
            'w-2 h-2 rounded-full',
            schedulerStatus.isRunning ? 'bg-green-400' : 'bg-red-400'
          ]"></div>
          <span>{{ schedulerStatus.isRunning ? '运行中' : '已停止' }}</span>
        </div>
      </div>
    </div>

    <!-- 状态信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 当前状态 -->
      <div class="bg-slate-800/30 p-4 rounded-lg">
        <h3 class="text-white font-medium mb-3 flex items-center">
          <Clock class="w-4 h-4 mr-2 text-blue-400" />
          当前状态
        </h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-400">服务状态:</span>
            <span :class="schedulerStatus.isRunning ? 'text-green-400' : 'text-red-400'">
              {{ schedulerStatus.isRunning ? '运行中' : '已停止' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">今日交易:</span>
            <span :class="schedulerStatus.isTradingDay ? 'text-green-400' : 'text-orange-400'">
              {{ schedulerStatus.isTradingDay ? '交易日' : '非交易日' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">当前时间:</span>
            <span class="text-white">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- 推送计划 -->
      <div class="bg-slate-800/30 p-4 rounded-lg">
        <h3 class="text-white font-medium mb-3 flex items-center">
          <Calendar class="w-4 h-4 mr-2 text-yellow-400" />
          推送计划
        </h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-400">下次开盘推送:</span>
            <span class="text-white">{{ schedulerStatus.nextOpeningTime }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">下次收盘推送:</span>
            <span class="text-white">{{ schedulerStatus.nextClosingTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 推送设置 -->
    <div class="bg-slate-800/30 p-4 rounded-lg">
      <h3 class="text-white font-medium mb-4 flex items-center">
        <Settings class="w-4 h-4 mr-2 text-purple-400" />
        推送设置
      </h3>

      <div class="space-y-4">
        <!-- 推送时间说明 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-700/30 p-3 rounded-lg">
            <div class="flex items-center space-x-2 mb-2">
              <Sunrise class="w-4 h-4 text-orange-400" />
              <span class="text-white font-medium">开盘价推送</span>
            </div>
            <p class="text-sm text-slate-400">每个交易日 09:00 自动推送黄金开盘价</p>
          </div>

          <div class="bg-slate-700/30 p-3 rounded-lg">
            <div class="flex items-center space-x-2 mb-2">
              <Sunset class="w-4 h-4 text-blue-400" />
              <span class="text-white font-medium">收盘价推送</span>
            </div>
            <p class="text-sm text-slate-400">每个交易日 16:00 自动推送黄金收盘价</p>
          </div>
        </div>

        <!-- 钉钉配置 -->
        <div class="bg-slate-700/30 p-3 rounded-lg">
          <div class="flex items-center space-x-2 mb-3">
            <ExternalLink class="w-4 h-4 text-green-400" />
            <span class="text-white font-medium">钉钉 Webhook 配置</span>
          </div>

          <div class="space-y-3">
            <!-- URL 输入框 -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                Webhook URL
              </label>
              <div class="flex space-x-2">
                <input
                  v-model="webhookUrl"
                  type="url"
                  placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
                  class="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                  @blur="validateAndSaveWebhookUrl"
                />
                <button
                  @click="validateAndSaveWebhookUrl"
                  :disabled="loading"
                  class="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                  保存
                </button>
              </div>
            </div>

            <!-- 验证状态 -->
            <div v-if="webhookValidation.message" :class="[
              'flex items-center space-x-2 text-sm',
              webhookValidation.isValid ? 'text-green-400' : 'text-red-400'
            ]">
              <component :is="webhookValidation.isValid ? CheckCircle : AlertCircle" class="w-4 h-4" />
              <span>{{ webhookValidation.message }}</span>
            </div>

            <!-- 当前配置状态 -->
            <div class="text-xs text-slate-500">
              {{ webhookUrl ? `当前配置: ${webhookUrl.substring(0, 50)}...` : '未配置 Webhook URL' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="flex flex-wrap gap-3">
      <button
        @click="toggleScheduler"
        :disabled="loading"
        :class="[
          'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50',
          schedulerStatus.isRunning
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        ]"
      >
        <component :is="schedulerStatus.isRunning ? StopCircle : PlayCircle" class="w-4 h-4" />
        <span>{{ schedulerStatus.isRunning ? '停止服务' : '启动服务' }}</span>
      </button>

      <button
        @click="testNotification"
        :disabled="loading"
        class="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <TestTube class="w-4 h-4" />
        <span>测试推送</span>
      </button>

      <button
        @click="triggerOpening"
        :disabled="loading"
        class="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <Sunrise class="w-4 h-4" />
        <span>推送开盘价</span>
      </button>

      <button
        @click="triggerClosing"
        :disabled="loading"
        class="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <Sunset class="w-4 h-4" />
        <span>推送收盘价</span>
      </button>
    </div>

    <!-- 操作结果提示 -->
    <div v-if="message" :class="[
      'p-4 rounded-lg border',
      message.type === 'success'
        ? 'bg-green-500/20 border-green-500/30 text-green-400'
        : 'bg-red-500/20 border-red-500/30 text-red-400'
    ]">
      <div class="flex items-center space-x-2">
        <component :is="message.type === 'success' ? CheckCircle : AlertCircle" class="w-4 h-4" />
        <span>{{ message.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Bell, Clock, Calendar, Settings, ExternalLink, PlayCircle, StopCircle,
  TestTube, Sunrise, Sunset, CheckCircle, AlertCircle
} from 'lucide-vue-next'
import {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  triggerOpeningPriceNotification,
  triggerClosingPriceNotification
} from '../services/schedulerService'
import {
  testDingTalkNotification,
  getDingTalkWebhookUrl,
  setDingTalkWebhookUrl,
  validateWebhookUrl
} from '../services/dingTalkService'

const loading = ref(false)
const currentTime = ref('')
const webhookUrl = ref('')
const webhookValidation = ref<{
  isValid: boolean
  message: string
}>({ isValid: false, message: '' })

const schedulerStatus = ref({
  isRunning: false,
  nextOpeningTime: '',
  nextClosingTime: '',
  isTradingDay: false
})

const message = ref<{
  type: 'success' | 'error'
  text: string
} | null>(null)

// 更新当前时间
const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Shanghai'
  })
}

// 更新调度器状态
const updateSchedulerStatus = () => {
  schedulerStatus.value = getSchedulerStatus()
}

// 显示消息
const showMessage = (type: 'success' | 'error', text: string) => {
  message.value = { type, text }
  setTimeout(() => {
    message.value = null
  }, 3000)
}

// 加载 Webhook URL
const loadWebhookUrl = () => {
  const savedUrl = getDingTalkWebhookUrl()
  if (savedUrl) {
    webhookUrl.value = savedUrl
    webhookValidation.value = {
      isValid: validateWebhookUrl(savedUrl),
      message: validateWebhookUrl(savedUrl) ? 'Webhook URL 格式正确' : 'Webhook URL 格式不正确'
    }
  } else {
    // 设置默认的示例 URL
    webhookUrl.value = ''
    webhookValidation.value = {
      isValid: false,
      message: '请配置您的钉钉 Webhook URL'
    }
  }
}

// 验证并保存 Webhook URL
const validateAndSaveWebhookUrl = () => {
  const url = webhookUrl.value.trim()

  if (!url) {
    webhookValidation.value = {
      isValid: false,
      message: '请输入 Webhook URL'
    }
    return
  }

  const isValid = validateWebhookUrl(url)

  if (isValid) {
    setDingTalkWebhookUrl(url)
    webhookValidation.value = {
      isValid: true,
      message: 'Webhook URL 保存成功'
    }
    showMessage('success', 'Webhook URL 配置成功')
  } else {
    webhookValidation.value = {
      isValid: false,
      message: 'URL 格式不正确，请检查是否为有效的钉钉 Webhook 地址'
    }
  }
}

// 切换调度器状态
const toggleScheduler = async () => {
  loading.value = true
  try {
    if (schedulerStatus.value.isRunning) {
      stopScheduler()
      showMessage('success', '推送服务已停止')
    } else {
      startScheduler()
      showMessage('success', '推送服务已启动')
    }
    updateSchedulerStatus()
  } catch (error) {
    console.error('切换调度器状态失败:', error)
    showMessage('error', '操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 测试推送
const testNotification = async () => {
  loading.value = true
  try {
    const success = await testDingTalkNotification()
    if (success) {
      showMessage('success', '测试消息发送成功')
    } else {
      showMessage('error', '测试消息发送失败')
    }
  } catch (error) {
    console.error('测试推送失败:', error)
    showMessage('error', '测试推送失败')
  } finally {
    loading.value = false
  }
}

// 手动推送开盘价
const triggerOpening = async () => {
  loading.value = true
  try {
    const success = await triggerOpeningPriceNotification()
    if (success) {
      showMessage('success', '开盘价推送成功')
    } else {
      showMessage('error', '开盘价推送失败')
    }
  } catch (error) {
    console.error('推送开盘价失败:', error)
    showMessage('error', '推送开盘价失败')
  } finally {
    loading.value = false
  }
}

// 手动推送收盘价
const triggerClosing = async () => {
  loading.value = true
  try {
    const success = await triggerClosingPriceNotification()
    if (success) {
      showMessage('success', '收盘价推送成功')
    } else {
      showMessage('error', '收盘价推送失败')
    }
  } catch (error) {
    console.error('推送收盘价失败:', error)
    showMessage('error', '推送收盘价失败')
  } finally {
    loading.value = false
  }
}

let timeInterval: NodeJS.Timeout | null = null
let statusInterval: NodeJS.Timeout | null = null

onMounted(() => {
  // 立即更新一次
  updateCurrentTime()
  updateSchedulerStatus()
  loadWebhookUrl()

  // 每秒更新时间
  timeInterval = setInterval(updateCurrentTime, 1000)

  // 每10秒更新状态
  statusInterval = setInterval(updateSchedulerStatus, 10000)

  console.log('📱 钉钉推送管理面板已加载')
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (statusInterval) {
    clearInterval(statusInterval)
  }
})
</script>