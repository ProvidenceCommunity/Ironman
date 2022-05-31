<template>
  <h1>{{details.title}}</h1>
  <h3>{{details.additionalInfo}}</h3>
  <h5>Please click the done button upon finishing!</h5>
  <v-btn @click="done" x-large>{{ buttonText }}</v-btn>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {post} from "@/http";

export default defineComponent({
  name: "DoneButtonPlayer",
  props: ['matchId', 'player', 'details'],
  data() {
    return {
      sentDone: false
    }
  },
  methods: {
    async done() {
      await post('/api/match/player/' + this.matchId + '/' + this.player + '/done', {});
      this.sentDone = true;
    },
    resetDone() {
      this.sentDone = false;
    }
  },
  computed: {
    buttonText() {
      if (this.details.doneStatus === 0 && !this.sentDone) return "DONE";
      if (this.details.doneStatus === 0 && this.sentDone) {
        // eslint-disable-next-line vue/no-async-in-computed-properties
        setTimeout(this.resetDone, 10000);
        return "REJECTED!";
      }
      if (this.details.doneStatus === 1) return "Awaiting verification...";
      if (this.details.doneStatus === 2) return "Run verified!";
      return "DONE";
    }
  }
})
</script>
