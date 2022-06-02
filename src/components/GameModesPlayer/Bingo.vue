<template>
  <BingoCard :card="this.details.card" :claimedTiles="this.details.claimedTiles" :mode="this.details.mode" @click="clickTile"></BingoCard>
  <h5>Please click the done button upon finishing!</h5>
  <v-btn @click="done" x-large>{{ buttonText }}</v-btn>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {post} from "@/http";
import BingoCard from "@/components/BingoCard.vue";

export default defineComponent({
  name: "BingoPlayer",
  components: {
    BingoCard
  },
  props: ['matchId', 'player', 'details'],
  data() {
    return {
      sentDone: false,
      timer: -1,
      rejectedFor: 0
    }
  },
  created() {
    setInterval(this.rejectionTimer, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    async done() {
      await post('/api/match/player/' + this.matchId + '/' + this.player + '/done', {});
      setTimeout(() => { this.sentDone = true }, 500);
    },
    rejectionTimer() {
      if (this.details.doneStatus === 0 && this.sentDone) {
        this.rejectedFor++;
      }
      if (this.rejectedFor >= 10) {
        this.rejectedFor = 0;
        this.sentDone = false;
      }
    },
    async clickTile(x: number, y: number) {
      await post(`/api/match/player/${this.matchId}/${this.player}/tile`, {tile: ((y-1)*5+x-1)});
    }
  },
  computed: {
    buttonText() {
      if (this.details.doneStatus === 0 && !this.sentDone) return "DONE";
      if (this.details.doneStatus === 0 && this.sentDone) return "REJECTED!";
      if (this.details.doneStatus === 1) return "Awaiting verification...";
      if (this.details.doneStatus === 2) return "Run verified!";
      return "DONE";
    }
  }
})
</script>