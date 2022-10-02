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
        "Jokerj": "https://cdn.discordapp.com/avatars/700245922722087012/fb1033c2168314ff3a9c67da4c312069.png",
        "Phanium": "https://cdn.discordapp.com/avatars/708231270341148744/b443bc1b200b7a9aab95c43faddda269.png",
        "Papierfresse": "https://cdn.discordapp.com/avatars/795428895284396052/1a05601b4eb3bb7e093ac5555aeffd69.png",
        "Moo": "https://cdn.discordapp.com/avatars/168470987031969792/ac51942a287af7c674f0a862dfacf464.png",
        "Mando": "https://cdn.discordapp.com/avatars/84310728411979776/0b99cbbda1a45a54f76ad2fe87e0ab5c.png",
        "Crewdy": "https://cdn.discordapp.com/avatars/340040555234983938/99fb6f5ad39875322f9ce9d335c07871.png",
        "Soviet": "https://cdn.discordapp.com/avatars/623597622271279126/2edad6531bd817e4a0fe2b0b7bdbe404.png",
        "lewis": "https://cdn.discordapp.com/avatars/603668006358351872/07e574fd499d46d1ae06698113d83b0a.png",
        "Nezuko Chan": "https://cdn.discordapp.com/avatars/577924506471890976/4782401624b7ff59facbc60cf853aa8b.png",
        "Rocky": "https://cdn.discordapp.com/avatars/294104724469448704/77668832574283cf7dddf43134aa97f5.png",
        "Meekah": "https://cdn.discordapp.com/avatars/201065244297003008/f440551f2b695c295e93116c4b85a1d1.png",
        "zRune": "https://cdn.discordapp.com/avatars/540007236055859200/e20451c335a2be5c180d14e94203cde2.png",
        "Zionicle": "https://cdn.discordapp.com/avatars/176819898066927616/7dbdae89da5a9155cd6bae510d188b18.png",
        "Sparkles": "https://cdn.discordapp.com/avatars/289099568384180225/2e2702c01bf8781a47426dfd60ca3513.png",
        "Fe2o3": "https://cdn.discordapp.com/avatars/961718533811736587/de18b3d1931a7d248f360d2e5aefe4e5.png",
        "Ebramahdi": "https://cdn.discordapp.com/avatars/771038569342959656/231584116f512a1544309914ef684328.png",
        "MattySpice": "https://cdn.discordapp.com/avatars/244943203076145153/5ebb86dad93130a30e2c3f879ce2ae21.png",
        "Redfox": "https://cdn.discordapp.com/avatars/848053929971548180/37127a1cde3c1a4e3882363cad597d43.png",
        "In4Fun": "https://cdn.discordapp.com/avatars/412288950854746113/fe17ca7bff8b8f2d3bf11380ce4911d1.png",
        "ThatObserver": "https://cdn.discordapp.com/avatars/247092196874911744/1c850ff9f96c2927c8ec278ff3f86267.png",
        "ChrisX3": "https://cdn.discordapp.com/avatars/355182845141975042/f8911b311cea855e89fdd30ac267e982.png",
        "GKPunk": "https://cdn.discordapp.com/avatars/171011576822890497/62a817fd4fdec2ae8162232cff3a228d.png",
        "Some Random Person": "https://cdn.discordapp.com/guilds/928821020738084965/users/247360708562518016/avatars/30230ae2dd832bb86984c7ab9e1e3401.png",
        "ChromeX": "https://cdn.discordapp.com/avatars/326411676511502351/8f3a99f50603f3f550745dde2cc17a66.png",
        "Blithe": "https://cdn.discordapp.com/avatars/495197209147605012/1aaa052d16b4a84a83e3dc62c548f733.png",
        "Meme Junkie": "https://cdn.discordapp.com/avatars/211380658029854720/6deba9af3920f47aad9315f0daf5dfaf.png",
        "Rommel of the Far East": "https://cdn.discordapp.com/avatars/438469962147954688/1158f013eafb4f2db3f36031eb47ee37.png",
        "The_Rieper_47": "https://cdn.discordapp.com/avatars/965361108103876698/0eb24c362b6f54997bc3eb022fb3856a.png",
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