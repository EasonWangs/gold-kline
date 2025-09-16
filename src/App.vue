<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
    <div class="container mx-auto px-4 py-6">
      <Header />

      <div v-if="error" class="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
        {{ error }}
      </div>

      <!-- 金属切换器 -->
      <div class="mb-6 flex justify-center">
        <MetalSwitch
          :currentMetal="currentMetal"
          @metal-change="setCurrentMetal"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3">
          <GoldChart :loading="loading" :metal="currentMetal" />
        </div>

        <div class="lg:col-span-1">
          <PriceInfo :metalPrice="metalPrice" :loading="loading" :metal="currentMetal" />
        </div>
      </div>

      <!-- 数据说明 -->
      <div class="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div class="flex items-start space-x-3">
          <div class="text-blue-400 text-sm">ℹ️</div>
          <div>
            <h4 class="text-blue-300 font-medium mb-1">数据说明</h4>
            <p class="text-blue-200 text-sm">
              {{
                currentMetal === 'gold'
                  ? '人民币价格来自上海金交所Au99.99数据，通过AKTools本地服务获取。'
                  : '人民币价格来自上海金交所Ag99.99数据，通过AKTools本地服务获取。'
              }}
              显示单位为人民币/克，符合国内贵金属交易习惯。
            </p>
          </div>
        </div>
      </div>

      <!-- 数据来源说明 -->
      <div class="mt-6 text-center text-xs text-slate-500">
        <p>
          数据来源：上海金交所 {{ currentMetal === 'gold' ? 'Au99.99' : 'Ag99.99' }} | AKTools本地服务 | 更新频率：30秒 | 人民币/克
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Header from './components/Header.vue'
import GoldChart from './components/GoldChart.vue'
import PriceInfo from './components/PriceInfo.vue'
import MetalSwitch from './components/MetalSwitch.vue'
import { fetchMetalPrice } from './services/metalApi'
import type { MetalPrice, MetalType } from './types/gold'

const metalPrice = ref<MetalPrice | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const currentMetal = ref<MetalType>('gold')

let intervalId: number | null = null

const loadMetalPrice = async () => {
  try {
    loading.value = true
    const price = await fetchMetalPrice(currentMetal.value)
    metalPrice.value = price
    error.value = null
  } catch (err) {
    const metalName = currentMetal.value === 'gold' ? '黄金' : '白银'
    error.value = `获取${metalName}价格失败`
    console.error(`Error fetching ${currentMetal.value} price:`, err)
  } finally {
    loading.value = false
  }
}

const setCurrentMetal = (metal: MetalType) => {
  currentMetal.value = metal
}

watch(currentMetal, () => {
  loadMetalPrice()
})

onMounted(() => {
  loadMetalPrice()

  // 每30秒更新一次价格
  intervalId = setInterval(loadMetalPrice, 30000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>