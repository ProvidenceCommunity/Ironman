<template>
  <v-container fluid style="padding: 0;">
    <v-row no-gutters>
      <v-col>
        <v-sheet class="target" :style="'background: url(' + target.target.tileUrl + ') center center / cover no-repeat;'" :height="dataHeight">
          <div class="targetName">{{ target.target.name }}</div>
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet :height="dataHeight / 4">
          <span class="conditionTitle">Eliminate using</span><br>
          <span class="conditionDetail">{{ buildKillMethod() }}</span>
        </v-sheet>
        <v-sheet :height="dataHeight / 4">
          <span class="conditionTitle">Wear disguise</span><br>
          <span class="conditionDetail">{{ target.disguise.name }}</span>
        </v-sheet>
        <v-row>
          <v-col>
            <img :src="target.killMethod.tileUrl" class="float-right" :height="dataHeight / 4">
          </v-col>
          <v-col>
            <img :src="target.disguise.tileUrl" class="float-right" :height="dataHeight / 4">
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.targetName {
  font-size: 25px;
  top: 80%;
  left: 10px;
  position: relative;
  font-weight: bold;
  color: white;
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
</style>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "OverlayRouletteCondition",
  props: [ 'target', 'dataHeight' ],
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
