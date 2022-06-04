<template>
  <div class="countdownContainer">
    <br><br>
    <h1 class="text">Up next: {{ nextMode }}</h1>
    <h1 class="text">Arriving in {{ formattedTime }}</h1>
  </div>
</template>

<style scoped>
.countdownContainer {
  width: 800px;
  height: 400px;
}
.text {
  width: 100%;
  text-align: center;
  color: white;
  font-size: 60px;
}
</style>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'CountdownOverlay',
  props: ['nextMode', 'time'],
  data() {
    return {}
  },
  computed: {
    formattedTime() {
      let h = Math.floor(this.time / 3600);
      let m = Math.floor((this.time - h * 3600) / 60);
      let s = this.time - h * 3600 - m * 60;
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
