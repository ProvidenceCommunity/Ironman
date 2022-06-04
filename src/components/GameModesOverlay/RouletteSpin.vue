<template>
  <v-container fluid class="noPadding">
    <v-row no-gutters v-if="targets <= 2">
      <v-col v-for="(target, index) in data.currentSpin.targetConditions" :key="index">
        <TallRouletteCondition :target="target"></TallRouletteCondition>
      </v-col>
    </v-row>
    <v-row no-gutters v-else-if="targets >= 5" v-for="x in Math.ceil( targets / 3)" :key="x">
      <v-col v-for="y in [0,1,2]" :key="y">
        <BerlinRouletteCondition v-if="getTarget((x - 1)*3 + y) !== undefined" :target="getTarget((x - 1)*3 + y)" :dataHeight="400 / Math.ceil(targets / 3)"></BerlinRouletteCondition>
      </v-col>
    </v-row>
    <v-row no-gutters v-else v-for="i in Math.ceil( targets / 2)" :key="i">
      <v-col v-for="y in [0,1]" :key="y">
        <OverlayRouletteCondition v-if="getTarget((i - 1)*2 + y) !== undefined" :target="getTarget((i - 1)*2 + y)" :dataHeight="400 / Math.ceil(targets / 2)"></OverlayRouletteCondition>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
  .noPadding {
    padding: 0;
  }
</style>

<script lang="ts">
import {defineComponent} from "vue";
import TallRouletteCondition from "@/components/GameModesOverlay/TallRouletteCondition.vue";
import OverlayRouletteCondition from "@/components/GameModesOverlay/OverlayRouletteCondition.vue";
import BerlinRouletteCondition from "@/components/GameModesOverlay/BerlinRouletteCondition.vue";

export default defineComponent({
  name: 'RouletteSpinOverlay',
  components: {BerlinRouletteCondition, OverlayRouletteCondition, TallRouletteCondition},
  props: ['data'],
  data() {
    return {}
  },
  methods: {
    getTarget(index: number) {
      return this.data.currentSpin.targetConditions[index];
    }
  },
  computed: {
    targets() {
      return this.data.currentSpin.targetConditions.length;
    }
  }
})
</script>
