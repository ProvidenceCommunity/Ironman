<template>
  <AddRoundDialog v-if="addingRound" :game_mode="gameModeToAdd" @done="doneAddingRound"/>
  <v-dialog v-model="matchDoneDialog" persistent>
    <v-card>
      <v-card-text>Are you sure you want to mark this match as done and return to the main page?</v-card-text>
      <v-card-actions>
        <v-btn @click="matchDoneDialog = false">Cancel</v-btn>
        <v-btn @click="confirmDone">Confirm & return</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
                  <v-text-field v-model="matchInfo.scores[index]" hide-details="true" density="compact" :label="player" @change="sendData"></v-text-field>
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
        <b>Add new round:</b><br>
        <v-select :items="gameModes" v-model="gameModeToAdd" ></v-select>
        <v-btn @click="markMatchDone">Mark match as done</v-btn>
      </v-col>
      <v-col cols="5">
        <b>Rounds of this match:</b><br>
        <ol>
          <li v-for="(round, index) of matchInfo.rounds" :key="index">{{ round.mode }} - <v-chip>{{ getRoundStatus(round, index) }}</v-chip></li>
        </ol>
        <v-text-field label="Arrival timestamp" v-model="arrivingTimestamp" dense @change="updateTimestamps"></v-text-field><br>
        <v-text-field label="Departure timestamp" v-model="leavingTimestamp" dense @change="updateTimestamps"></v-text-field>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="10">

        <DoneButtonAdmin v-if="currentRound.mode === 'simpleDoneButton'" :players="matchInfo.players" :details="currentRound.additionalDetails" :matchId="this.matchId"></DoneButtonAdmin>

      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { get, post } from '@/http';
import AddRoundDialog from '@/components/AddRoundDialog.vue';
import DoneButtonAdmin from "@/components/GameModesAdmin/DoneButton.vue";

export default defineComponent({
  name: 'AdminInterface',
  components: {
    DoneButtonAdmin,
    AddRoundDialog
  },
  data() {
    return {
      matchId: "",
      gameModes: [],
      matchInfo: {},
      gameModeToAdd: "",
      addingRound: false,
      refreshTask: -1,
      arrivingTimestamp: 0,
      leavingTimestamp: 0,
      matchDoneDialog: false
    }
  },
  async created() {
    this.matchId = window.location.pathname.split("/").pop() as string;
    const gameModes = await get("/data/game_modes");
    this.gameModes = gameModes.data.game_modes;
    this.refreshTask = setInterval(this.updateData, 1000);
  },
  beforeUnmount() {
    clearInterval(this.refreshTask);
  },
  methods: {
    getPlayerLink(playerName: string): string {
      return `${window.location.origin}/client/${this.matchId}/${playerName}`
    },
    async doneAddingRound(values: any) {
      await post('/api/match/admin/' + this.matchId + '/addRound', {
        game_mode: this.gameModeToAdd,
        generatorOptions: values
      });
      await this.updateData();
      this.addingRound = false;
      this.gameModeToAdd = "";
    },
    async updateData() {
      const matchInfo = await get("/api/match/admin/" + this.matchId);
      this.matchInfo = matchInfo.data;
    },
    async sendData() {
      await post('/api/match/update/' + this.matchId, this.matchInfo);
    },
    async updateTimestamps() {
      const roundIndex = this.getCurrentRoundIndex();
      if (roundIndex >= 0) {
        (this.matchInfo as any).rounds[roundIndex].arrivingTimestamp = this.arrivingTimestamp;
        (this.matchInfo as any).rounds[roundIndex].leavingTimestamp = this.leavingTimestamp;
        await this.sendData();
      }
    },
    markMatchDone() {
      this.matchDoneDialog = true;
    },
    async confirmDone() {
      (this.matchInfo as any).finished = true;
      await this.sendData();
      this.matchDoneDialog = false;
      await this.$router.push("/admin");
    },
    getRoundStatus(round: any, index: number) {
      if (index === this.getCurrentRoundIndex()) {
        return "Currently running";
      } else {
        return "Finished";
      }
    },
    getCurrentRoundIndex() {
      if ((this.matchInfo as any).rounds !== undefined) {
        let roundIndex = (this.matchInfo as any).rounds.length - 1;
        if (roundIndex >= 0) {
          return roundIndex;
        }
      }
      return -1;
    }
  },
  watch: {
    gameModeToAdd(newGM, oldGM) {
      if (newGM !== "") {
        this.addingRound = true;
      }
    }
  },
  computed: {
    currentRound(): unknown {
      let mInfo = this.matchInfo as any;
      if (mInfo.rounds !== undefined) {
        let roundIndex = mInfo.rounds.length - 1;
        if (roundIndex >= 0) {
          return mInfo.rounds[roundIndex];
        }
      }
      return { mode: "" };
    }
  }
})
</script>
