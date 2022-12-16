<template>
  <div class="bingoContainer">
    <BingoCard :card="data.additionalDetails.card" :claimedTiles="claimedTiles" :mode="data.additionalDetails.mode" tile-height="110" class="card"></BingoCard>
  </div>
</template>

<style scoped>
  .bingoContainer {
    margin: auto;
    width: fit-content;
  }
  .card {
    transform: scale(1.2);
    margin-top: 52px;
    margin-bottom: 52px;
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
  },
  computed: {
    claimedTiles() {
      if(this.data.additionalDetails.hideClaims) {
        const emptyBoard = [] as number[][];
        for (let i = 0; i < 25; i++) {
            emptyBoard.push([0,0]);
        }
        return emptyBoard;
      } else {
        return this.data.additionalDetails.claimedTiles;
      }
    }
  }
})
</script>
