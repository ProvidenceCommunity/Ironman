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
  emits: ['error'],
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
      const resp = await post('/api/match/player/' + this.matchId + '/' + this.player + '/done', {});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while sending the 'done' signal. Please inform your match admin via discord.");
      }
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
      const resp = await post(`/api/match/player/${this.matchId}/${this.player}/tile`, {tile: ((y-1)*5+x-1)});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while toggling a tile. Please inform your match admin via discord.");
      }
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
