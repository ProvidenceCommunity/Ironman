<template>
  <v-container fluid>
    <v-row class="mt-10">
      <v-spacer></v-spacer>
      <v-col cols="6" align="center">
        <h1>Ironman Platform</h1>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="6" align="center">
        <h3>Please login to administrate matches.</h3>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="6" align="center">
        <v-btn href="/auth/discord_login" color="secondary"><v-icon start icon="mdi-discord"></v-icon>Login with discord</v-btn><br>
        <router-link to="/login">Local login</router-link>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
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
