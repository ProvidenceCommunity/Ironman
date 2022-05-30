<template>
  <AddRoundDialog v-if="addingRound" :game_mode="gameModeToAdd" @done="doneAddingRound"/>
  <v-container fluid>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="10">
        <h1>Match {{ matchId }}</h1>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="5">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>Player links</v-expansion-panel-title>
            <v-expansion-panel-text>
              <ul>
                <li v-for="player of matchInfo.players" :key="player">
                  <b>{{player}}:</b> <a :href="getPlayerLink(player)">{{ getPlayerLink(player) }}</a>
                </li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col cols="5">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>Player scores</v-expansion-panel-title>
            <v-expansion-panel-text>
              <ul>
                <li v-for="(player, index) of matchInfo.players" :key="index">
                  <v-text-field v-model="matchInfo.scores[index]" hide-details="true" density="compact" :label="player"></v-text-field>
                </li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="5">
        Add new round:<br>
        <v-select :items="gameModes" v-model="gameModeToAdd" ></v-select>
        Mark match as done
      </v-col>
      <v-col cols="5">
        Previous rounds
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { get } from '@/http';
import AddRoundDialog from '@/components/AddRoundDialog.vue';

export default defineComponent({
  name: 'AdminInterface',
  components: {
    AddRoundDialog
  },
  data() {
    return {
      matchId: "",
      gameModes: ["test"],
      matchInfo: {},
      gameModeToAdd: "",
      addingRound: false
    }
  },
  async created() {
    this.matchId = window.location.pathname.split("/").pop() as string;
    const matchInfo = await get("/api/match/admin/" + this.matchId);
    const gameModes = await get("/data/game_modes");
    this.gameModes = gameModes.data.game_modes;
    this.matchInfo = matchInfo.data;
  },
  methods: {
    getPlayerLink(playerName: string): string {
      return `${window.location.origin}/match/${this.matchId}/${playerName}`
    },
    async doneAddingRound(values: any) {
      console.log(values);
      this.addingRound = false;
      this.gameModeToAdd = "";
    }
  },
  watch: {
    gameModeToAdd(newGM, oldGM) {
      console.log(oldGM);
      console.log(newGM);
      if (newGM !== "") {
        this.addingRound = true;
      }
    }
  }
})
</script>
