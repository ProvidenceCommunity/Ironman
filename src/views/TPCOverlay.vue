<template>
  <div class="background">
    <!-- <span class="playername p1">{{ matchData.players[0].toUpperCase() }}</span> -->
    <span class="playername p1">
      {{ matchData.players[0].toUpperCase() }}<br>
      <span class="players">{{ getTeamPlayers(matchData.players[0]).join(" & ").toUpperCase() }}</span>
    </span>
    <!-- <span class="playername p2">{{ matchData.players[1].toUpperCase() }}</span> -->
    <span class="playername p2">
      {{ matchData.players[1].toUpperCase() }}<br>
      <span class="players">{{ getTeamPlayers(matchData.players[1]).join(" & ").toUpperCase() }}</span>
    </span>

    <span class="score s1">{{ matchData.scores[0] }}</span>
    <span class="score s2">{{ matchData.scores[1] }}</span>

    <OverlayProfilePicture class="pfp l1" :player="getTeamPlayers(matchData.players[0])[0]" width="128" height="128"></OverlayProfilePicture>
    <OverlayProfilePicture class="pfp l2" :player="getTeamPlayers(matchData.players[0])[1]" width="128" height="128"></OverlayProfilePicture>
    <OverlayProfilePicture class="pfp r1" :player="getTeamPlayers(matchData.players[1])[0]" width="128" height="128"></OverlayProfilePicture>
    <OverlayProfilePicture class="pfp r2" :player="getTeamPlayers(matchData.players[1])[1]" width="128" height="128"></OverlayProfilePicture>

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
  src: url("~@/assets/JockeyOne-Regular.ttf");
}
.playername {
  font-family: playerNames;
  letter-spacing: -1.5px;
  font-size: 80px;
  position: absolute;
  color: #2d3f76;
  width: 640px;
  line-height: 0.8;
}
.p1 {
  left: 19px;
  top: 14px;
}
.p2 {
  right: 19px;
  top: 14px;
  text-align: right;
}
.players {
  color: white;
  font-size: 36px;
}
.score {
  color: white;
  font-family: playerNames;
  font-size: 110px;
  top: 45px;
  position: absolute;
}
.s1 {
  left: 640px;
}
.s2 {
  right: 640px;
  text-align: right;
}
.pfp {
  border-radius: 10px;
  position: absolute;
}
.l1 {
  left: 60px;
  top: 316px;
}
.l2 {
  left: 60px;
  top: 460px;
}
.r1 {
  right: 63px;
  top: 324px;
}
.r2 {
  right: 63px;
  top: 468px;
}
.background {
  position: absolute;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  background-image: url("~@/assets/Providence-Cup-Overlay-Clean.png");
}
.container {
  position: absolute;
  top: 0;
  width: 1300px;
  height: 600px;
  background-size: cover;
}
.spincontainer {
  top: 586px;
  left: 311px;
  transform: scale(0.385);
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
import OverlayProfilePicture from "@/components/OverlayProfilePicture.vue";

export default defineComponent({
  name: 'ProOverlay',
  components: {BingoOverlay, DoneButtonOverlay, SpinOverlay, CountdownBar, OverlayProfilePicture},
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
    getTeamPlayers(team: string): string[] {
      switch(team) {
        case "2x RR Champions":
          return ["Jokerj", "Phanium"];
        case "Stuffers Turned Builders":
          return ["Papierfresse", "Moo"];
        case "CX Punk MkIII":
          return ["ChrisX3", "GKPunk"];
        case "Roulette unprofessionals":
          return ["Nezuko Chan", "Rocky"];
        case "Formulads":
          return ["In4Fun", "ThatObserver"];
        case "Boreal Forest":
          return ["Some Random Person", "ChromeX"];
        case "The Improv Royalty":
          return ["Blithe", "Meme Junkie"];
        case "Bad Laptop and Bad Wifi":
          return ["MattySpice", "Redfox"];
        case "Xbox Master Race":
          return ["Soviet", "lewis"];
        case "Geometry Dash Refugees":
          return ["Meekah", "zRune"];
        case "Innit Bruv":
          return ["Mando", "Crewdy"];
        case "RustyRbram":
          return ["Fe2o3", "Ebramahdi"];
        case "SLOWMEGALUL":
          return ["Zionicle", "Sparkles"];
        case "Gumidifier 2.0":
          return ["Rommel of the Far East", "The_Rieper_47"];
        default:
          return ["", ""]
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
