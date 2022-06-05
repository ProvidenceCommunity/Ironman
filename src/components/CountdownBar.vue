<template>
  <v-progress-linear v-model="percentage" height="50" :color="computeColor">
    <b style="color: white;">{{ formattedTimeRemaining }}</b>
  </v-progress-linear>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "CountdownBar",
  props: ['totalTime', 'timeRemaining'],
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
      let h = Math.floor(this.timeRemaining / 3600);
      let m = Math.floor((this.timeRemaining - h * 3600) / 60);
      let s = this.timeRemaining - h * 3600 - m * 60;
      let result = "";
      if (h < 10) {
        result += "0" + h.toString() + ":";
      } else if (h > 0) {
        result += h.toString() + ":";
      }
      if (m < 10) {
        result += "0" + m.toString() + ":";
      } else {
        result += m.toString() + ":";
      }
      if (s < 10)  {
        result += "0" + s.toString();
      } else {
        result += s.toString();
      }
      return result;
    }
  }
})
</script>
