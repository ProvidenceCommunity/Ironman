<template>
  <v-img :src="image" :width="width" :height="height"></v-img>
</template>

<script lang="ts">
import {defineComponent} from "vue";
export default defineComponent({
  name: 'OverlayProfileImage',
  props: ['player', 'width', 'height'],
  data() {
    return {
      imageMap: {
        "Jokerj": "https://cdn.discordapp.com/avatars/700245922722087012/1933c32358203fef9859dadd99d9559b.png",
        "Soviet": "https://cdn.discordapp.com/avatars/623597622271279126/2edad6531bd817e4a0fe2b0b7bdbe404.png",
        "Meekah": "https://cdn.discordapp.com/avatars/201065244297003008/fa791506a847eb4a1c3c4b3bdf178ccb.png",
        "Phanium": "https://cdn.discordapp.com/avatars/789996935007830078/fc46235c29d93260f301ccc8634fde90.png",
        "linux_penguin": "https://cdn.discordapp.com/avatars/603970242053537824/b803a393ab9032f34eb5aa9685636215.png",
        "TheObserver": "https://cdn.discordapp.com/avatars/247092196874911744/1c850ff9f96c2927c8ec278ff3f86267.png",
        "Yannini": "https://cdn.discordapp.com/avatars/229973032234516480/942be0d99c3cad00192b06451b8830e1.png",
        "Ashton": "https://cdn.discordapp.com/avatars/294606703943745537/bfd3e236952cf31fce85b3a8ae7e64ec.png",
        "MattySpice": "https://cdn.discordapp.com/avatars/244943203076145153/f61e5dcbcfa8aefff3a2cb6e4ea5eb6a.png",
        "Nezuko Chan": "https://cdn.discordapp.com/avatars/577924506471890976/d83492c00357d7e0ca4c1724879aa919.png",
        "ChrisX3": "https://cdn.discordapp.com/avatars/355182845141975042/f8911b311cea855e89fdd30ac267e982.png",
        "Papierfresse": "https://cdn.discordapp.com/avatars/795428895284396052/939ef3aa720f36b541e6852263b75475.png",
        "k-kaneta": "https://cdn.discordapp.com/avatars/459789445604966400/14b58e4259e70e80800dc1e0d968a2e1.png",
        "Redfox": "https://cdn.discordapp.com/avatars/848053929971548180/37127a1cde3c1a4e3882363cad597d43.png",
        "zRune": "https://cdn.discordapp.com/avatars/540007236055859200/eb90e5e0f35f771f012229f91f2f2e13.png"
      } as {[player: string]: string}
    }
  },
  computed: {
    image() {
      return this.imageMap[this.player];
    }
  }
})
</script>