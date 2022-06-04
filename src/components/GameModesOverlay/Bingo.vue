<template>
  <div class="bingoContainer">
    <BingoCard :card="data.card" :claimedTiles="data.claimedTiles" :mode="data.mode" tile-height="79"></BingoCard>
  </div>
</template>

<style scoped>
  .bingoContainer {
    margin: auto;
  }
</style>

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
