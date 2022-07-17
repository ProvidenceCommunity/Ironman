<template>
  <div class="background">
    <span class="playername p1">{{ matchData.players[0].toUpperCase() }}</span>
    <span class="playername p2">{{ matchData.players[1].toUpperCase() }}</span>

    <div :class="'scoreDot p1_1 ' + getDotImage(0,1)"></div>
    <div :class="'scoreDot p1_2 ' + getDotImage(0,2)"></div>

    <div :class="'scoreDot p2_1 ' + getDotImage(1,1)"></div>
    <div :class="'scoreDot p2_2 ' + getDotImage(1,2)"></div>

    <div class="spincontainer container">
      <div class="container" v-if="matchData.roundLive">
        <SpinOverlay :data="currentDetails.currentSpin" class="spin" v-if="currentRound.mode === 'rouletteSpin'"></SpinOverlay>
        <DoneButtonOverlay :data="currentRound" v-if="currentRound.mode === 'simpleDoneButton' || currentRound.mode === 'timer'"></DoneButtonOverlay>
        <BingoOverlay :data="currentRound" v-if="currentRound.mode === 'bingo'"></BingoOverlay>
        <CountdownBar :timeRemaining="matchData.countdown" :totalTime="matchData.totalMatchTime"></CountdownBar>
      </div>
      <div class="container" v-else-if="currentRound.arrivingTimestamp > new Date() || currentRound.arrivingTimestamp <= 0">
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
  font-family: playerNames;
  src: url("~@/assets/Adobe_Garamond_Pro_Regular.ttf");
}
.playername {
  font-family: playerNames;
  letter-spacing: 8px;
  font-size: 55pt;
  position: absolute;
  color: white;
}
.p1 {
  left: 15px;
  top: 50px;
}
.p2 {
  right: 15px;
  top: 50px;
  text-align: right;
}
.scoreDot {
  height: 75px;
  width: 75px;
  position: absolute;
  background-size: cover;
  mix-blend-mode: soft-light;
}
.emptyPoint {
  background-image: url('~@/assets/point_empty.png');
}
.halfPoint {
  background-image: url('~@/assets/point_half.png');
}
.fullPoint {
  background-image: url('~@/assets/point_full.png');
}
.p1_1 {
  left: 408px;
  top: 773px;
}
.p1_2 {
  left: 408px;
  top: 912px;
}
.p2_1 {
  right: 423px;
  top: 773px;
}
.p2_2 {
  right: 423px;
  top: 912px;
}
.background {
  position: absolute;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  background-image: url("~@/assets/ProOverlay_cleanplate.png");
}
.container {
  position: absolute;
  top: 0;
  width: 1300px;
  height: 600px;
  background-size: cover;
}
.spincontainer {
  top: 580px;
  left: 300px;
  background-color: #070F3C;
  transform: scale(0.67);
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
}
.topSpace {
  margin-top: 155px;
}
</style>
<script lang="ts">
import {defineComponent} from "vue";
import SpinOverlay from "@/components/GameModesOverlay/RouletteSpin.vue";
import CountdownBar from "@/components/CountdownBar.vue";
import { get } from "@/http";
import { Duration } from "luxon";
import DoneButtonOverlay from "@/components/GameModesOverlay/DoneButton.vue";
import BingoOverlay from "@/components/GameModesOverlay/Bingo.vue";

export default defineComponent({
  name: 'ProOverlay',
  components: {BingoOverlay, DoneButtonOverlay, SpinOverlay, CountdownBar},
  data() {
    return {
      matchData: {
        round: {
          additionalDetails: {}
        },
        players: ["",""],
        scores: [0,0],
        countdown: 0
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
      return Duration.fromMillis(this.matchData.countdown * 1000).toFormat("mm:ss");
    },
    getDotImage(player: number, points: number): string {
      if (this.matchData.scores[player] === points - 0.5) {
        return "halfPoint";
      } else if (this.matchData.scores[player] >= points) {
        return "fullPoint";
      } else {
        return "emptyPoint";
      }
    }
  },
  computed: {
    currentRound(): any {
      return this.matchData.round;
    },
    currentDetails(): any {
      return this.matchData.round.additionalDetails;
    }
  }
})
</script>
