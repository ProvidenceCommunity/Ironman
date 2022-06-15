<template>

  <h3>Map #{{details.currentMapIndex + 1}}/{{details.totalMaps}}</h3>
  <RouletteCondition v-if="details.map !== undefined" v-for="(target, index) in details.map.targetConditions" :key="index" :condition="target"></RouletteCondition>
  <h5>Please click the done button upon finishing!</h5>
  <v-btn @click="done" x-large>{{ buttonText }}</v-btn><br><br>
  Warning! Forfeiting will add 30 minutes of RTA to your time.<br>
  Forfeits must be accepted by the match admin.
  <v-btn @click="forfeit" x-large color="red">{{ forfeitText }}</v-btn>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {post} from "@/http";
import RouletteCondition from "@/components/RouletteCondition.vue";

export default defineComponent({
  name: "RelayPlayer",
  props: ['matchId', 'player', 'details'],
  emits: ['error'],
  components: {
    RouletteCondition
  },
  data() {
    return {
      sendingDone: false,
      sentDone: false,
      timer: -1,
      rejectedFor: 0,
      map: ""
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
      this.sendingDone = true;
      this.map = this.details.map.mission.slug;
      const resp = await post('/api/match/player/' + this.matchId + '/' + this.player + '/done', {});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while sending the 'done' signal. Please inform your match admin via discord.");
      }
    },
    async forfeit() {
      this.sendingDone = true;
      this.map = this.details.map.mission.slug;
      const resp = await post('/api/match/player/' + this.matchId + '/' + this.player + '/forfeit', {});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while sending the 'done' signal. Please inform your match admin via discord.");
      }
    },
    rejectionTimer() {
      if (this.sendingDone && (this.details.doneStatus === 1 || this.details.doneStatus === 3)) {
        this.sendingDone = false;
        this.sentDone = true;
      }
      if (this.details.doneStatus === 0 && this.sentDone) {
        if (this.details.map.mission.slug !== this.map) {
          this.sentDone = false;
        } else {
          this.rejectedFor++;
        }
      }
      if (this.rejectedFor >= 10) {
        this.rejectedFor = 0;
        this.sentDone = false;
      }
    }
  },
  computed: {
    buttonText() {
      if (this.details.doneStatus === 0 && this.sendingDone) return "Sending done...";
      if (this.details.doneStatus === 0 && !this.sentDone) return "DONE";
      if (this.details.doneStatus === 0 && this.sentDone) {
        if (this.details.map.mission.slug !== this.map) {
          return "";
        } else {
          return "REJECTED!";
        }
      }
      if (this.details.doneStatus === 1) return "Awaiting verification...";
      if (this.details.doneStatus === 3) return "Awaiting forfeit accept...";
      if (this.details.doneStatus === 2) return "Run verified!";
      if (this.details.doneStatus === 4) return "Forfeit accepted!";
      return "DONE";
    },
    forfeitText() {
      if (this.details.doneStatus === 0 && !this.sentDone) return "Forfeit this map";
      return this.buttonText;
    }
  }
})
</script>
