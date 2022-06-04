<template>
  <v-sheet class="target" :style="`background: url(${ target.target.tileUrl }) -120px -220px no-repeat;`">
    <span class="targetName">{{ target.target.name }}</span>
  </v-sheet>
  <v-sheet class="condition">
    <img :src="target.killMethod.tileUrl" class="conditionImg float-right">
    <span class="conditionTitle">Eliminate using</span><br>
    <span class="conditionDetail">{{ buildKillMethod() }}</span>
  </v-sheet>
  <v-sheet class="condition">
    <img :src="target.disguise.tileUrl" class="conditionImg float-right">
    <span class="conditionTitle">Wear disguise</span><br>
    <span class="conditionDetail">{{ target.disguise.name }}</span>
  </v-sheet>
</template>

<style scoped>
.target {
  height: 70px;
}
.condition {
  width: 100%;
  height: 80px;
}
.conditionImg {
  height: 80px;
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
.targetName {
  font-size: 25px;
  top: 50%;
  left: 10px;
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
