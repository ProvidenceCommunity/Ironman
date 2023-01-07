<template>
  <v-sheet class="condition">
    <img :src="condition.killMethod.tileUrl" class="conditionImg float-right">
    <span class="conditionTitle">Eliminate using</span><br>
    <span class="conditionDetail">
      {{ buildKillMethod() }}
      <img :src="getDiamondSrcMethod()" v-if="getDiamondSrcMethod() !== ''" height="20">
    </span>
  </v-sheet>
  <v-sheet class="condition borderbottom">
    <img :src="condition.disguise.tileUrl" class="conditionImg float-right">
    <span class="conditionTitle">Wear disguise</span><br>
    <span class="conditionDetail">
      <img :src="getDiamondSrcDisguise()" v-if="getDiamondSrcDisguise() !== ''" height="20">
      {{ condition.disguise.name }}
    </span>
  </v-sheet>
</template>

<style scoped>
  .borderbottom {
    border-bottom: 1px solid black;
  }
  .target {
    height: 198px;
    width: 325px;
    max-width: 325px;
  }
  .targetName {
    font-size: 25px;
    top: 80%;
    left: 10px;
    position: relative;
    font-weight: bold;
  }
  .condition {
    height: 99px;
    min-width: 400px;
    max-width: 600px;
    border-right: 1px solid black;
    border-left: 1px solid black;
  }
  .conditionTitle {
    color: red;
    margin-top: 10px;
    margin-left: 10px;
    font-size: 20px;
  }
  .conditionDetail {
    margin-left: 10px;
    margin-top: 10px;
    font-size: 25px;
    font-weight: bold;
  }
  .conditionImg {
    height: 99px;
    display: flex;
  }
  .selected1 {
    color: #53e507;
  }
  .selected2 {
    color: #ea02d9;
  }
</style>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "RouletteCondition",
  props: [ 'condition' ],
  data() {
    return {}
  },
  methods: {
    buildKillMethod() {
      if (this.condition.killMethod.variant) {
        return this.condition.killMethod.variant + " " + this.condition.killMethod.name;
      } else {
        return this.condition.killMethod.name;
      }
    },
    getDiamondSrcMethod() {
      if (this.condition.killMethod.selectedBy === 1) {
        return require("@/assets/DiamondP1.png");
      }
      if (this.condition.killMethod.selectedBy === 2) {
        return require("@/assets/DiamondP2.png");
      }
      return "";
    },
    getDiamondSrcDisguise() {
      if (this.condition.disguise.selectedBy === 1) {
        return require("@/assets/DiamondP1.png");
      }
      if (this.condition.disguise.selectedBy === 2) {
        return require("@/assets/DiamondP2.png");
      }
      return "";
    }
  }
})
</script>
