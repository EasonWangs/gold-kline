import { ref, computed, watch } from 'vue'
import type { MetalPrice, MetalType, CandlestickData } from '../types/gold'
import { fetchMetalPrice as apifetchMetalPrice, fetchHistoricalData, fetchMinuteKlineData, getMetalName, fetchRealMetalPrice } from '../services/metalApi'

// 全局状态
const currentMetal = ref<MetalType>('gold')
const metalPrice = ref<MetalPrice | null>(null)
const historicalData = ref<CandlestickData[]>([])
const minuteData = ref<CandlestickData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 定时器
let priceUpdateInterval: NodeJS.Timeout | null = null

/**
 * 金属数据管理组合式函数
 */
export function useMetalData() {
  // 计算属性
  const metalName = computed(() => getMetalName(currentMetal.value))

  // 获取实时价格（优化版本，不依赖历史数据）
  const loadMetalPriceEarly = async () => {
    try {
      console.log(`⚡ 提前启动${metalName.value}实时价格请求...`)

      // 直接调用实时价格接口，不依赖历史数据
      const realTimeData = await fetchRealMetalPrice(currentMetal.value)

      // 构造MetalPrice对象
      if (realTimeData) {
        metalPrice.value = {
          price: Number(realTimeData.price.toFixed(2)),
          open: Number(realTimeData.open.toFixed(2)),
          currency: 'CNY',
          timestamp: Date.now(),
          change: Number(realTimeData.change.toFixed(2)),
          changePercent: Number(realTimeData.changePercent.toFixed(2)),
          high24h: Number(realTimeData.high.toFixed(2)),
          low24h: Number(realTimeData.low.toFixed(2)),
          volume: 0,
          metal: currentMetal.value
        }
      }

      console.log(`✅ ${metalName.value}早期价格加载完成`)
    } catch (err) {
      console.error(`Error fetching early ${currentMetal.value} price:`, err)
    }
  }

  // 获取实时价格（使用已有的历史数据计算前一日收盘价）
  const loadMetalPrice = async () => {
    try {
      loading.value = true
      error.value = null

      // 计算前一日收盘价
      let previousClose: number | undefined
      if (historicalData.value.length >= 2) {
        previousClose = historicalData.value[historicalData.value.length - 2].close
        console.log(`📈 使用全局历史数据计算前一日收盘价: ${previousClose.toFixed(2)}`)
      }

      // 直接调用实时价格接口，传入前一日收盘价
      const realTimeData = await fetchRealMetalPrice(currentMetal.value, previousClose)

      // 构造MetalPrice对象
      if (realTimeData) {
        metalPrice.value = {
          price: Number(realTimeData.price.toFixed(2)),
          open: Number(realTimeData.open.toFixed(2)),
          currency: 'CNY',
          timestamp: Date.now(),
          change: Number(realTimeData.change.toFixed(2)),
          changePercent: Number(realTimeData.changePercent.toFixed(2)),
          high24h: Number(realTimeData.high.toFixed(2)),
          low24h: Number(realTimeData.low.toFixed(2)),
          volume: 0,
          metal: currentMetal.value
        }
      }

      console.log(`✅ ${metalName.value}价格更新完成`)
    } catch (err) {
      error.value = `获取${metalName.value}价格失败`
      console.error(`Error fetching ${currentMetal.value} price:`, err)
    } finally {
      loading.value = false
    }
  }

  // 获取历史数据
  const loadHistoricalData = async (days: number = 30) => {
    try {
      console.log(`📊 开始加载${metalName.value}历史数据...`)

      const data = await fetchHistoricalData(currentMetal.value, days)
      historicalData.value = data

      console.log(`✅ ${metalName.value}历史数据加载完成，${data.length}条记录`)
      return data
    } catch (err) {
      console.error(`Error loading historical data for ${currentMetal.value}:`, err)
      historicalData.value = []
      return []
    }
  }

  // 获取分钟数据
  const loadMinuteData = async () => {
    try {
      console.log(`📈 开始加载${metalName.value}分钟数据...`)

      const data = await fetchMinuteKlineData(currentMetal.value)
      minuteData.value = data

      console.log(`✅ ${metalName.value}分钟数据加载完成，${data.length}条记录`)
      return data
    } catch (err) {
      console.error(`Error loading minute data for ${currentMetal.value}:`, err)
      minuteData.value = []
      return []
    }
  }

  // 初始化数据（并行加载：历史数据和价格数据同时进行）
  const initializeData = async () => {
    console.log(`🚀 初始化${metalName.value}数据...`)

    try {
      loading.value = true
      error.value = null

      // 并行启动两个请求：历史数据和实时价格数据
      console.log(`⚡ 并行启动历史数据和实时价格请求...`)

      const [historicalResult, priceResult] = await Promise.allSettled([
        loadHistoricalData(), // 不传递天数参数，使用所有可用数据
        loadMetalPriceEarly() // 新的早期价格加载方法
      ])

      // 检查历史数据结果
      if (historicalResult.status === 'fulfilled') {
        console.log(`✅ ${metalName.value}历史数据加载完成`)

        // 历史数据加载完成后，重新计算价格变化（不发新请求，只更新计算）
        if (priceResult.status === 'fulfilled' && historicalData.value.length >= 2 && metalPrice.value) {
          console.log(`🔄 基于历史数据重新计算价格变化...`)
          const previousClose = historicalData.value[historicalData.value.length - 2].close
          const currentPrice = metalPrice.value.price
          const change = currentPrice - previousClose
          const changePercent = (change / previousClose) * 100

          // 更新价格对象中的变化数据
          metalPrice.value = {
            ...metalPrice.value,
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2))
          }
          console.log(`✅ 价格变化重新计算完成: ${change.toFixed(2)} (${changePercent.toFixed(2)}%)`)
        }
      } else {
        console.error(`❌ ${metalName.value}历史数据加载失败:`, historicalResult.reason)
      }

      // 检查价格数据结果
      if (priceResult.status === 'fulfilled') {
        console.log(`✅ ${metalName.value}实时价格加载完成`)
      } else {
        console.error(`❌ ${metalName.value}实时价格加载失败:`, priceResult.reason)
      }

      console.log(`🎉 ${metalName.value}数据初始化完成`)
    } catch (error) {
      console.error(`❌ ${metalName.value}数据初始化失败:`, error)
    } finally {
      loading.value = false
    }
  }

  // 切换金属类型
  const setCurrentMetal = async (metal: MetalType) => {
    if (currentMetal.value === metal) return

    console.log(`🔄 切换金属类型: ${getMetalName(currentMetal.value)} → ${getMetalName(metal)}`)
    currentMetal.value = metal

    // 重新初始化数据
    await initializeData()
  }

  // 启动定时更新
  const startPriceUpdates = () => {
    stopPriceUpdates() // 确保没有重复的定时器

    console.log(`⏰ 启动${metalName.value}价格定时更新（30秒间隔）`)
    priceUpdateInterval = setInterval(() => {
      loadMetalPrice()
    }, 30000)
  }

  // 停止定时更新
  const stopPriceUpdates = () => {
    if (priceUpdateInterval) {
      clearInterval(priceUpdateInterval)
      priceUpdateInterval = null
      console.log(`⏹️ 停止价格定时更新`)
    }
  }

  // 监听金属类型变化
  watch(currentMetal, (newMetal) => {
    console.log(`👀 监听到金属类型变化: ${getMetalName(newMetal)}`)
  })

  // 刷新所有数据
  const refreshAllData = async () => {
    console.log(`🔄 刷新所有${metalName.value}数据...`)
    await initializeData()
  }

  return {
    // 状态
    currentMetal,
    metalPrice,
    historicalData,
    minuteData,
    loading,
    error,

    // 计算属性
    metalName,

    // 方法
    loadMetalPrice,
    loadHistoricalData,
    loadMinuteData,
    initializeData,
    setCurrentMetal,
    startPriceUpdates,
    stopPriceUpdates,
    refreshAllData
  }
}

// 导出单例实例，确保全局状态一致
export const globalMetalData = useMetalData()