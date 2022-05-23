<template>
  <v-container fluid>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="2">
        <v-card>
          <v-card-header>
            <v-card-header-text>
              <v-card-title>Logged in as<br>{{ username }}</v-card-title>
            </v-card-header-text>
          </v-card-header>
          <v-card-text>

            <v-avatar size="x-large"><img :src="avatar"></v-avatar>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { get } from '@/http';

export default defineComponent({
  name: 'MatchList',
  data() {
    return {
      username: '',
      avatar: '',
      matches: []
    }
  },
  async created() {
    const userInfo = await get('/data/me');
    if (userInfo.status !== 200) {
      await this.$router.push('/');
      return;
    }
    this.username = userInfo.data.username;
    this.avatar = userInfo.data.avatar;
  }
})
</script>
