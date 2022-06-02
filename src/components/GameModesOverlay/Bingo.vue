<template>
  <BingoCard :card="data.card" :claimedTiles="data.claimedTiles" :mode="data.mode"></BingoCard>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import BingoCard from '@/components/BingoCard.vue';

export default defineComponent({
  name: 'BingoOverlay',
  components: {
    BingoCard
  },
  props: ['data'],
  data() {
    return {}
  }
})
</script>
