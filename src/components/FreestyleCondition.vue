<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col>
        <v-sheet class="condition">
          <img :src="condition.killMethod.tileUrl" class="conditionImg float-right">
          <span class="conditionTitle">Eliminate using</span><br>
          <span :class="classMethod()">{{ buildKillMethod() }}</span>
        </v-sheet>
        <v-sheet class="condition">
          <img :src="condition.disguise.tileUrl" class="conditionImg float-right">
          <span class="conditionTitle">Wear disguise</span><br>
          <span :class="classDisguise()">{{ condition.disguise.name }}</span>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
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
    width: 600px;
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
    classMethod() {
      if (this.condition.killMethod.selectedBy === 1) {
        return "conditionDetail selected1";
      } else if (this.condition.killMethod.selectedBy === 2) {
        return "conditionDetail selected2";
      }
      return "conditionDetail";
    },
    classDisguise() {
      if (this.condition.disguise.selectedBy === 1) {
        return "conditionDetail selected1";
      } else if (this.condition.disguise.selectedBy === 2) {
        return "conditionDetail selected2";
      }
      return "conditionDetail";
    }
  }
})
</script>
