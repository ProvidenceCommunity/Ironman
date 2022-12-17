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
        "Crewdy": "https://cdn.discordapp.com/avatars/340040555234983938/4eae170ed195adb35e7ba07d7846bc3d.png",
        "Meekah": "https://cdn.discordapp.com/avatars/201065244297003008/8393738b125c653af3295fcf933e1a09.png",
        "Nezuko Chan": "https://cdn.discordapp.com/avatars/577924506471890976/917decfbaa9a0368bf6335f30f30f97a.png",
        "Phanium": "https://cdn.discordapp.com/avatars/708231270341148744/c6b2190a21f11a3bdda42874399df25b.png",
        "TK47": "https://cdn.discordapp.com/avatars/509023924470808587/55bc10ced2891aa2fb3437703596aa73.png",
        "MattySpice04": "https://cdn.discordapp.com/avatars/244943203076145153/5ebb86dad93130a30e2c3f879ce2ae21.png",
        "yoshi ♡": "https://cdn.discordapp.com/avatars/287785246336876545/71b42bc1f2a34cd954fa92132dbc49c3.png",
        "420": "https://cdn.discordapp.com/avatars/486226753203994628/972627c644993adcc18b033eedb16129.png",
        "Yannini": "https://cdn.discordapp.com/avatars/229973032234516480/1d902af804aa78a3548c0ce91e51ef0a.png",
        "linux_penguin": "https://cdn.discordapp.com/avatars/603970242053537824/09d21a5eadbd7f8c79d788a5147d412a.png",
        "Pigiero": "https://cdn.discordapp.com/avatars/161873616684843030/f9eb9e7255a2fad51d9ec97deb3d7560.png",
        "Some Random Person": "https://cdn.discordapp.com/guilds/928821020738084965/users/247360708562518016/avatars/30230ae2dd832bb86984c7ab9e1e3401.png",
        "In4Fun": "https://cdn.discordapp.com/avatars/412288950854746113/4c66bdb872631ccb1df0b3f8cd1a7cea.png",
        "Jokerj": "https://cdn.discordapp.com/avatars/700245922722087012/0a460f40f90619aebdbc921b1537eb97.png"
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