<template>
  <div class="container">
    <OverlayProfileImage :player="matchInfo.players[0]" width="80" height="80" class="lpPFP"></OverlayProfileImage>
    <OverlayProfileImage :player="matchInfo.players[1]" width="80" height="80" class="rpPFP"></OverlayProfileImage>
    <span class="lpName playerName">{{ matchInfo.players[0] }}</span>
    <span class="rpName playerName">{{ matchInfo.players[1] }}</span>

    <span class="lpScore score">{{ matchInfo.scores[0] }}</span>
    <span class="rpScore score">{{ matchInfo.scores[1] }}</span>

    <div class="spinBox">
      <template v-if="matchInfo.roundLive === false">
        <CountdownOverlay v-if="matchInfo.countdown !== undefined" :next-mode="matchInfo.round.mode" :time="matchInfo.countdown"></CountdownOverlay>
        <h1 v-else class="gauntletText">Hitman Gauntlet</h1>
      </template>
      <template v-if="matchInfo.roundLive">
        <DoneButtonOverlay v-if="matchInfo.round.mode === 'simpleDoneButton'" :data="matchInfo.round.additionalDetails"></DoneButtonOverlay>
        <RouletteSpinOverlay v-if="matchInfo.round.mode === 'rouletteSpin'" :data="matchInfo.round.additionalDetails"></RouletteSpinOverlay>
        <BingoOverlay v-if="matchInfo.round.mode === 'bingo'" :data="matchInfo.round.additionalDetails"></BingoOverlay>
        <CountdownBar :total-time="matchInfo.totalMatchTime" :time-remaining="matchInfo.countdown"></CountdownBar>
      </template>
    </div>
  </div>
</template>

<style>
  body {
    overflow: hidden;
    width: 1920px;
    height: 1080px;
  }
  ::-webkit-scrollbar {
    display: none;
  }
</style>

<style scoped>
  @font-face {
    font-family: font;
    src: url("~@/assets/PRViking-Zero.ttf");
  }

  .container {
    width: 1920px;
    height: 1080px;
    background-image: url("~@/assets/HITMAN_Gauntlet_Overlay_v2.png");
    overflow: hidden;
  }

  .lpPFP {
    position: absolute;
    left: 30px;
    top: 4px;
  }

  .rpPFP {
    position: absolute;
    left: 1809px;
    top: 4px;
  }

  .playerName {
    position: absolute;
    font-family: font;
    font-size: 70px;
    color: white;
    font-weight: bold;
  }
  .lpName {
    left: 160px;
    top: 0px;
  }
  .rpName {
    right: 160px;
    top: 0px;
    text-align: right;
  }
  .score {
    font-size: 140px;
    font-family: font;
    color: white;
    font-weight: bold;
    position: absolute;
  }
  .lpScore {
    left: 280px;
    top: 670px;
  }
  .rpScore {
    right: 280px;
    top: 670px;
  }
  .spinBox {
    position: absolute;
    width: 800px;
    height: 450px;
    top: 630px;
    left: 561px;
  }
  .gauntletText {
    width: 100%;
    text-align: center;
    color: white;
    font-size: 80px;
    margin-top: 30px;
  }
</style>

<script lang="ts">
import {defineComponent} from "vue";
import {get} from "@/http";
import DoneButtonOverlay from '@/components/GameModesOverlay/DoneButton.vue';
import RouletteSpinOverlay from '@/components/GameModesOverlay/RouletteSpin.vue';
import BingoOverlay from '@/components/GameModesOverlay/Bingo.vue';
import OverlayProfileImage from "@/components/OverlayProfileImage.vue";
import CountdownOverlay from "@/components/GameModesOverlay/Countdown.vue";
import CountdownBar from "@/components/CountdownBar.vue";

export default defineComponent({
  name: 'OverlayView',
  components: {
    CountdownBar,
    CountdownOverlay,
    OverlayProfileImage,
    DoneButtonOverlay,
    RouletteSpinOverlay,
    BingoOverlay
  },
  data() {
    return {
      matchId: "",
      updateInterval: -1,
      matchInfo: {
        round: {},
        players: []
      }
    }
  },
  async created() {
    const pathname = window.location.pathname.split("/");
    this.matchId = pathname.pop() as string;
    this.updateInterval = setInterval(this.update, 1000);
  },
  methods: {
    async update() {
      const d = await get(`/api/match/overlay/${this.matchId}`);
      this.matchInfo = d.data;
    }
  }
})
</script>
