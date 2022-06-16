<template>
  <v-progress-linear v-model="percentage" :height="height" :color="computeColor">
    <b style="color: white;">{{ formattedTimeRemaining }}</b>
  </v-progress-linear>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {Duration} from "luxon";

export default defineComponent({
  name: "CountdownBar",
  props: {
    totalTime: {
      type: Number,
      required: true
    },
    timeRemaining: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {}
  },
  computed: {
    computeColor() {
      if (this.totalTime < 0) return "gray";
      if (this.percentage < 10) return "red";
      if (this.percentage < 50) return "yellow";
      return "green";
    },
    percentage() {
      if (this.totalTime < 0) return 0;
      return ((this.timeRemaining / this.totalTime) * 100);
    },
    formattedTimeRemaining() {
      if (this.totalTime < 0) return "No time limit";
      const dur = Duration.fromMillis(this.timeRemaining * 1000);
      if (dur.hours > 0) {
        return dur.toFormat("hh:mm:ss");
      } else {
        return dur.toFormat("mm:ss");
      }
    }
  }
})
</script>
