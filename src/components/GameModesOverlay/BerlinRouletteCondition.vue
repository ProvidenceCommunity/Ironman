<template>
  <div>
    <v-sheet class="target" :style="`background: url(${ target.target.tileUrl }) center center / cover no-repeat;`">
      <span class="targetName">{{ target.target.name }}</span>
    </v-sheet>
    <v-sheet class="condition">
      <img :src="target.killMethod.tileUrl" class="conditionImg float-right">
      <div class="conditionTitle">Eliminate using</div>
      <div class="conditionDetail">{{ buildKillMethod() }}</div>
    </v-sheet>
    <v-sheet class="condition">
      <img :src="target.disguise.tileUrl" class="conditionImg float-right">
      <div class="conditionTitle">Wear disguise</div>
      <div class="conditionDetail">{{ target.disguise.name }}</div>
    </v-sheet>
  </div>
</template>

<style scoped>
.target {
  height: 34%;
}
.condition {
  width: 100%;
  height: 33%;
}
.conditionImg {
  height: 100%;
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
.targetName {
  font-size: 110%;
  top: 30%;
  left: 5px;
  position: relative;
  font-weight: bold;
  color: white;
}
</style>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "BerlinRouletteCondition",
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
