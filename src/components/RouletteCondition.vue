<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-sheet class="target" :style="'background: url(' + condition.target.tileUrl + ') center center / cover no-repeat;'">
          <!-- for overlay: center -30px no-repeat; -->
          <div class="targetName">{{ condition.target.name }}</div>
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet class="condition">
          <img :src="condition.killMethod.tileUrl" class="conditionImg float-right">
          <span class="conditionTitle">Eliminate using</span><br>
          <span class="conditionDetail">{{ buildKillMethod() }}</span>
        </v-sheet>
        <v-sheet class="condition">
          <img :src="condition.disguise.tileUrl" class="conditionImg float-right">
          <span class="conditionTitle">Wear disguise</span><br>
          <span class="conditionDetail">{{ condition.disguise.name }}</span>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
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
      if (this.condition.killMethod.selectedVariant) {
        return this.condition.killMethod.selectedVariant + " " + this.condition.killMethod.name;
      } else {
        return this.condition.killMethod.name;
      }
    }
  }
})
</script>
