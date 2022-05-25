<template>
  <v-container fluid>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="2">
        <v-card>
          <v-list-item>
            <v-list-item-title>Logged in as<br>{{username}}</v-list-item-title>
            <v-list-item-avatar size="64"><img :src="avatar"></v-list-item-avatar>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card>
          <v-card-title>Matches</v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col><v-checkbox v-model="showFinished" label="Show finished matches" hide-details></v-checkbox></v-col>
                <v-col align-self="end"><v-btn class="float-right">Add match</v-btn></v-col>
              </v-row>
            </v-container>
            <v-table>
              <thead>
                <tr>
                  <th>Players</th>
                  <th>Finished?</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="match in matches" :key="match.id">
                  <tr v-if="!match.finished || showFinished">
                    <td>{{ match.players.join(", ") }}</td>
                    <td>{{ match.finished }}</td>
                    <td></td>
                  </tr>
                </template>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-spacer></v-spacer>
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
      matches: [
        {
          id: "abc",
          players: ["Player one", "player two"],
          finished: false
        },
        {
          id: "cde",
          players: ["Player three", "player four", "player five", "player six"],
          finished: false
        },
        {
          id: "adsdw",
          players: ["Player one", "player six"],
          finished: true
        }
      ],
      showFinished: false
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
