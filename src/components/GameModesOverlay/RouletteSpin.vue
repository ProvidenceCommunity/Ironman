<template>
  <h1>{{ data.currentSpin.mission.name }}</h1>
  <RouletteCondition v-for="(target, index) in data.currentSpin.targetConditions" :key="index" :condition="target"></RouletteCondition>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import RouletteCondition from "@/components/RouletteCondition.vue";

export default defineComponent({
  name: 'RouletteSpinOverlay',
  components: {RouletteCondition},
  props: ['data'],
  data() {
    return {}
  }
})
</script>
