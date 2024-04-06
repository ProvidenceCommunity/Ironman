<template>
  <div class="container">
    <div class="container" v-if="matchData.roundLive">
      <SpinOverlay :data="currentDetails.currentSpin" class="spin" v-if="currentRound.mode === 'rouletteSpin'"></SpinOverlay>
      <SpinOverlay :data="currentDetails.maps[currentDetails.currentSpin[spinNum]]" class="spin" v-if="currentRound.mode === 'relay' && currentDetails.maps[currentDetails.currentSpin[spinNum]] !== undefined"></SpinOverlay>
      <SpinOverlay :data="currentDetails.currentSpins[spinNum]" class="spin" v-if="currentRound.mode === 'twoSpins'"></SpinOverlay>
      <DoneButtonOverlay :data="currentRound" v-if="currentRound.mode === 'simpleDoneButton' || currentRound.mode === 'timer'"></DoneButtonOverlay>
      <BingoOverlay :data="currentRound" v-if="currentRound.mode === 'bingo'"></BingoOverlay>
      <SelectableSpinOverlay :data="currentDetails.currentSpin" v-if="currentRound.mode === 'selectableSpin'"></SelectableSpinOverlay>
      <CountdownBar v-if="currentRound.mode === 'relay' && currentDetails.maps[currentDetails.currentSpin[1]] !== undefined" :timeRemaining="relaySpinTimeRemaining" :totalTime="relaySpinTotalTime"></CountdownBar>
      <CountdownBar :timeRemaining="matchData.countdown" :totalTime="matchData.totalMatchTime" v-else></CountdownBar>
    </div>
    <div class="container" v-else style="background-image: url('https://media.hitmaps.com/img/hitman3/backgrounds/menu_bg.jpg');">
      <div class="container" v-if="currentRound.arrivingTimestamp > new Date() || currentRound.arrivingTimestamp <= 0">
        <h1 class="centeredText topSpace">Up next: {{ currentRound.title }}</h1>
        <h1 class="centeredText" v-if="matchData.countdown">Arriving in: {{ formatTimer(matchData.countdown) }}</h1>
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
body.overlay > div[data-v-app] > div.v-application {
  background: none;
}
body.overlay::-webkit-scrollbar {
  display: none;
}
</style>

<style scoped>
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
import SelectableSpinOverlay from "@/components/GameModesOverlay/SelectableSpin.vue";
import { useTheme } from "vuetify";

export default defineComponent({
  name: 'RouletteSpinOverlay',
  components: {BingoOverlay, DoneButtonOverlay, SpinOverlay, SelectableSpinOverlay, CountdownBar},
  data() {
    return {
      matchData: {
        round: {
          additionalDetails: {}
        },
        countdown: 0
      },
      updateInterval: -1,
      matchId: "",
      spinNum: 0
    }
  },
  async created() {
    this.matchId = window.location.pathname.split("/").pop() as string;
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has("spin")) {
      try {
        this.spinNum = parseInt(queryParams.get("spin") ?? "0");
      } catch {
        this.spinNum = 0;
      }
    }
    await this.update();
    this.updateInterval = setInterval(this.update, 1000);
  },
  beforeUnmount() {
    clearInterval(this.updateInterval);
    document.body.className = "";
  },
  beforeCreate() {
    document.body.className = "overlay";
    const theme = useTheme();
    theme.global.name.value = 'light';
  },
  methods: {
    async update() {
      const request = await get(`/api/match/overlay/${this.matchId}`);
      this.matchData = request.data;
    },
    formatTimer(seconds: number): string {
      return Duration.fromMillis(this.matchData.countdown * 1000).toFormat("mm:ss");
    }
  },
  computed: {
    currentRound(): any {
      return this.matchData.round;
    },
    currentDetails(): any {
      return this.matchData.round.additionalDetails;
    },
    relaySpinTimeRemaining() {
      if (this.currentRound.mode !== 'relay') return 0;
      let countdown = 0;
      if (this.currentDetails.currentSpinStart[this.spinNum] === -1) {
        countdown = (this.currentRound.arrivingTimestamp + this.currentDetails.timelimit) - Date.now();
      } else {
        countdown = (this.currentDetails.currentSpinStart[this.spinNum] + this.currentDetails.timelimit) - Date.now();
      }
      return Math.floor(countdown / 1000);
    },
    relaySpinTotalTime(): number {
      if (this.currentRound.mode !== 'relay') return 0;
      if (this.currentDetails.currentSpin[this.spinNum] + 1 === this.currentDetails.maps.length || this.currentDetails.timelimit <= 0) {
        return -1;
      }
      return this.currentDetails.timelimit / 1000
    },
  }
})
</script>
