<template>
  <div>
    <v-sheet class="target" :style="`background: url(${ target.target.tileUrl }) center center / cover no-repeat;`">
      <span class="targetName">{{ target.target.name }}</span>
      <span v-if="hasNtko" class="complication">
        NTKO
      </span>
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
  position: relative;
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
  font-size: 120%;
}
.conditionDetail {
  margin-left: 5px;
  font-size: 140%;
  font-weight: bold;
}
.targetName {
  font-size: 220%;
  top: 30%;
  left: 5px;
  position: relative;
  font-weight: bold;
  color: white;
}
.complication {
  background-color: red;
  position: absolute;
  right: 0px;
  height: 100%;
  color: white;
  font-size: 150%;
  padding-left: 10px;
  font-weight: bold;
  padding-right: 10px;
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
  },
  computed: {
    hasNtko() {
      return this.target.complications.filter((comp: {name: string}) => comp.name === "No Target Pacification").length > 0;
    }
  }
})
</script>
