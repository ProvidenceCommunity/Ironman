<template>
  <div class="doneButtonContainer">
    <br><br>
    <h1 class="text">{{ data.title }}</h1>
    <h3 class="subtext">{{ data.additionalDetails.additionalInfo }}</h3>
  </div>
</template>

<style scoped>
  .doneButtonContainer {
    width: 1300px;
    height: 550px;
  }
  .text {
    width: 100%;
    text-align: center;
    color: white;
    font-size: 60px;
    margin-top: 100px;
  }
  .subtext {
    width: 100%;
    text-align: center;
    color: white;
    font-size: 40px;
  }
</style>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'DoneButtonOverlay',
  props: ['data'],
  data() {
    return {}
  }
})
</script>
