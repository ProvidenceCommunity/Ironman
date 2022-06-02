<template>
  <div>
    <DoneButtonOverlay v-if="matchInfo.round.mode === 'simpleDoneButton'" :data="matchInfo.round.additionalDetails"></DoneButtonOverlay>
    <RouletteSpinOverlay v-if="matchInfo.round.mode === 'rouletteSpin'" :data="matchInfo.round.additionalDetails"></RouletteSpinOverlay>
    <BingoOverlay v-if="matchInfo.round.mode === 'bingo'" :data="matchInfo.round.additionalDetails"></BingoOverlay>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {get} from "@/http";
import DoneButtonOverlay from '@/components/GameModesOverlay/DoneButton.vue';
import RouletteSpinOverlay from '@/components/GameModesOverlay/RouletteSpin.vue';
import BingoOverlay from '@/components/GameModesOverlay/Bingo.vue';

export default defineComponent({
  name: 'Overlay',
  components: {
    DoneButtonOverlay,
    RouletteSpinOverlay,
    BingoOverlay
  },
  data() {
    return {
      matchId: "",
      updateInterval: -1,
      matchInfo: {
        round: {}
      }
    }
  },
  async created() {
    const pathname = window.location.pathname.split("/");
    this.matchId = pathname.pop() as string;
    this.updateInterval = setInterval(this.update, 1000);
  },
  methods: {
    async update() {
      const d = await get(`/api/match/overlay/${this.matchId}`);
      this.matchInfo = d.data;
    }
  }
})
</script>
