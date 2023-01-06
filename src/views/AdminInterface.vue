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
        <v-alert type="error" v-model="errorShown" border="start" closable>{{error}}</v-alert>
        <v-alert type="error" v-if="connectionIssues" border="start">
          No connection to the server. Make sure, you are still logged in, and refresh the page / reselect this match from the overview if problems persist.
        </v-alert>
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
                <li v-for="(player, index) of matchInfo.players" :key="player">
                  <b>{{sanetizedPlayers[index]}}:</b> <a :href="getPlayerLink(player)">{{ getPlayerLink(player) }}</a>
                </li>
                <li>
                  <b>Shoutcast-Overlay:</b> <a :href="getOverlayLink()">{{ getOverlayLink() }}</a> (1300px x 600px)
                </li>
                <li>
                  <b>Bingo-Overlay:</b> <a :href="getEventOverlayLink()">{{ getEventOverlayLink() }}</a> (1920px x 1080px)
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
                <li v-for="(player, index) of sanetizedPlayers" :key="index">
                  <v-text-field v-model="playerScores[index]" hide-details="true" density="compact" :label="player" @change="updateScores" type="number"></v-text-field>
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
        <v-select :items="gameModes" v-model="gameModeToAdd" :loading="roundAddLoading"></v-select>

        <v-container>
          <v-row>
            <v-col>
              <v-text-field label="Round starts" v-model="arrivingTimestamp" dense type="datetime-local"></v-text-field>
            </v-col>
            <v-col>
              <v-text-field label="Round duration" v-model="leavingTimestamp" dense type="number" suffix="min"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <v-btn @click="updateTimestamps">Update match timers</v-btn>

        <v-btn class="ml-10" @click="markMatchDone">Mark match as done</v-btn>
      </v-col>
      <v-col cols="5">
        <b>Rounds of this match:</b><br>
        <ol>
          <li v-for="(round, index) of matchInfo.rounds" :key="index">{{ round.title }} [{{ round.mode }}] - <v-chip>{{ roundTimers[index] }}</v-chip></li>
        </ol><br>

        <v-select label="End round immediately and award points" :items="endRoundItems" v-model="endRound"></v-select>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="10">

        <h1>{{currentRound.title}}</h1>
        <DoneButtonAdmin v-if="currentRound.mode === 'simpleDoneButton'" :players="sanetizedPlayers" :details="currentRound.additionalDetails" :matchId="this.matchId" @error="onError"></DoneButtonAdmin>
        <RouletteSpinAdmin v-if="currentRound.mode === 'rouletteSpin'" :players="sanetizedPlayers" :details="currentRound.additionalDetails" :matchId="this.matchId" @error="onError"></RouletteSpinAdmin>
        <BingoAdmin v-if="currentRound.mode === 'bingo'" :players="sanetizedPlayers" :details="currentRound.additionalDetails" :matchId="this.matchId" @error="onError"></BingoAdmin>
        <TimerAdmin v-if="currentRound.mode === 'timer'" :details="currentRound.additionalDetails"></TimerAdmin>
        <TwoSpinsAdmin v-if="currentRound.mode === 'twoSpins'" :players="sanetizedPlayers" :details="currentRound.additionalDetails" :matchId="this.matchId" @error="onError"></TwoSpinsAdmin>
        <SelectableSpinAdmin v-if="currentRound.mode === 'selectableSpin'" :players="sanetizedPlayers" :details="currentRound.additionalDetails" :matchId="this.matchId" @error="onError"></SelectableSpinAdmin>

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
import RouletteSpinAdmin from "@/components/GameModesAdmin/RouletteSpin.vue";
import TwoSpinsAdmin from "@/components/GameModesAdmin/TwoSpins.vue";
import BingoAdmin from "@/components/GameModesAdmin/Bingo.vue";
import TimerAdmin from "@/components/GameModesAdmin/Timer.vue";
import SelectableSpinAdmin from "@/components/GameModesAdmin/SelectableSpin.vue";
import { DateTime } from "luxon";

export default defineComponent({
  name: 'AdminInterface',
  components: {
    TimerAdmin,
    RouletteSpinAdmin,
    DoneButtonAdmin,
    BingoAdmin,
    AddRoundDialog,
    TwoSpinsAdmin,
    SelectableSpinAdmin,
  },
  data() {
    return {
      matchId: "",
      gameModes: [],
      matchInfo: {
        scores: [] as number[]
      },
      gameModeToAdd: "",
      addingRound: false,
      refreshTask: -1,
      arrivingTimestamp: "",
      leavingTimestamp: 0,
      matchDoneDialog: false,
      playerScores: [] as number[],
      players: [],
      roundTimers: [] as string[],
      endRound: undefined,
      error: "",
      errorShown: false,
      connectionIssues: false,
      discordPlayersMap: {} as { [key: string]: string },
      roundAddLoading: false,
    }
  },
  async created() {
    this.matchId = window.location.pathname.split("/").pop() as string;
    try {
      const gameModes = await get("/data/game_modes");
      this.gameModes = gameModes.data.game_modes;
    } catch {
      this.connectionIssues = true;
    }
    this.refreshTask = setInterval(this.updateData, 1000);
    await this.updateData();
    const users = await get('/data/users');
    this.discordPlayersMap = users.data;
  },
  beforeUnmount() {
    clearInterval(this.refreshTask);
  },
  methods: {
    getPlayerLink(playerName: string): string {
      return `${window.location.origin}/client/${this.matchId}/${encodeURIComponent(playerName)}`
    },
    getOverlayLink(): string {
      return `${window.location.origin}/overlay/${this.matchId}`
    },
    getEventOverlayLink(): string {
      return `${window.location.origin}/bingo-overlay/${this.matchId}`
      // return "";
    },
    async doneAddingRound(values: any, title: string) {
      if (values) {
        this.roundAddLoading = true;
        const resp = await post('/api/match/admin/' + this.matchId + '/addRound', {
          game_mode: this.gameModeToAdd,
          generatorOptions: values,
          title: title
        });
        this.roundAddLoading = false;
        if (resp.status !== 204) {
          this.onError("An error occured while creating the round.");
        }
        this.arrivingTimestamp = "";
        this.leavingTimestamp = 0;
        await this.updateData();
      }
      this.addingRound = false;
      this.gameModeToAdd = "";
    },
    async updateData() {
      try {
        const matchInfo = await get("/api/match/admin/" + this.matchId);
        if (matchInfo.status !== 200) {
          this.connectionIssues = true;
        } else {
          this.connectionIssues = false;
          if (JSON.stringify(this.matchInfo) !== JSON.stringify(matchInfo.data)) {
            this.playerScores = [...matchInfo.data.scores];
            this.players = matchInfo.data.players;
            this.matchInfo = matchInfo.data;
          }
        }
      } catch {
        this.connectionIssues = true;
        return;
      }

      this.updateRoundTimers();
    },
    async sendData() {
      await post('/api/match/update/' + this.matchId, this.matchInfo);
    },
    async updateScores() {
      this.matchInfo['scores'] = [...this.playerScores];
      await this.sendData();
    },
    async updateTimestamps() {
      const roundIndex = this.getCurrentRoundIndex();
      if (roundIndex >= 0) {
        const arrivingTS = DateTime.fromISO(this.arrivingTimestamp).toMillis();
        if (!isNaN(arrivingTS)) {
          (this.matchInfo as any).rounds[roundIndex].arrivingTimestamp = arrivingTS;
          if (this.leavingTimestamp === 0 || this.leavingTimestamp === undefined) {
            (this.matchInfo as any).rounds[roundIndex].leavingTimestamp = -1;
          } else {
            (this.matchInfo as any).rounds[roundIndex].leavingTimestamp = arrivingTS + (this.leavingTimestamp * 1000 * 60);
          }
        }
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
    getCurrentRoundIndex() {
      if ((this.matchInfo as any).rounds !== undefined) {
        let roundIndex = (this.matchInfo as any).rounds.length - 1;
        if (roundIndex >= 0) {
          return roundIndex;
        }
      }
      return -1;
    },
    updateRoundTimers() {
      (this.matchInfo as any).rounds.forEach((round: any, index: number) => {
        this.roundTimers[index] = this.getRoundStatus(round, index)
      });
    },
    getRoundStatus(round: any, index: number)  {
      if (index !== this.getCurrentRoundIndex()) {
        return "Finished";
      } else if (round.arrivingTimestamp < 0) {
        return "Not scheduled";
      } else if (DateTime.local().toMillis() < round.arrivingTimestamp) {
        const arrivingTime = DateTime.fromMillis(round.arrivingTimestamp);
        const nowTime = DateTime.local();
        const diff = arrivingTime.diff(nowTime, ['hours', 'minutes', 'seconds']);
        return `Arriving in ${diff.toFormat("hh:mm:ss")}`;
      } else if (round.leavingTimestamp < 0) {
        return "No time limit";
      } else if (DateTime.local().toMillis() < round.leavingTimestamp) {
        const arrivingTime = DateTime.fromMillis(round.leavingTimestamp);
        const nowTime = DateTime.local();
        const diff = arrivingTime.diff(nowTime, ['hours', 'minutes', 'seconds']);
        return `Leaving in ${diff.toFormat("hh:mm:ss")}`;
      } else if (DateTime.local().toMillis() > round.leavingTimestamp) {
        return "Finished";
      } else {
        return "Literally unknown. What did you to? Talk to Curry please."
      }
    },
    onError(error: string) {
      this.error = error;
      this.errorShown = true;
    },
  },
  watch: {
    gameModeToAdd(newGM) {
      if (newGM !== "") {
        this.addingRound = true;
      }
    },
    async endRound(newER) {
      if (newER !== undefined) {
        const roundIndex = this.getCurrentRoundIndex();
        if (roundIndex >= 0) {
          (this.matchInfo as any).rounds[roundIndex].leavingTimestamp = Date.now();
          if (newER >= 0) {
            this.playerScores[newER] += 2;
          } else if (newER === -2) {
            this.playerScores = this.playerScores.map(v => { return v + 1 });
          }
          await this.updateScores();
        }
        this.endRound = undefined;
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
    },
    endRoundItems(): unknown[] {
      let arr = this.sanetizedPlayers.map((p, idx) => { return {title: `End round and increase score of ${p} by 2`, value: idx} });
      arr.push({title: "End round and increase score of every player by 1", value: -2});
      arr.push({title: "End round and don't increase scores", value: -1});
      return arr;
    },
    sanetizedPlayers(): string[] {
      return this.players.map(player => {
        return this.discordPlayersMap[player] || player;
      });
    }
  }
})
</script>
