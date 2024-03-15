<template>
  <div class="background">
    <span class="playername p1">{{ matchData.players[0] }}</span>
    <span class="playername p2">{{ matchData.players[1] }}</span>

    <span class="score s1">{{ matchData.scores[0] }}</span>
    <span class="score s2">{{ matchData.scores[1] }}</span>

    <v-img :src="matchData.avatars[0]" width="150" height="150" class="pfp lplayer"></v-img>
    <v-img :src="matchData.avatars[1]" width="150" height="150" class="pfp rplayer"></v-img>

    <span class="timer">{{ roundTimer }}</span>

    <div class="spincontainer container">
      <div class="container" v-if="matchData.roundLive">
        <SpinOverlay :data="currentDetails.currentSpin" class="spin" v-if="currentRound.mode === 'rouletteSpin'"></SpinOverlay>
        <DoneButtonOverlay :data="currentRound" v-if="currentRound.mode === 'simpleDoneButton' || currentRound.mode === 'timer'"></DoneButtonOverlay>
        <BingoOverlay :data="currentRound" v-if="currentRound.mode === 'bingo'"></BingoOverlay>
        <SelectableSpinOverlay :data="currentDetails.currentSpin" v-if="currentRound.mode === 'selectableSpin'"></SelectableSpinOverlay>
      </div>
      <div class="container" v-else-if="countdownRunning">
        <div class="container">
          <h1 class="centeredText topSpace">Up next: {{ currentRound.title }}</h1>
          <h1 class="centeredText" v-if="matchData.countdown">Arriving in: {{ formatTimer(matchData.countdown) }}</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body.overlay {
  overflow: hidden;
  height: 1080px;
  width: 1920px;
}
body.overlay::-webkit-scrollbar {
  display: none;
}
</style>

<style scoped>
@font-face {
  font-family: font;
  src: url("~@/assets/Doctor Glitch.otf");
}
.background {
  position: absolute;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  background-image: url("~@/assets/freestyle-overlay-clean.png");
  color: white;
}
.playername {
  font-size: 30pt;
  font-family: font;
  position: absolute;
  top: 115px;
  height: 78px;
  width: 640px;
  z-index: 1;
}
.p1 {
  left: 160px;
  text-align: left;
}
.p2 {
  left: 1120px;
  text-align: right;
}
.score {
  font-family: font;
  top: 15px;
  width: 250px;
  height: 180px;
  text-align: center;
  position: absolute;
  font-size: 130px;
}
.s1 {
  left: 530px;
}
.s2 {
  left: 1140px;
}
.timer {
  font-family: font;
  position: absolute;
  left: 175px;
  top: 755px;
  font-size: 190px;
  text-align: center;
  width: 260px;
}
.container {
  position: absolute;
  top: 0;
  width: 1300px;
  height: 600px;
  background-size: cover;
}
.spin {
  height: 550px;
}
.centeredText {
  width: 100%;
  text-align: center;
  font-size: 350%;
  color: white;
  z-index: 20;
  font-family: font;
}
.topSpace {
  margin-top: 155px;
}
.spincontainer {
  left: 830px;
  top: 661px;
  transform: scale(0.7);
}
.pfp {
  position: absolute;
  top: 20px;
  border-radius: 50%;
}
.lplayer {
  left: 45px;
}
.rplayer {
  left: 1720px;
}
</style>
<script lang="ts">
import {defineComponent} from "vue";
import { get } from "@/http";
import { Duration } from "luxon";
import BingoOverlay from "@/components/GameModesOverlay/Bingo.vue";
import DoneButtonOverlay from "@/components/GameModesOverlay/DoneButton.vue";
import SelectableSpinOverlay from "@/components/GameModesOverlay/SelectableSpin.vue";
import SpinOverlay from "@/components/GameModesOverlay/RouletteSpin.vue";

export default defineComponent({
  name: 'EventOverlay',
  components: {BingoOverlay, DoneButtonOverlay, SpinOverlay, SelectableSpinOverlay},
  data() {
    return {
      matchData: {
        round: {
          additionalDetails: {}
        },
        players: ["",""],
        avatars: ["",""],
        scores: [0,0],
        countdown: 0,
        roundLive: false,
      },
      updateInterval: -1,
      matchId: ""
    }
  },
  async created() {
    this.matchId = window.location.pathname.split("/").pop() as string;
    this.updateInterval = setInterval(this.update, 1000);
  },
  beforeUnmount() {
    clearInterval(this.updateInterval);
    document.body.className = "";
  },
  beforeCreate() {
    document.body.className = "overlay";
  },
  methods: {
    async update() {
      const request = await get(`/api/match/overlay/${this.matchId}`);
      this.matchData = request.data;
    },
    formatTimer(seconds: number): string {
      return Duration.fromMillis(seconds * 1000).toFormat("mm:ss");
    },
    getClaims(player: number) {
      let result = 0;
      for (const tile of this.currentDetails.claimedTiles) {
        if (tile[player] == 1) {
          result += 1;
        }
      }
      return result;
    }
  },
  computed: {
    currentRound(): any {
      return this.matchData.round;
    },
    currentDetails(): any {
      return this.matchData.round?.additionalDetails;
    },
    countdownRunning(): boolean {
      return this.matchData.countdown >= 0 && !this.matchData.roundLive;
    },
    roundTimer(): string {
      if (this.matchData.countdown >= 0 && this.matchData.roundLive) {
        return this.formatTimer(this.matchData.countdown);
      }
      return ""
    }
  }
})
</script>
