<template>
  <table>
    <tr v-for="y in 5" :key="y">
      <td v-for="x in 5" :key="x" @click="click(x,y)" :style="`height: ${tileHeight || '88' }px;`">
        <div :class="getClaimClass('red')" v-if="isTileClaimed(x,y,0)"></div>
        <div :class="getClaimClass('green')" v-if="isTileClaimed(x,y,1)"></div>
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
  height: 88px;
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

.redSquare {
  background-image: linear-gradient(#891B26, #4C1117);
  background-color: #4C1117;
}

.greenSquare {
  background-image: linear-gradient(#2D802C, #2B5D2A);
  background-color: #2B5D2A;
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

.greenSquareNonLock {
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
      return this.claimedTiles[(y - 1) * 5 + x - 1][player];
    },
    getClaimClass(color: string): string {
      if (this.mode === "Lockout") {
        return "coloredSquare " + color + "Square";
      } else {
        return "coloredSquare " + color + "Square " + color + "SquareNonLock";
      }
    },
    click(x: number, y: number) {
      this.$emit('click', x, y);
    }
  }
});
</script>
