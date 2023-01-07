<template>
    <div :style="'background-image: url(' + data.mission.backgroundTile + '); background-size: cover;'">
        <v-container fluid class="noPadding">
            <v-row no-gutters>
                <v-col v-for="(target, index) in data.targetConditions" :key="index" :cols="cols">
                    <FreestyleCondition :condition="target"></FreestyleCondition>
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
import { defineComponent } from "vue";
import FreestyleCondition from "@/components/FreestyleCondition.vue";

export default defineComponent({
    name: 'SelectableSpinOverlay',
    props: ['data'],
    components: { FreestyleCondition },
    data() {
        return {}
    },
    computed: {
        cols() {
            if (this.data.targetConditions.length == 5) {
                return 4;
            }
            if (this.data.targetConditions.length > 2) {
                return 6;
            }
            return 12;
        }
    }
})
</script>