<template>
  <div class="container">
    <span class="lpName playerName">{{ matchInfo.players[0].toUpperCase() }}</span>
    <span class="rpName playerName">{{ matchInfo.players[1].toUpperCase() }}</span>
    <span class="lpPlayers playerNames">
      <span :class="leftPlayersFirstClass">{{ leftPlayers[0].toUpperCase() }}</span>  /
      <span :class="leftPlayersSecondClass">{{ leftPlayers[1].toUpperCase() }}</span>  /
      <span :class="leftPlayersThirdClass">{{ leftPlayers[2].toUpperCase() }}</span>
    </span>
    <span class="rpPlayers playerNames">
      <span :class="rightPlayersFirstClass">{{ rightPlayers[0].toUpperCase() }}</span>  /
      <span :class="rightPlayersSecondClass">{{ rightPlayers[1].toUpperCase() }}</span>  /
      <span :class="rightPlayersThirdClass">{{ rightPlayers[2].toUpperCase() }}</span>
    </span>
    <div class="bar lpBar" id="leftBar" style="width: 0px;"></div>
    <div class="bar rpBar" id="rightBar" style="width: 0px;"></div>
    <div class="runner lpRunner" id="leftRunner" style="left: 760px;"></div>
    <div class="runner rpRunner" id="rightRunner" style="left: 760px;"></div>

    <div v-if="matchInfo.roundLive">
      <RouletteSpinOverlay class="lpSpin spin" v-if="matchInfo.round.additionalDetails.maps[matchInfo.round.additionalDetails.currentSpin[0]] !== undefined" :data="matchInfo.round.additionalDetails.maps[matchInfo.round.additionalDetails.currentSpin[0]]"></RouletteSpinOverlay>
      <RouletteSpinOverlay class="rpSpin spin" v-if="matchInfo.round.additionalDetails.maps[matchInfo.round.additionalDetails.currentSpin[1]] !== undefined" :data="matchInfo.round.additionalDetails.maps[matchInfo.round.additionalDetails.currentSpin[1]]"></RouletteSpinOverlay>
      <CountdownBar class="lpCountdown" v-if="matchInfo.round.additionalDetails.maps[matchInfo.round.additionalDetails.currentSpin[0]] !== undefined" :timeRemaining="leftSpinTimeRemaining" :totalTime="leftSpinTotalTime" height="57"></CountdownBar>
      <CountdownBar class="rpCountdown" v-if="matchInfo.round.additionalDetails.maps[matchInfo.round.additionalDetails.currentSpin[1]] !== undefined" :timeRemaining="rightSpinTimeRemaining" :totalTime="rightSpinTotalTime" height="57"></CountdownBar>
    </div>
  </div>
</template>

<style>
  body.relayoverlay {
    overflow: hidden;
    height: 1080px;
    width: 1920px;
  }
  body.relayoverlay::-webkit-scrollbar {
    display: none;
  }
</style>

<style scoped>
  @font-face {
    font-family: font;
    src: url("~@/assets/NHaasGroteskTXPro-65Md.ttf");
  }
  @font-face {
    font-family: smallerFont;
    src: url("~@/assets/NHaasGroteskTXPro-55Rg.ttf");
  }
  .container {
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background-image: url("~@/assets/relay_overlay_cleanplate.jpeg");
  }
  .lpName {
    left: 30px;
    top: 36px;
  }
  .rpName {
    right: 30px;
    top: 36px;
    font-align: right;
  }
  .playerName {
    font-size: 50px;
    position: absolute;
    font-family: font;
    color: white;
  }
  .lpPlayers {
    top: 125px;
    left: 30px;
  }
  .rpPlayers {
    top: 125px;
    right: 30px;
    font-align: right;
  }
  .playerNames {
    font-family: smallerFont;
    font-size: 22px;
    position: absolute;
    color: white;
  }
  .runner {
    width: 16px;
    height: 16px;
    position: absolute;
    background-image: url('~@/assets/athletics.png');
    background-size: contain;
  }
  .lpRunner {
    top: 118px;
    left: 1145px
  }
  .rpRunner {
    top: 142px;
    left: 760px;
  }
  .bar {
    height: 3px;
    position: absolute;
    left: 768px;
  }
  .lpBar {
    top: 125px;
    background-color: #bc3b76;
  }
  .rpBar {
    top: 149px;
    background-color: #2e81cc;
  }
  .spin {
    width: 740px;
    height: 285px;
    position: absolute;
  }
  .lpSpin {
    left: 0px;
    top: 738px;
  }
  .rpSpin {
    left: 1180px;
    top: 738px;
  }
  .lpCountdown {
    position: absolute;
    left: 0px;
    top: 1023px;
    width: 740px;
  }
  .rpCountdown {
    position: absolute;
    left: 1180px;
    top: 1023px;
    width: 740px;
  }
  .activePlayer {
    font-weight: bold;
    text-decoration: underline;
  }
</style>

<script lang="ts">
import {get} from "@/http";
import { defineComponent } from 'vue';
import RouletteSpinOverlay from "@/components/GameModesOverlay/RouletteSpin.vue";
import CountdownBar from "@/components/CountdownBar.vue";

export default defineComponent({
  name: 'RelayOverlay',
  components: {
    CountdownBar,
    RouletteSpinOverlay

  },
  data() {
    return {
      matchId: "",
      updateInterval: -1,
      matchInfo: {
        round: {
          arrivingTimestamp: 0,
          additionalDetails: {
            timelimit: 0,
            currentSpin: [0, 0],
            currentSpinStart: [-1, -1],
            maps: [],
            activePlayers: [[],[]]
          }
        },
        players: ["", ""]
      },
      animations: {
        leftBar: undefined as any,
        rightBar: undefined as any,
        leftRunner: undefined as any,
        rightRunner: undefined as any,
      }
    }
  },
  beforeCreate() {
    document.body.className = "relayoverlay";
  },
  beforeUnmount() {
    document.body.className = "";
  },
  async created() {
    const pathname = window.location.pathname.split("/");
    this.matchId = pathname.pop() as string;
    this.updateInterval = setInterval(this.update, 1000);
  },
  methods: {
    async update(): Promise<void> {
      const d = await get(`/api/match/overlay/${this.matchId}`);
      this.matchInfo = d.data;
      this.animateBars();
      this.animateRunners();
    },
    animateBars() {
      const leftBar = document.getElementById("leftBar") as HTMLElement;
      const rightBar = document.getElementById("rightBar") as HTMLElement;

      if (leftBar.style.width !== this.getBarWidth(this.matchInfo.round.additionalDetails.currentSpin[0] + 1) && this.animations.leftBar === undefined) {
        this.animations.leftBar = leftBar.animate(
            [ {width: leftBar.style.width}, {width: this.getBarWidth(this.matchInfo.round.additionalDetails.currentSpin[0] + 1)} ],
            {duration: 1000, iterations: 1, easing: "ease"});
        (this.animations.leftBar as Animation).onfinish = () => {
          leftBar.style.width = this.getBarWidth(this.matchInfo.round.additionalDetails.currentSpin[0] + 1)
          this.animations.leftBar = undefined;
        }
      }
      if (rightBar.style.width !== this.getBarWidth(this.matchInfo.round.additionalDetails.currentSpin[1] + 1) && this.animations.rightBar === undefined) {
        this.animations.rightBar = rightBar.animate(
            [ {width: rightBar.style.width}, {width: this.getBarWidth(this.matchInfo.round.additionalDetails.currentSpin[1] + 1)} ],
            {duration: 1000, iterations: 1, easing: "ease"});
        (this.animations.rightBar as Animation).onfinish = () => {
          rightBar.style.width = this.getBarWidth(this.matchInfo.round.additionalDetails.currentSpin[1] + 1);
          this.animations.rightBar = undefined;
        }
      }
    },
    animateRunners() {
      const leftRunner = document.getElementById("leftRunner") as HTMLElement;
      const rightRunner = document.getElementById("rightRunner") as HTMLElement;

      if (leftRunner.style.left !== this.getRunnerPos(this.matchInfo.round.additionalDetails.currentSpin[0] + 1) && this.animations.leftRunner === undefined) {
        this.animations.leftRunner = leftRunner.animate(
            [ {left: leftRunner.style.left}, {left: this.getRunnerPos(this.matchInfo.round.additionalDetails.currentSpin[0] + 1)}],
            {duration: 1000, iterations: 1, easing: "ease"});
        (this.animations.leftRunner as Animation).onfinish = () => {
          leftRunner.style.left = this.getRunnerPos(this.matchInfo.round.additionalDetails.currentSpin[0] + 1);
          this.animations.leftRunner = undefined;
        }
      }
      if (rightRunner.style.left !== this.getRunnerPos(this.matchInfo.round.additionalDetails.currentSpin[1] + 1) && this.animations.rightRunner === undefined) {
        this.animations.rightRunner = rightRunner.animate(
            [ {left: rightRunner.style.left}, {left: this.getRunnerPos(this.matchInfo.round.additionalDetails.currentSpin[1] + 1)}],
            {duration: 1000, iterations: 1, easing: "ease"});
        (this.animations.rightRunner as Animation).onfinish = () => {
          rightRunner.style.left = this.getRunnerPos(this.matchInfo.round.additionalDetails.currentSpin[1] + 1);
          this.animations.rightRunner = undefined;
        }
      }
    },
    getBarWidth(map: number) {
      switch (map) {
        case 1:
          return "0px";
        case 2:
          return "75px";
        case 3:
          return "153px";
        case 4:
          return "230px";
        case 5:
          return "307px";
        case 6:
          return "385px";
        case 7:
          return "385px";
        default:
          return "0px";
      }
    },
    getRunnerPos(map: number) {
      switch (map) {
        case 1:
          return "760px";
        case 2:
          return "835px";
        case 3:
          return "913px";
        case 4:
          return "990px";
        case 5:
          return "1067px";
        case 6:
          return "1145px";
        case 7:
          return "1145px";
        default:
          return "760px";
      }
    }
  },
  computed: {
    leftSpinTimeRemaining() {
      let countdown = 0;
      if (this.matchInfo.round.additionalDetails.currentSpinStart[0] === -1) {
        countdown = (this.matchInfo.round.arrivingTimestamp + this.matchInfo.round.additionalDetails.timelimit) - Date.now();
      } else {
        countdown = (this.matchInfo.round.additionalDetails.currentSpinStart[0] + this.matchInfo.round.additionalDetails.timelimit) - Date.now();
      }
      return Math.floor(countdown / 1000);
    },
    rightSpinTimeRemaining() {
      let countdown = 0;
      if (this.matchInfo.round.additionalDetails.currentSpinStart[1] === -1) {
        countdown = (this.matchInfo.round.arrivingTimestamp + this.matchInfo.round.additionalDetails.timelimit) - Date.now();
      } else {
        countdown = (this.matchInfo.round.additionalDetails.currentSpinStart[1] + this.matchInfo.round.additionalDetails.timelimit) - Date.now();
      }
      return Math.floor(countdown / 1000);
    },
    leftPlayers(): string[] {
      let playersArray: string[] = [];
      switch (this.matchInfo.players[0]) {
        case "NezukoXPenguinXSoviet":
          playersArray = ["Nezuko Chan","linux_penguin","Soviet"];
          break;
        case "Average RR Enjoyers":
          playersArray = ["jokerj","k-kaneta","Phanium"];
          break;
        case "Gordiniroy Fanclub":
          playersArray = ["Moo","Papierfresse","DaniButa"];
          break;
        case "AMF":
          playersArray = ["Ashton","MattySpice","Redfox"];
          break;
        case "Penguins of Madagascar":
          playersArray = ["ChromeX","Rocky","lewis"];
          break;
        case "Sheets enthusiasts":
          playersArray = ["Yannini","In4Fun","CurryMaker"];
          break;
        case "BURLY MEN":
          playersArray = ["Meekah","GiggsRH","Ducknorriss"];
          break;
        case "Team USA":
          playersArray = ["ChrisX3","GKPunk","Gunther"];
          break;
        default:
          playersArray = ["", "", ""];
          break;
      }
      return playersArray;
    },
    leftPlayersFirstClass() {
      if (this.matchInfo.round.additionalDetails.activePlayers[0][this.matchInfo.round.additionalDetails.currentSpin[0]] === 'Player 1') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    leftPlayersSecondClass() {
      if (this.matchInfo.round.additionalDetails.activePlayers[0][this.matchInfo.round.additionalDetails.currentSpin[0]] === 'Player 2') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    leftPlayersThirdClass() {
      if (this.matchInfo.round.additionalDetails.activePlayers[0][this.matchInfo.round.additionalDetails.currentSpin[0]] === 'Player 3') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    rightPlayers() {
      let playersArray: string[] = [];
      switch (this.matchInfo.players[1]) {
        case "NezukoXPenguinXSoviet":
          playersArray = ["Nezuko Chan","linux_penguin","Soviet"];
          break;
        case "Average RR Enjoyers":
          playersArray = ["jokerj","k-kaneta","Phanium"];
          break;
        case "Gordiniroy Fanclub":
          playersArray = ["Moo","Papierfresse","DaniButa"];
          break;
        case "AMF":
          playersArray = ["Ashton","MattySpice","Redfox"];
          break;
        case "Penguins of Madagascar":
          playersArray = ["ChromeX","Rocky","lewis"];
          break;
        case "Sheets enthusiasts":
          playersArray = ["Yannini","In4Fun","CurryMaker"];
          break;
        case "BURLY MEN":
          playersArray = ["Meekah","GiggsRH","Ducknorriss"];
          break;
        case "Team USA":
          playersArray = ["ChrisX3","GKPunk","Gunther"];
          break;
        default:
          playersArray = ["", "", ""];
          break;
      }
      return playersArray;
    },
    rightPlayersFirstClass() {
      if (this.matchInfo.round.additionalDetails.activePlayers[1][this.matchInfo.round.additionalDetails.currentSpin[1]] === 'Player 1') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    rightPlayersSecondClass() {
      if (this.matchInfo.round.additionalDetails.activePlayers[1][this.matchInfo.round.additionalDetails.currentSpin[1]] === 'Player 2') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    rightPlayersThirdClass() {
      if (this.matchInfo.round.additionalDetails.activePlayers[1][this.matchInfo.round.additionalDetails.currentSpin[1]] === 'Player 3') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    leftSpinTotalTime(): number {
      if (this.matchInfo.round.additionalDetails.currentSpin[0] + 1 === this.matchInfo.round.additionalDetails.maps.length) {
        return -1;
      }
      return this.matchInfo.round.additionalDetails.timelimit / 1000
    },
    rightSpinTotalTime(): number {

      if (this.matchInfo.round.additionalDetails.currentSpin[1] + 1 === this.matchInfo.round.additionalDetails.maps.length) {
        return -1;
      }
      return this.matchInfo.round.additionalDetails.timelimit / 1000
    }
  }
})
</script>
