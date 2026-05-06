<template>
    <div class="grid">
        <div class="grid-target" :style="`background: url(${ target.target.tileUrl }) center center / cover no-repeat;`">
            <div class="target-name" :class="{ 'ntko': hasNtko }">
                <div class="smaller-text">Target{{ hasNtko ? ' - NTKO' : '' }}</div>
                <div class="larger-text bold">{{ target.target.name }}</div>
            </div>
        </div>
        <div class="grid-weapon">
            <div class="smaller-text">Eliminate using</div>
            <div class="bold">{{ buildKillMethod() }}</div>
        </div>
        <div class="grid-disguise">
            <div class="smaller-text">Wear disguise</div>
            <div class="bold">{{ target.disguise.name }}</div>
        </div>
        <div class="grid-weapon-img" :style="buildBackgroundImage(target.killMethod.tileUrl)" />
        <div class="grid-disguise-img" :style="buildBackgroundImage(target.disguise.tileUrl)" />
    </div>

    <!-- <div style="width: 100%; height: 100%;">
        <v-container style="width: 100%; height: 100%;">
            <v-row no-gutters style="height: 100%;">
                <v-col>
                    <v-sheet class="target" :style="`background: url(${ target.target.tileUrl }) center center / cover no-repeat;`">
                        <span class="targetName">{{ target.target.name }}</span>
                        <span v-if="hasNtko" class="complication">
                        NTKO
                        </span>
                    </v-sheet>
                </v-col>
                <v-col class="height: 100%;">
                    <v-container>
                        <v-row no-gutters>
                            <v-col>
                                <div class="conditionTitle">Eliminate using</div>
                                <div class="conditionDetail">{{ buildKillMethod() }}</div>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col>
                                <div class="conditionTitle">Wear disguise</div>
                                <div class="conditionDetail">{{ target.disguise.name }}</div>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col>
                                <img :src="target.killMethod.tileUrl" style="width: 100%;">
                            </v-col>
                            <v-col>
                                <img :src="target.disguise.tileUrl" style="width: 100%;">
                            </v-col>
                        </v-row>
                    </v-container>
                </v-col>
            </v-row>
        </v-container>
    </div> -->
</template>
  
<style scoped>
    .grid {
        display: grid;
        height: 100%;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(3, 1fr);
    }
    .grid-target {
        grid-column: 1 / 3;
        grid-row: 1 / 4;
        position: relative;
    }
    .grid-weapon {
        grid-column: 3 / 5;
        grid-row: 1;
        background-color: rgba(0, 0, 0, 0.4);
        color: white;
        padding: 5px;
    }
    .grid-disguise {
        grid-column: 3 / 5;
        grid-row: 2;
        background-color: rgba(0, 0, 0, 0.4);
        color: white;
        padding: 5px;
    }
    .grid-weapon-img {
        grid-column: 3;
        grid-row: 3;
        width: 100%;
        height: 100%;
    }
    .grid-disguise-img {
        grid-column: 4;
        grid-row: 3;
        width: 100%;
        height: 100%;
    }
    .target-name {
        position: absolute;
        bottom: 0px;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.4);
        color: white;
        width: 100%;
    }
    .target-name.ntko {
        background-color: rgba(255, 0, 0, 0.4);
    }
    .larger-text {
        font-size: 140%;
    }
    .smaller-text {
        font-size: 80%;
    }
    .bold {
        font-weight: bold;
    }


  .target {
    position: relative;
    height: 100%;
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
    name: "WideOverlayRouletteCondition",
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
      },
      buildBackgroundImage(img: string) {
        return `background: url(${ img }) center 35% / cover no-repeat;`
      }
    },
    computed: {
      hasNtko() {
        return this.target.complications.filter((comp: {name: string}) => comp.name === "No Target Pacification").length > 0;
      }
    }
  })
  </script>
  