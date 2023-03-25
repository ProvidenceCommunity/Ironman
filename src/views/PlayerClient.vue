<template>
  <v-container fluid>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="10">
        <v-alert type="error" v-model="errorShown" border="start" closable>{{error}}</v-alert>
        <v-alert type="error" v-if="connectionIssues" border="start">
          No connection to the server. Make sure you have a stable network connection and refresh the page / contact your match admin if the issue persists.
        </v-alert>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row v-for="i in Math.ceil(matchInfo.players.length/2)" :key="i">
      <v-spacer></v-spacer>
      <v-col cols="3"><b style="font-size: 20pt;">{{ matchInfo.scores[2*(i-1)] }} - {{ matchInfo.players[2*(i-1)] }}</b></v-col>
      <v-spacer></v-spacer>
      <v-col cols="3"><b style="font-size: 20pt;" v-if="matchInfo.players.length > (2*[i-1]+1)" class="float-right">{{ matchInfo.players[2*(i-1)+1] }} - {{ matchInfo.scores[2*(i-1)+1] }}</b></v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="10">
        <div v-if="this.matchInfo.roundLive">
          <CountdownBar :total-time="this.matchInfo.totalMatchTime" :time-remaining="this.matchInfo.countdown"></CountdownBar>
          <DoneButtonPlayer v-if="matchInfo.currentGameMode === 'simpleDoneButton'" :matchId="this.matchId" :player="this.player" :details="this.matchInfo.round" @error="onError"></DoneButtonPlayer>
          <RouletteSpinPlayer v-else-if="matchInfo.currentGameMode === 'rouletteSpin'" :matchId="this.matchId" :player="this.player" :details="this.matchInfo.round" @error="onError"></RouletteSpinPlayer>
          <BingoPlayer v-else-if="matchInfo.currentGameMode === 'bingo'" :matchId="this.matchId" :player="this.player" :details="this.matchInfo.round" :players="this.matchInfo.players" @error="onError"></BingoPlayer>
          <TimerPlayer v-else-if="matchInfo.currentGameMode === 'timer'" :details="this.matchInfo.round"></TimerPlayer>
          <TwoSpinsPlayer v-else-if="matchInfo.currentGameMode === 'twoSpins'" :matchId="this.matchId" :player="this.player" :details="this.matchInfo.round" @error="onError"></TwoSpinsPlayer>
          <SelectableSpinPlayer v-else-if="matchInfo.currentGameMode === 'selectableSpin'" :matchId="this.matchId" :player="this.player" :details="this.matchInfo.round" @error="onError"></SelectableSpinPlayer>
          <RelayPlayer v-else-if="matchInfo.currentGameMode === 'relay'" :matchId="matchId" :player="player" :details="matchInfo.round" @error="onError"></RelayPlayer>
        </div>
        <div v-else>
          <h1>Waiting for match info...</h1>
          <h3 v-if="matchInfo.countdown">Next mode: {{ matchInfo.roundTitle }}</h3>
          <h3 v-if="matchInfo.countdown">Arriving in: {{ countdown }}</h3>
        </div>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import DoneButtonPlayer from '@/components/GameModesPlayer/DoneButton.vue';
import RouletteSpinPlayer from '@/components/GameModesPlayer/RouletteSpin.vue';
import {get} from '@/http';
import BingoPlayer from "@/components/GameModesPlayer/Bingo.vue";
import CountdownBar from "@/components/CountdownBar.vue";
import TimerPlayer from "@/components/GameModesPlayer/Timer.vue";
import TwoSpinsPlayer from "@/components/GameModesPlayer/TwoSpins.vue";
import SelectableSpinPlayer from "@/components/GameModesPlayer/SelectableSpin.vue";
import RelayPlayer from "@/components/GameModesPlayer/Relay.vue";

export default defineComponent({
  name: "PlayerClient",
  components: {
    TimerPlayer,
    CountdownBar,
    BingoPlayer,
    DoneButtonPlayer,
    RouletteSpinPlayer,
    TwoSpinsPlayer,
    SelectableSpinPlayer,
    RelayPlayer
  },
  data() {
    return {
      matchId: "",
      player: "",
      updateInterval: -1,
      matchInfo: {
        players: [],
        scores: [],
        countdown: 0
      },
      error: "",
      errorShown: false,
      connectionIssues: false
    }
  },
  async created() {
    const pathname = window.location.pathname.split("/");
    this.player = pathname.pop() as string;
    this.matchId = pathname.pop() as string;
    this.updateInterval = setInterval(this.update, 1000);
  },
  beforeUnmount() {
    clearInterval(this.updateInterval)
  },
  methods: {
    async update() {
      try {
        const resp = await get("/api/match/player/" + this.matchId + "/" + this.player);
        if (resp.status !== 200) {
          this.connectionIssues = true;
        } else {
          this.connectionIssues = false;
          this.matchInfo = resp.data;
        }
      } catch {
        this.connectionIssues = true;
      }
    },
    onError(error: string) {
      this.error = error;
      this.errorShown = true;
    }
  },
  computed: {
    countdown() {
      let h = Math.floor(this.matchInfo.countdown / 3600);
      let m = Math.floor((this.matchInfo.countdown - h * 3600) / 60);
      let s = this.matchInfo.countdown - h * 3600 - m * 60;
      let result = "";
      if (h < 10) {
        result += "0" + h.toString() + ":";
      } else {
        result += h.toString() + ":";
      }
      if (m < 10) {
        result += "0" + m.toString() + ":";
      } else {
        result += m.toString() + ":";
      }
      if (s < 10)  {
        result += "0" + s.toString();
      } else {
        result += s.toString();
      }
      return result;
    }
  }
})
</script>
