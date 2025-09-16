<template>
  <div class="chart-container p-6">
    <!-- 图表头部 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <component :is="MetalIcon" :class="`w-6 h-6 ${metalColor}`" />
        <div>
          <h2 class="text-xl font-semibold text-white">{{ metalName }}价格走势</h2>
          <p class="text-sm text-slate-400">{{ currencyInfo.unit }}</p>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <!-- 时间周期选择 -->
        <div class="flex space-x-1 bg-slate-800 rounded-lg p-1">
          <button
            v-for="tf in timeframes"
            :key="tf.value"
            @click="timeframe = tf.value"
            :class="[
              'px-3 py-1 text-sm rounded transition-colors',
              timeframe === tf.value
                ? (metal === 'gold' ? 'bg-yellow-500 text-white' : 'bg-gray-400 text-white')
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            ]"
          >
            {{ tf.label }}
          </button>
        </div>

        <!-- 刷新按钮 -->
        <button
          @click="refreshChart"
          :disabled="chartLoading"
          class="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw :class="`w-4 h-4 text-slate-400 ${chartLoading ? 'animate-spin' : ''}`" />
        </button>
      </div>
    </div>

    <!-- 图表容器 -->
    <div class="relative">
      <!-- 加载状态 -->
      <div v-if="loading || chartLoading" class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
        <div class="flex items-center space-x-3">
          <RefreshCw class="w-6 h-6 text-gold-400 animate-spin" />
          <span class="text-white">加载中...</span>
        </div>
      </div>

      <!-- 无数据提示 -->
      <div v-if="!loading && !chartLoading && !hasData" class="absolute inset-0 flex items-center justify-center z-10 rounded-lg">
        <div class="text-center">
          <AlertCircle class="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-white mb-2">{{ metalName }}历史数据暂不可用</h3>
          <p class="text-slate-400 text-sm mb-4 max-w-md">
            可能原因：API配额限制、网络问题或周末/节假日无交易数据
          </p>
          <p class="text-slate-500 text-xs mb-4">
            请查看上方的实时价格信息获取当前{{ metalName }}价格
          </p>
          <button
            @click="refreshChart"
            :class="[
              'px-4 py-2 text-white text-sm rounded-lg transition-colors',
              metal === 'gold' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 hover:bg-gray-500'
            ]"
          >
            重试加载{{ metalName }}历史数据
          </button>
        </div>
      </div>

      <!-- 悬停提示框 -->
      <div
        v-if="tooltipData && hasData"
        class="absolute pointer-events-none z-20 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg p-3 text-sm text-white shadow-lg"
        :style="{ left: tooltipData.x + 'px', top: tooltipData.y + 'px' }"
      >
        <div class="font-medium mb-2">{{ tooltipData.date }}</div>
        <div class="space-y-1">
          <div class="flex justify-between space-x-4">
            <span class="text-slate-400">开盘:</span>
            <span>{{ currencyInfo.symbol }}{{ tooltipData.open }}</span>
          </div>
          <div class="flex justify-between space-x-4">
            <span class="text-green-400">最高:</span>
            <span class="text-green-400">{{ currencyInfo.symbol }}{{ tooltipData.high }}</span>
          </div>
          <div class="flex justify-between space-x-4">
            <span class="text-red-400">最低:</span>
            <span class="text-red-400">{{ currencyInfo.symbol }}{{ tooltipData.low }}</span>
          </div>
          <div class="flex justify-between space-x-4">
            <span class="text-slate-400">收盘:</span>
            <span>{{ currencyInfo.symbol }}{{ tooltipData.close }}</span>
          </div>
        </div>
      </div>

      <div
        ref="chartContainer"
        class="w-full h-[500px] bg-slate-900/30 rounded-lg"
      />
    </div>

    <!-- 图表说明 -->
    <div class="mt-4 flex items-center justify-between text-sm text-slate-400">
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-green-500 rounded"></div>
          <span>上涨</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-red-500 rounded"></div>
          <span>下跌</span>
        </div>
      </div>

      <div class="text-xs">
        {{
          hasData
            ? `数据来源: AKTools ${metalName}真实历史数据 (${currencyInfo.unit})`
            : `当前仅显示${metalName}实时价格数据 - 历史数据需要API配额支持`
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { createChart, type IChartApi, type ISeriesApi, type CandlestickData as LightweightCandlestickData, type Time } from 'lightweight-charts'
import { fetchHistoricalData, getMetalName } from '../services/metalApi'
import type { CandlestickData, MetalType } from '../types/gold'
import { RefreshCw, AlertCircle, Coins, Gem } from 'lucide-vue-next'

const props = defineProps<{
  loading: boolean
  metal: MetalType
}>()

const chartContainer = ref<HTMLDivElement>()
const chartLoading = ref(true)
const hasData = ref(false)
const timeframe = ref('1D')
const tooltipData = ref<{
  x: number
  y: number
  date: string
  open: string
  high: string
  low: string
  close: string
} | null>(null)

let chart: IChartApi | null = null
let candlestickSeries: ISeriesApi<'Candlestick'> | null = null

const timeframes = [
  { label: '1分钟', value: '1m' },
  { label: '5分钟', value: '5m' },
  { label: '15分钟', value: '15m' },
  { label: '1小时', value: '1h' },
  { label: '1天', value: '1D' },
  { label: '1周', value: '1W' },
]

const currencyInfo = computed(() => ({
  symbol: '¥',
  unit: props.metal === 'gold' ? '人民币/克' : '人民币/千克'
}))

const MetalIcon = computed(() => props.metal === 'gold' ? Coins : Gem)
const metalName = computed(() => getMetalName(props.metal))
const metalColor = computed(() => props.metal === 'gold' ? 'text-yellow-400' : 'text-gray-300')

const initChart = async () => {
  if (!chartContainer.value) return

  // 创建图表
  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: 500,
    layout: {
      background: { color: 'transparent' },
      textColor: '#d1d5db',
    },
    grid: {
      vertLines: { color: '#374151' },
      horzLines: { color: '#374151' },
    },
    crosshair: {
      mode: 1,
    },
    rightPriceScale: {
      borderColor: '#4b5563',
    },
    timeScale: {
      borderColor: '#4b5563',
      timeVisible: true,
      secondsVisible: false,
      barSpacing: 8,
      rightOffset: 12,
      fixLeftEdge: false,
      fixRightEdge: false,
      lockVisibleTimeRangeOnResize: true,
    },
  })

  // 创建K线系列
  candlestickSeries = chart.addCandlestickSeries({
    upColor: '#10b981',
    downColor: '#ef4444',
    borderDownColor: '#ef4444',
    borderUpColor: '#10b981',
    wickDownColor: '#ef4444',
    wickUpColor: '#10b981',
  })

  // 添加鼠标悬停事件
  chart.subscribeCrosshairMove((param) => {
    if (!param.point || !param.time || !candlestickSeries) {
      tooltipData.value = null
      return
    }

    const data = param.seriesData.get(candlestickSeries) as any
    if (!data) {
      tooltipData.value = null
      return
    }

    const containerRect = chartContainer.value?.getBoundingClientRect()
    if (!containerRect) return

    tooltipData.value = {
      x: Math.min(param.point.x + 10, containerRect.width - 200),
      y: Math.max(param.point.y - 100, 10),
      date: new Date(param.time as number * 1000).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      open: data.open.toFixed(2),
      high: data.high.toFixed(2),
      low: data.low.toFixed(2),
      close: data.close.toFixed(2)
    }
  })

  // 加载历史数据
  await loadData()

  // 处理窗口大小变化
  const handleResize = () => {
    if (chartContainer.value && chart) {
      chart.applyOptions({
        width: chartContainer.value.clientWidth,
      })
    }
  }

  window.addEventListener('resize', handleResize)

  // 清理函数
  return () => {
    window.removeEventListener('resize', handleResize)
    tooltipData.value = null
    if (chart) {
      chart.remove()
      chart = null
      candlestickSeries = null
    }
  }
}

const fillMissingDates = (data: CandlestickData[]): LightweightCandlestickData[] => {
  if (data.length === 0) return []

  // 先过滤掉未来日期的数据
  const today = Math.floor(Date.now() / 1000 / 86400) * 86400
  const filteredData = data.filter(item => {
    const dayTimestamp = Math.floor(item.time / 86400) * 86400
    return dayTimestamp <= today
  })

  if (filteredData.length === 0) return []

  const sortedData = [...filteredData].sort((a, b) => a.time - b.time)
  const result: LightweightCandlestickData[] = []

  const startTime = sortedData[0].time
  const endTime = sortedData[sortedData.length - 1].time

  // 创建数据映射以便快速查找
  const dataMap = new Map<number, CandlestickData>()
  sortedData.forEach(item => {
    const dayTimestamp = Math.floor(item.time / 86400) * 86400
    dataMap.set(dayTimestamp, item)
  })

  // 生成连续的日期序列，从开始到结束（都不超过今天）
  let currentTime = Math.floor(startTime / 86400) * 86400
  const endDayTime = Math.floor(endTime / 86400) * 86400

  while (currentTime <= endDayTime) {
    const existingData = dataMap.get(currentTime)

    if (existingData) {
      // 有交易数据
      result.push({
        time: existingData.time as Time,
        open: existingData.open,
        high: existingData.high,
        low: existingData.low,
        close: existingData.close,
      })
    } else {
      // 无交易数据，使用前一个交易日的收盘价
      const prevData = result[result.length - 1]
      if (prevData) {
        result.push({
          time: currentTime as Time,
          open: prevData.close,
          high: prevData.close,
          low: prevData.close,
          close: prevData.close,
        })
      }
    }

    currentTime += 86400 // 下一天
  }

  return result
}

const loadData = async () => {
  try {
    chartLoading.value = true
    const data = await fetchHistoricalData(props.metal, 30)

    if (data.length === 0) {
      console.warn('历史数据不可用')
      hasData.value = false
      return
    }

    // 填充缺失日期的数据
    const chartData = fillMissingDates(data)

    if (candlestickSeries && chart) {
      candlestickSeries.setData(chartData)
      chart.timeScale().fitContent()
      hasData.value = true
    }
  } catch (error) {
    console.error('加载图表数据失败:', error)
    hasData.value = false
  } finally {
    chartLoading.value = false
  }
}

const refreshChart = async () => {
  if (!candlestickSeries) return

  try {
    chartLoading.value = true
    const data = await fetchHistoricalData(props.metal, 30)

    if (data.length === 0) {
      console.warn('历史数据不可用')
      hasData.value = false
      return
    }

    // 填充缺失日期的数据
    const chartData = fillMissingDates(data)

    candlestickSeries.setData(chartData)
    if (chart) {
      chart.timeScale().fitContent()
    }
    hasData.value = true
  } catch (error) {
    console.error('刷新图表数据失败:', error)
    hasData.value = false
  } finally {
    chartLoading.value = false
  }
}

watch(() => props.metal, async () => {
  tooltipData.value = null
  if (chart) {
    chart.remove()
    chart = null
    candlestickSeries = null
  }
  await nextTick()
  await initChart()
})

onMounted(async () => {
  await nextTick()
  const cleanup = await initChart()

  onUnmounted(() => {
    if (cleanup) cleanup()
  })
})
</script>