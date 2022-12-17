<template>
  <v-img :src="image" :width="width" :height="height"></v-img>
</template>

<script lang="ts">
import {defineComponent} from "vue";
export default defineComponent({
  name: 'OverlayNationalityFlag',
  props: ['player', 'width', 'height'],
  data() {
    return {
      imageMap: {
        "Crewdy": "gb",
        "Meekah": "ca",
        "Nezuko Chan": "gb",
        "Phanium": "us",
        "TK47": "tn",
        "MattySpice04": "us",
        "yoshi ♡": "us",
        "420": "gb",
        "Yannini": "de",
        "linux_penguin": "gb",
        "Pigiero": "nl",
        "Some Random Person": "no",
        "In4Fun": "hu",
        "Jokerj": "gb"
      } as {[player: string]: string}
    }
  },
  computed: {
    image() {
      return `https://flagicons.lipis.dev/flags/1x1/${this.imageMap[this.player]}.svg`;
    }
  }
})
</script>