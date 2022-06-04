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
        "CurryMaker": "https://static-cdn.jtvnw.net/jtv_user_pictures/6c800651-6037-492a-9bbb-4a70e39e89d1-profile_image-70x70.png"
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
