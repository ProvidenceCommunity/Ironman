<template>
  Please login.
  <a href="/auth/discord_login">Login with discord</a>
  <router-link to="/local_login">Local login</router-link>
</template>

<script lang='ts'>
import { defineComponent } from "vue";
import { get } from '@/http'

export default defineComponent({
  name: 'Index',
  data() {
    return {}
  },
  async created() {
    const userInfo = await get('/data/me');
    if (userInfo.status === 200) {
      await this.$router.push('/admin');
    }
  }
})

</script>
