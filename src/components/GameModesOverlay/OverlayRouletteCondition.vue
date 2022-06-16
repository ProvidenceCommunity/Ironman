<template>
  <v-container fluid style="padding: 0; height: 100%;">
    <v-row no-gutters style="height: 100%;">
      <v-col>
        <v-sheet class="target" :style="'background: url(' + target.target.tileUrl + ') center center / cover no-repeat;'" :height="dataHeight">
          <div class="targetName">{{ target.target.name }}</div>
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet style="height: 33%">
          <div class="conditionTitle">Eliminate using</div>
          <div class="conditionDetail">{{ buildKillMethod() }}</div>
        </v-sheet>
        <v-sheet style="height: 33%">
          <div class="conditionTitle">Wear disguise</div>
          <div class="conditionDetail">{{ target.disguise.name }}</div>
        </v-sheet>
        <v-sheet style="height: 34%">
          <div class="conditionImage" :style="`background: url(${target.killMethod.tileUrl}) center center / cover no-repeat;`"></div>
          <div class="conditionImage" :style="`background: url(${target.disguise.tileUrl}) center center / cover no-repeat;`"></div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.target {
  height: 100%;
}
.targetName {
  font-size: 120%;
  top: 75%;
  left: 10px;
  position: relative;
  font-weight: bold;
  color: white;
}
.conditionTitle {
  color: red;
  margin-left: 5px;
  font-size: 90%;
}
.conditionDetail {
  margin-left: 5px;
  margin-top: -5px;
  font-size: 110%;
  font-weight: bold;
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
  name: "OverlayRouletteCondition",
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
