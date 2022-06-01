<template>
  <v-container fluid>
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
        <DoneButtonPlayer v-if="matchInfo.currentGameMode === 'simpleDoneButton'" :matchId="this.matchId" :player="this.player" :details="this.matchInfo.round"></DoneButtonPlayer>
        <RouletteSpinPlayer v-if="matchInfo.currentGameMode === 'rouletteSpin'" :matchId="this.matchId" :player="this.player" :details="this.matchInfo.round"></RouletteSpinPlayer>
        <h1 v-else>Waiting for match info...</h1>
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

export default defineComponent({
  name: "PlayerClient",
  components: {
    DoneButtonPlayer,
    RouletteSpinPlayer
  },
  data() {
    return {
      matchId: "",
      player: "",
      updateInterval: -1,
      matchInfo: {
        players: [],
        scores: []
      }
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
      this.matchInfo = (await get("/api/match/player/" + this.matchId + "/" + this.player)).data;
    }
  },
  computed: {
    currentRound() {
      return {}
    }
  }
})
</script>
