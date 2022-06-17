<template>
  <v-sheet class="target" :style="`background: url(${ target.target.tileUrl }) center -30px no-repeat; background-size: cover;`">
    <span class="targetName">{{ target.target.name }}</span>
  </v-sheet>
  <v-sheet class="conditions">
    <v-sheet class="condition">
      <div class="conditionTitle">Eliminate using</div>
      <div class="conditionDetail">{{ buildKillMethod() }}</div>
    </v-sheet>
    <v-sheet class="condition">
      <div class="conditionTitle">Wear disguise</div>
      <div class="conditionDetail">{{ target.disguise.name }}</div>
    </v-sheet>
  </v-sheet>
  <v-sheet class="images">
    <div class="conditionImage" :style="`background: url(${target.killMethod.tileUrl}) center -20px / cover no-repeat;`"></div>
    <div class="conditionImage" :style="`background: url(${target.disguise.tileUrl}) center -20px / cover no-repeat;`"></div>
  </v-sheet>
</template>

<style scoped>
  .target {
    height: 34%;
    max-height: 198px;
  }
  .conditions {
    height: 33%;
    width: 100%;
    max-height: 198px;
  }
  .condition {
    width: 100%;
    height: 50%;
  }
  .conditionTitle {
    color: red;
    margin-left: 5px;
    font-size: 90%;
  }
  .conditionDetail {
    margin-left: 5px;
    font-size: 80%;
    font-weight: bold;
  }
  .targetName {
    font-size: 120%;
    top: 70%;
    left: 10px;
    position: relative;
    font-weight: bold;
    color: white;
  }
  .images {
    height: 33%;
    max-height: 198px;
  }
  .conditionImage {
    height: 100%;
    width: 50%;
    display: inline-block;
  }
</style>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "TallRouletteCondition",
  props: [ 'target' ],
  data() {
    return {}
  },
  methods: {
    buildKillMethod() {
      if (this.target.killMethod.selectedVariant) {
        return this.target.killMethod.selectedVariant + " " + this.target.killMethod.name;
      } else {
        return this.target.killMethod.name;
      }
    }
  }
})
</script>
