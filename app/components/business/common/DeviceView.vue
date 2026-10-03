<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{ pc: Component; m: Component }>()
const { isMobile } = useDevice()
</script>

<template>
  <component :is="isMobile ? props.m : props.pc" />
</template>
