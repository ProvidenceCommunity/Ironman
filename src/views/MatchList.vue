<template>
  <v-dialog v-model="creationDialog">
    <v-card width="500px" style="align-self: center">
      <v-card-title>Create match</v-card-title>
      <v-card-text>
        Players: <v-btn @click="players.push('')">+</v-btn><v-btn @click="players.pop()">-</v-btn>
        <v-combobox v-for="(player, index) in players" :key="index" :items="getSelectPlayers(players[index])" v-model="players[index]"></v-combobox>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="createMatch()">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <MatchEditDialog :showDialog="currentlyScheduling !== null" :match="currentlyScheduling" :schema="matchFields" @cancel="cancelEdit" @save="saveEdit"></MatchEditDialog>
  <v-container fluid>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="2">
        <v-card>
          <v-list-item :prepend-avatar="avatar">
            <v-list-item-title>Logged in as<br>{{username}}</v-list-item-title>
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
                  <th>Timestamp</th>
                  <th>Players</th>
                  <th v-for="column in schemaHeaders" :key="column.name">{{ column.title }}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="match of displayedMatches" :key="match.id">
                  <td>{{ getTimestamp(match.timestamp) }}</td>
                  <td>{{ getPlayers(match.players) }}</td>
                  <td v-for="column in schemaHeaders" :key="column.name">{{ match.schedulingData[column.name] }}</td>
                  <td>
                    <v-btn fab x-small color="primary" @click="editMatch(match.id)"><v-icon>mdi-pencil</v-icon></v-btn>
                    <v-btn fab x-small color="green" :href="'/admin/' + match.id"><v-icon>mdi-arrow-right-circle</v-icon></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script>
import { defineComponent } from "vue";
import { get, post } from '@/http';
import { DateTime } from 'luxon';
import MatchEditDialog from "@/components/MatchEditDialog.vue";

export default defineComponent({
  name: 'MatchList',
  components: { MatchEditDialog },
  data() {
    return {
      username: '',
      avatar: '',
      matches: [],
      showFinished: false,
      creationDialog: false,
      players: [],
      discordPlayersMap: { roles: {}, members: {} },
      matchFields: [],

      currentlyScheduling: null
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
    const users = await get('/data/users');
    this.discordPlayersMap = users.data;
    const matchSchema = await get('/data/schema');
    if (matchSchema.status !== 200) {
      await this.$router.push("/");
      return;
    }
    this.matchFields = matchSchema.data;
    await this.updateList();
  },
  methods: {
    async updateList() {
      const matches = await get('/data/matches');
      this.matches = matches.data.matches;
    },
    async createMatch() {
      this.creationDialog = false;
      await post("/api/match/create", {players: this.players.map(player => {
        const discordIndex = Object.values(this.discordPlayersMap).findIndex(e => { return e === player });
        if (discordIndex > 0) {
          return Object.keys(this.discordPlayersMap)[discordIndex];
        }
        return player;
      })});
      await this.updateList();
    },
    openMatchCreator() {
      this.players = [];
      this.creationDialog = true;
    },
    editMatch(matchId) {
      this.currentlyScheduling = this.matches.filter(e => {return e.id === matchId})[0];
    },
    async saveEdit(matchId, data) {
      console.log(data);
      await post("/api/match/schedule/" + matchId, data);
      await this.updateList();
      this.currentlyScheduling = null;
    },
    cancelEdit() {
      this.currentlyScheduling = null;
    },
    getTimestamp(ts) {
      if (ts <= 0) {
        return "Not scheduled";
      } else {
        return DateTime.fromMillis(ts).toLocaleString(DateTime.DATETIME_SHORT);
      }
    },
    getPlayers(players) {
      return players.map(player => {
        return this.discordPlayersMap[player] || player;
      }).join(", ");
    },
    getSelectPlayers(val) {
      if (val.length < 2 || Object.values(this.discordPlayersMap).includes(val)) {
        return []
      }
      return Object.values(this.discordPlayersMap)
    }
  },
  computed: {
    schemaHeaders() {
      return this.matchFields.filter(e => e.displayInOverview);
    },
    displayedMatches() {
      return this.matches.filter(e => { return !e.finished || this.showFinished });
    }
  }
})
</script>
