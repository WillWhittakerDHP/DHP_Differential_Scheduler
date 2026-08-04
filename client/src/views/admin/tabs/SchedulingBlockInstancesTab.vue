<script setup lang="ts">
import InstancesTab from '@/views/admin/tabs/InstancesTab.vue'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'

const allowed = [BLOCK_SHAPE_TYPES.TIME, BLOCK_SHAPE_TYPES.EVENT, BLOCK_SHAPE_TYPES.PRICE] as const
</script>

<template>
  <InstancesTab :allowed-block-shape-types="allowed" />
</template>
