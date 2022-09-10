<template>
  <h1>{{details.title}}</h1>
  <h3>{{details.additionalInfo}}</h3>
  <h5>Please click the done button upon finishing!</h5>
  <v-btn @click="done" x-large>{{ buttonText }}</v-btn>
  <h5>{{ finishingPosition }}</h5>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {post} from "@/http";

export default defineComponent({
  name: "DoneButtonPlayer",
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
      if (this.details.doneStatus === 0) {
        const resp = await post('/api/match/player/' + this.matchId + '/' + this.player + '/done', {});
        if (resp.status !== 204) {
          this.$emit("error", "An error occurred while sending the 'done' signal. Please inform your match admin via discord.");
        }
        setTimeout(() => { this.sentDone = true }, 500);
      }
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
    },
    finishingPosition() {
      if (this.details.donePosition < 0) {
          return "";
      }
      if (this.details.donePosition % 10 === 1 && this.details.donePosition !== 11) {
        return "You finished " + this.details.donePosition + "st";
      }
      if (this.details.donePosition % 10 === 2 && this.details.donePosition !== 12) {
        return "You finished " + this.details.donePosition + "nd";
      }
      if (this.details.donePosition % 10 === 3 && this.details.donePosition !== 13) {
        return "You finished " + this.details.donePosition + "rd";
      }
      return "You finished " + this.details.donePosition + "th";
    }
  }
})
</script>
