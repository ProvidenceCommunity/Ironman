<template>
  <v-app :theme="getTheme" :style="getStyle">
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',

  data () {
    return {}
  },
  computed: {
    getTheme() {
      return this.$route.name === "overlay" ? 'light' : 'dark';
    },
    getStyle() {
      return this.$route.name === "overlay" ? "background: none;" : "";
    }
  }
})
</script>
