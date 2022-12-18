<template>
  <table>
    <tr v-for="y in 5" :key="y">
      <td v-for="x in 5" :key="x" @click="click(x,y)" :style="`height: ${tileHeight || '88' }px;`">
        <div :class="getHalfClaimClass('red')" v-if="isTileHalfClaimed(x,y,0)"></div>
        <div :class="getHalfClaimClass('navy')" v-if="isTileHalfClaimed(x,y,1)"></div>
        <div :class="getClaimClass('red')" v-if="isTileClaimed(x,y,0)"></div>
        <div :class="getClaimClass('navy')" v-if="isTileClaimed(x,y,1)"></div>
        <div class="textField">{{ getTile(x,y) }}</div>
      </td>
    </tr>
  </table>
</template>

<style scoped>
table {
  border-collapse: collapse;
}
tr {
  border: 1px solid #ffffff;
  margin: 0;
  padding: 0;
}

td {
  margin: 0;
  padding: 0;
  border: 1px solid #666666;
  width: 96px;
  max-width: 96px;
  max-height: 88px;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  position: relative;
  text-align: center;
  vertical-align: top;
  background-color: #181818;
  color: white;
}

.textField {
  left: 0px;
  right: 0px;
  position: absolute;
  line-height: 20px;
  top: 50%;
  transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
}

.navySquare {
  background-image: linear-gradient(#0d48b5, #022b75);
  background-color: #022b75;
}

.redSquare {
  background-image: linear-gradient(#891B26, #4C1117);
  background-color: #4C1117;
}

.greenSquare {
  background-image: linear-gradient(#2D802C, #2B5D2A);
  background-color: #2B5D2A;
}

.redHCSquare {
  border-width: 4px;
  border-style: solid;
  border-color: #891B26;
}

.greenHCSquare {
  border-width: 4px;
  border-style: solid;
  border-color: #2D802C;
}

.navyHCSquare {
  border-width: 4px;
  border-style: solid;
  border-color: #0d48b5;
}

.coloredSquare {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
}

.redSquareNonLock {
  transform: skew(-45deg) translateX(0%);
  transform-origin: 0px 0px;
}

.navySquareNonLock {
  transform: skew(-45deg) translateX(0%);
  transform-origin: 0px 96px;
}

</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "BingoCard",
  props: ['card', 'claimedTiles', 'mode', 'tileHeight'],
  emits: ['click'],
  data() {
    return {};
  },
  methods: {
    getTile(x: number, y: number): string {
      return this.card[(y - 1) * 5 + x - 1];
    },
    isTileClaimed(x: number, y: number, player: number): boolean {
      return this.claimedTiles[(y - 1) * 5 + x - 1][player] == 1;
    },
    isTileHalfClaimed(x: number, y: number, player: number): boolean {
      return this.claimedTiles[(y - 1) * 5 + x - 1][player] == 2;
    },
    getClaimClass(color: string): string {
      if (this.mode === "Lockout") {
        return "coloredSquare " + color + "Square";
      } else {
        return "coloredSquare " + color + "Square " + color + "SquareNonLock";
      }
    },
    getHalfClaimClass(color: string): string {
      if (this.mode === "Lockout") {
        return "coloredSquare " + color + "HCSquare";
      } else {
        return "coloredSquare " + color + "HCSquare " + color + "SquareNonLock";
      }
    },
    click(x: number, y: number) {
      this.$emit('click', x, y);
    }
  }
});
</script>
