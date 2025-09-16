<template>
  <div class="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
    <button
      @click="$emit('metal-change', 'gold')"
      :class="[
        'flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200',
        currentMetal === 'gold'
          ? 'bg-yellow-500 text-white shadow-lg'
          : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-700'
      ]"
    >
      <Coins class="w-4 h-4" />
      <span class="font-medium">黄金</span>
    </button>

    <button
      @click="$emit('metal-change', 'silver')"
      :class="[
        'flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200',
        currentMetal === 'silver'
          ? 'bg-gray-400 text-white shadow-lg'
          : 'text-slate-400 hover:text-gray-300 hover:bg-slate-700'
      ]"
    >
      <Gem class="w-4 h-4" />
      <span class="font-medium">白银</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Coins, Gem } from 'lucide-vue-next'
import type { MetalType } from '../types/gold'

defineProps<{
  currentMetal: MetalType
}>()

defineEmits<{
  'metal-change': [metal: MetalType]
}>()
</script>