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
        "Phanium": "https://cdn.discordapp.com/guilds/928821020738084965/users/708231270341148744/avatars/366248afb6cef0f66c6675c7a8f01c7a.png",
        "Jokerj": "https://cdn.discordapp.com/avatars/700245922722087012/55d0d1ff73acfba6312f93cfe74ab1ca.png",
        "Meekah": "https://cdn.discordapp.com/avatars/201065244297003008/8393738b125c653af3295fcf933e1a09.png",
        "ChromeX": "https://cdn.discordapp.com/avatars/326411676511502351/d8300acf63bf4019248729d6de3b33c8.png",
        "linux_penguin": "https://cdn.discordapp.com/avatars/603970242053537824/79ddd41a42f7aae0dcfb0ce7e614ebd7.png",
        "420": "https://cdn.discordapp.com/avatars/486226753203994628/972627c644993adcc18b033eedb16129.png",
        "GiggsRH": "https://cdn.discordapp.com/avatars/383663791931392001/b098fd123679687d873ac53de8f9d519.png",
        "Yannini": "https://cdn.discordapp.com/avatars/229973032234516480/6a70e678da03c2b04bc0184137907b60.png",
        "In4Fun": "https://cdn.discordapp.com/avatars/412288950854746113/b75e5bca36968107a440464821dea3e3.png",
        "DaniButa": "https://cdn.discordapp.com/avatars/694606609845846058/a_6203397704299b4ac5b4fb97d934b840.png",
        "Pigiero": "https://cdn.discordapp.com/avatars/161873616684843030/83af26ce9cfa8d04544d01bc4b4d9c0e.png",
        "Blithe": "https://cdn.discordapp.com/avatars/495197209147605012/1aaa052d16b4a84a83e3dc62c548f733.png",
        "yoshi ♡": "https://cdn.discordapp.com/avatars/287785246336876545/a66f6efc85dba164dd285fd20d1c1f14.png",
        "ThatObserver": "https://cdn.discordapp.com/avatars/247092196874911744/a_f1ea15ad693854392ee661d4975280c5.png",
        "crewdy": "https://cdn.discordapp.com/avatars/340040555234983938/98a46ab27f182a2b9fc1b7c2bf3cf378.png"
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