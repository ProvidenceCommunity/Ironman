<template>
  <div :style="'background-image: url(' + data.mission.backgroundTile + '); background-size: cover;'">
    <v-container fluid class="noPadding">
      <v-row no-gutters style="height: 100%">
          <v-col v-for="(target, index) in data.targetConditions" :key="index" style="max-width: 50%; height: 100%;">
              <WideOverlayRouletteCondition :target="target" />
          </v-col>
          <v-col v-for="(target, index) in data.additionalObjectives" :key="index" style="max-width: 50%; height: 100%;">
              <WideOverlayRouletteAdditionalObjective :target="target" />
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
import WideOverlayRouletteCondition from "@/components/GameModesOverlay/WideOverlayRouletteCondition.vue";
import WideOverlayRouletteAdditionalObjective from "./WideOverlayRouletteAdditionalObjective.vue";
  
export default defineComponent({
  name: 'SpinOverlay',
  components: {WideOverlayRouletteCondition, WideOverlayRouletteAdditionalObjective},
  props: ['data'],
  data() {
    return {}
  }
})
</script>
  