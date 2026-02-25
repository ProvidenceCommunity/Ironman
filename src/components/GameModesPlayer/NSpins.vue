<template>
  <template v-for="(spin, idx) in details.currentSpins" :key="idx">
    <h3>{{ spin.mission.name }}</h3>
    <RouletteSpin :spin="spin" />
    <v-divider />
  </template>
  <h5>Please click the done button upon finishing!</h5>
  <v-btn @click="done" class="doneButton" color="success">{{ buttonText }}</v-btn>
</template>

<style scoped>
.doneButton {
  padding: 0 100px 0 100px;
  font-size: 24pt;
}
</style>

<script lang="ts">
import {defineComponent} from "vue";
import {post} from "@/http";
import RouletteSpin from '@/components/RouletteSpin.vue';

export default defineComponent({
  name: "NSpinsPlayer",
  props: ['matchId', 'player', 'details'],
  emits: ['error'],
  components: {
    RouletteSpin
  },
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
