<template>
  <div :style="'background-image: url(' + data.mission.locationTileUrl + '); background-size: cover;'">
    <v-container fluid class="noPadding">
      <v-row no-gutters v-if="targets <= 2" style="height: 100%;">
        <v-col v-for="(target, index) in data.targetConditions" :key="index" style="max-width: 50%;">
          <TallRouletteCondition :target="target"></TallRouletteCondition>
        </v-col>
      </v-row>
      <v-row no-gutters v-else-if="targets >= 5" v-for="x in Math.ceil( targets / 3)" :key="x" style="height: 50%;">
        <v-col v-for="y in [0,1,2]" :key="y" style="height: 100%;">
          <BerlinRouletteCondition v-if="getTarget((x - 1)*3 + y) !== undefined" :target="getTarget((x - 1)*3 + y)" style="height: 100%;"></BerlinRouletteCondition>
        </v-col>
      </v-row>
      <v-row no-gutters v-else v-for="i in Math.ceil( targets / 2)" :key="i" style="height: 50%;">
        <v-col v-for="y in [0,1]" :key="y" style="height: 100%;">
          <OverlayRouletteCondition v-if="getTarget((i - 1)*2 + y) !== undefined" :target="getTarget((i - 1)*2 + y)" style="height: 100%;"></OverlayRouletteCondition>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.noPadding {
  padding: 0;
  height: 100%;
}
</style>

<script lang="ts">
import {defineComponent} from "vue";
import TallRouletteCondition from "@/components/GameModesOverlay/TallRouletteCondition.vue";
import OverlayRouletteCondition from "@/components/GameModesOverlay/OverlayRouletteCondition.vue";
import BerlinRouletteCondition from "@/components/GameModesOverlay/BerlinRouletteCondition.vue";

export default defineComponent({
  name: 'SpinOverlay',
  components: {BerlinRouletteCondition, OverlayRouletteCondition, TallRouletteCondition},
  props: ['data'],
  data() {
    return {}
  },
  methods: {
    getTarget(index: number) {
      return this.data.targetConditions[index];
    }
  },
  computed: {
    targets() {
      return this.data.targetConditions.length;
    }
  }
})
</script>
