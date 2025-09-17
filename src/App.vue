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
          @metal-change="handleMetalChange"
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
              {{
                currentMetal === 'gold'
                  ? '显示单位为人民币/克，符合国内贵金属交易习惯。'
                  : '显示单位为人民币/千克，符合上海金交所Ag99.99合约标准。'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- 数据来源说明 -->
      <div class="mt-6 text-center text-xs text-slate-500">
        <p>
          数据来源：上海金交所 {{ currentMetal === 'gold' ? 'Au99.99' : 'Ag99.99' }} | AKTools本地服务 | 更新频率：30秒 | {{ currentMetal === 'gold' ? '人民币/克' : '人民币/千克' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Header from './components/Header.vue'
import GoldChart from './components/GoldChart.vue'
import PriceInfo from './components/PriceInfo.vue'
import MetalSwitch from './components/MetalSwitch.vue'
import { globalMetalData } from './composables/useMetalData'
import type { MetalType } from './types/gold'

// 使用全局数据管理
const {
  currentMetal,
  metalPrice,
  loading,
  error,
  initializeData,
  setCurrentMetal,
  startPriceUpdates,
  stopPriceUpdates
} = globalMetalData

const handleMetalChange = (metal: MetalType) => {
  setCurrentMetal(metal)
}

onMounted(async () => {
  console.log('🚀 App组件初始化...')

  // 初始化数据并启动定时更新
  await initializeData()
  startPriceUpdates()
})

onUnmounted(() => {
  console.log('🛑 App组件卸载，停止定时更新')
  stopPriceUpdates()
})
</script>