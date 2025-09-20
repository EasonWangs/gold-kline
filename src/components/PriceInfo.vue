<template>
  <div class="chart-container p-6 space-y-6">
    <!-- 加载状态 -->
    <div v-if="loading" class="animate-pulse">
      <div class="h-4 bg-slate-700 rounded mb-4"></div>
      <div class="h-8 bg-slate-700 rounded mb-4"></div>
      <div class="h-4 bg-slate-700 rounded mb-2"></div>
      <div class="h-4 bg-slate-700 rounded mb-2"></div>
      <div class="h-4 bg-slate-700 rounded"></div>
    </div>

    <!-- 数据不可用 -->
    <div v-else-if="!metalPrice" class="text-center text-slate-400">
      <WifiOff class="w-8 h-8 mx-auto mb-3" />
      <div class="text-lg font-medium mb-2">数据不可用</div>
      <div class="text-sm mb-3">无法获取{{ metalName }}价格数据</div>
      <div class="text-xs text-slate-500">
        请检查网络连接或稍后重试
      </div>
    </div>

    <!-- 价格信息 -->
    <template v-else>
      <!-- 数据来源指示器 -->
      <div class="flex items-center justify-center">
        <div class="flex items-center space-x-2">
          <Database class="w-4 h-4 text-green-400" />
          <span class="text-xs text-green-400">{{ metalName }}实时数据</span>
        </div>
      </div>

      <!-- 当前价格 -->
      <div class="text-center">
        <div class="flex items-center justify-center mb-2">
          <component :is="MetalIcon" :class="`w-5 h-5 mr-1 ${metalColor}`" />
          <span class="text-sm text-slate-400">{{ metalName }}当前价格 ({{ currencyInfo.unit }})</span>
        </div>
        <div class="text-3xl font-bold text-white mb-2">
          {{ currencyInfo.formatPrice(metalPrice.price) }}
        </div>
        <div :class="`flex items-center justify-center space-x-2 ${trendColor}`">
          <component :is="TrendIcon" class="w-4 h-4" />
          <span class="font-medium">
            {{ isPositive ? '+' : '' }}{{ currencyInfo.symbol }}{{ Math.abs(metalPrice.change).toFixed(2) }}
          </span>
          <span class="text-sm">
            ({{ isPositive ? '+' : '' }}{{ metalPrice.changePercent.toFixed(2) }}%)
          </span>
        </div>
      </div>


      <!-- 金属信息 -->
      <div class="bg-slate-800/30 p-3 rounded-lg">
        <div class="text-center">
          <div class="flex items-center justify-center mb-2">
            <component :is="MetalIcon" :class="`w-4 h-4 mr-1 ${metalColor}`" />
            <div class="text-sm text-slate-400">{{ metalName }}计价单位</div>
          </div>
          <div :class="`text-lg font-semibold ${metalColor}`">
            {{ currencyInfo.unit }}
          </div>
          <div class="text-xs text-slate-500 mt-1">
            国内常用计价
          </div>
        </div>
      </div>

      <!-- 更新时间 -->
      <div class="pt-4 border-t border-slate-700">
        <div class="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Clock class="w-3 h-3" />
          <span>
            更新时间: {{ dayjs(metalPrice.timestamp).format('HH:mm:ss') }}
          </span>
        </div>
        <div class="text-center text-xs text-slate-500 mt-1">
          数据来源: {{ metalName }}真实市场数据
        </div>
      </div>

      <!-- 市场状态 -->
      <div :class="`p-3 rounded-lg ${bgColor} border border-opacity-30 ${isPositive ? 'border-green-500' : 'border-red-500'}`">
        <div class="text-center">
          <div class="text-sm font-medium text-white mb-1">
            市场趋势
          </div>
          <div :class="`text-lg font-bold ${trendColor}`">
            {{ isPositive ? '看涨' : '看跌' }}
          </div>
          <div class="text-xs text-slate-400 mt-1">
            国内{{ metalName }}价
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Clock, WifiOff, Database, Coins, Gem } from 'lucide-vue-next'
import type { MetalPrice, MetalType } from '../types/gold'
import { getMetalName } from '../services/metalApi'
import dayjs from 'dayjs'

const props = defineProps<{
  metalPrice: MetalPrice | null
  loading: boolean
  metal: MetalType
}>()

const currencyInfo = computed(() => ({
  symbol: '¥',
  unit: props.metal === 'gold' ? '人民币/克' : '人民币/千克',
  formatPrice: (price: number) => `¥${price.toFixed(2)}`
}))

const isPositive = computed(() => (props.metalPrice?.change ?? 0) >= 0)
const TrendIcon = computed(() => isPositive.value ? TrendingUp : TrendingDown)
const trendColor = computed(() => isPositive.value ? 'text-green-400' : 'text-red-400')
const bgColor = computed(() => isPositive.value ? 'bg-green-500/20' : 'bg-red-500/20')
const MetalIcon = computed(() => props.metal === 'gold' ? Coins : Gem)
const metalName = computed(() => getMetalName(props.metal))
const metalColor = computed(() => props.metal === 'gold' ? 'text-yellow-400' : 'text-gray-300')
</script>