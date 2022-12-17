<template>
  <div class="background">
    <span class="playername p1">{{ matchData.players[0] }}</span>
    <span class="playername p2">{{ matchData.players[1] }}</span>
    <span class="scorename scoreName1">{{ matchData.players[0] }}</span>
    <span class="scorename scoreName2">{{ matchData.players[1] }}</span>

    <span class="score s1">{{ matchData.scores[0] }}</span>
    <span class="score s2">{{ matchData.scores[1] }}</span>
    
    <span class="scorename claims1" v-if="displayClaims">{{ getClaims(0) }}/10 Tiles claimed</span>
    <span class="scorename claims2" v-if="displayClaims">{{ getClaims(1) }}/10 Tiles claimed</span>

    <OverlayProfilePicture class="pfp lplayer" :player="matchData.players[0]" width="80" height="80"></OverlayProfilePicture>
    <OverlayProfilePicture class="pfp rplayer" :player="matchData.players[1]" width="80" height="80"></OverlayProfilePicture>
    <OverlayNationalityFlag class="flag fleft" :player="matchData.players[0]" width="80" height="80"></OverlayNationalityFlag>
    <OverlayNationalityFlag class="flag fright" :player="matchData.players[1]" width="80" height="80"></OverlayNationalityFlag>

    <span class="timer">{{ roundTimer }}</span>
    <span class="mode">{{ currentGameMode }}</span>
    <span class="firstTo">FIRST TO 3 POINTS</span>

    <BingoOverlay class="card" :data="currentRound" v-if="displayCard"></BingoOverlay>
    <div class="countdownBox" v-if="countdownRunning">
      <p class="centeredText topSpace">Up next: {{ currentRound.title }}</p>
      <p class="centeredText" v-if="matchData.countdown">Arriving in: {{ formatTimer(matchData.countdown) }}</p>
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
  src: url("~@/assets/valorant.ttf");
}
@font-face {
  font-family: timer;
  src: url("~@/assets/expanse.otf");
}
.timer {
  font-family: timer;
  position: absolute;
  left: 25px;
  top: 718px;
  font-size: 50px;
  text-align: center;
  width: 260px;
}
.mode {
  font-family: font; 
  position: absolute;
  left: 398px;
  top: 738px;
  font-size: 50px;
  text-align: center;
  width: 240px;
  line-height: 1;
}
.firstTo {
  font-family: font;
  position: absolute;
  bottom: 8px;
  right: 292px;
  font-size: 30px;
  text-align: right;
}
.playername {
  font-size: 32pt;
  font-family: font;
  position: absolute;
  top: 31px;
  height: 78px;
  width: 640px;
}
.p1 {
  left: 168px;
  text-align: left;
}
.p2 {
  left: 1096px;
  text-align: right;
}
.scorename {
  font-family: font;
  font-size: 26pt;
  position: absolute;
  width: 440px;
  text-align: right;
  display: block;
  overflow: hidden;
}
.scoreName1 {
  left: 1220px;
  top: 699px;
}
.scoreName2 {
  left: 1220px;
  top: 903px;
}
.claims1 {
  font-size: 14pt;
  left: 1220px;
  top: 751px;
}
.claims2 {
  font-size: 14pt;
  left: 1220px;
  top: 955px;
}
.score {
  color: black;
  font-family: font;
  left: 1715px;
  width: 102px;
  height: 58px;
  text-align: center;
  position: absolute;
  font-size: 40px;
}
.s1 {
  top: 699px;
}
.s2 {
  top: 903px;
}
.pfp {
  position: absolute;
  top: 17px;
}
.lplayer {
  left: 71px;
}
.rplayer {
  left: 1770px;
}
.background {
  position: absolute;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  background-image: url("~@/assets/BingoOverlay_New.png");
}
.card {
  position: absolute;
  transform: scale(0.85);
  left: 718px;
  top: 504px;
}
.countdownBox {
  top: 600px;
  left: 775px;
  position: absolute;
  font-size: 35px;
  font-family: 'font';
}
.centeredText {
  width: 100%;
  text-align: center;
  color: white;
  z-index: 20;
}
.topSpace {
  margin-top: 155px;
}
.flag {
  position: absolute;
  top: 17px;
}
.fleft {
  left: 810px;
}
.fright {
  left: 1030px;
}
</style>
<script lang="ts">
import {defineComponent} from "vue";
import { get } from "@/http";
import { Duration } from "luxon";
import BingoOverlay from "@/components/GameModesOverlay/Bingo.vue";
import OverlayProfilePicture from "@/components/OverlayProfilePicture.vue";
import OverlayNationalityFlag from "@/components/OverlayNationalityFlag.vue";

export default defineComponent({
  name: 'BingoTournamentOverlay',
  components: {BingoOverlay, OverlayProfilePicture, OverlayNationalityFlag},
  data() {
    return {
      matchData: {
        round: {
          additionalDetails: {}
        },
        players: ["",""],
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
    displayClaims(): boolean {
      return this.currentDetails?.mode == "Lockout";
    },
    displayCard(): boolean {
      return this.matchData.roundLive && this.currentRound.mode == "bingo";
    },
    countdownRunning(): boolean {
      return this.matchData.countdown >= 0 && !this.matchData.roundLive;
    },
    roundTimer(): string {
      if (this.matchData.countdown >= 0 && this.matchData.roundLive) {
        return this.formatTimer(this.matchData.countdown);
      }
      return "--:--"
    },
    currentGameMode(): string {
      return (this.currentDetails?.mode || "").replace("-", " ")
    }
  }
})
</script>
