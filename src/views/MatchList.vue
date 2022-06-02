<template>
  <v-dialog v-model="creationDialog">
    <v-card>
      <v-card-title>Create match</v-card-title>
      <v-card-text>
        Players: (One per line)
        <v-textarea v-model="players"></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="createMatch()">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
                 <v-col align-self="end"><v-btn class="float-right" @click="openMatchCreator()">Add match</v-btn></v-col>
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
                    <td><a :href="'/admin/' + match.id">Administrate</a></td>
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
import { get, post } from '@/http';

export default defineComponent({
  name: 'MatchList',
  data() {
    return {
      username: '',
      avatar: '',
      matches: [],
      showFinished: false,
      creationDialog: false,
      players: ""
    }
  },
  async created() {
    // TODO: Debug call, remove me!
    await get('/auth/local_login');
    const userInfo = await get('/data/me');
    if (userInfo.status !== 200) {
      await this.$router.push('/');
      return;
    }
    this.username = userInfo.data.username;
    this.avatar = userInfo.data.avatar;
    await this.updateList();
  },
  methods: {
    async updateList() {
      const matches = await get('/data/matches');
      this.matches = matches.data.matches;
    },
    async createMatch() {
      this.creationDialog = false;
      await post("/api/match/create", {players: this.players.split("\n"), scoringType: 0});
      await this.updateList();
    },
    openMatchCreator() {
      this.players = "";
      this.creationDialog = true;
    }
  }
})
</script>
