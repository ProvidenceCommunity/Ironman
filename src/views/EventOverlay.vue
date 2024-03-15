<template>
  <div class="background" v-if="loadCompleted">
    <span class="playername p1">
      <!-- {{ matchData.players[0].toUpperCase() }}<br> -->
      THE SETTLING MEN<br>
      <span class="players">
        <span :class="leftPlayersFirstClass">{{ getTeamPlayers(matchData.players[0])[0].name.toUpperCase() }}</span>  /
        <span :class="leftPlayersSecondClass">{{ getTeamPlayers(matchData.players[0])[1].name.toUpperCase() }}</span>  /
        <span :class="leftPlayersThirdClass">{{ getTeamPlayers(matchData.players[0])[2].name.toUpperCase() }}</span>
      </span>
    </span>
    <span class="playername p2">
      <!-- {{ matchData.players[1].toUpperCase() }}<br> -->
      FRUIT VAN HUSTLERS<br>
      <span class="players">
        <span :class="leftPlayersFirstClass">{{ getTeamPlayers(matchData.players[1])[0].name.toUpperCase() }}</span>  /
        <span :class="leftPlayersSecondClass">{{ getTeamPlayers(matchData.players[1])[1].name.toUpperCase() }}</span>  /
        <span :class="leftPlayersThirdClass">{{ getTeamPlayers(matchData.players[1])[2].name.toUpperCase() }}</span>
      </span>
    </span>

    <span class="score s1">{{ matchData.scores[0] }}</span>
    <span class="score s2">{{ matchData.scores[1] }}</span>

    <div class="bar lpBar" id="leftBar" style="width: 0px;"></div>
    <div class="bar rpBar" id="rightBar" style="width: 0px;"></div>
    <div class="runner lpRunner" id="leftRunner" style="left: 760px;"></div>
    <div class="runner rpRunner" id="rightRunner" style="left: 760px;"></div>

    <v-img :src="avatars[0]" width="128" height="128" class="pfp l0"></v-img>
    <v-img :src="avatars[1]" width="128" height="128" class="pfp l1"></v-img>
    <v-img :src="avatars[2]" width="128" height="128" class="pfp l2"></v-img>
    <v-img :src="avatars[3]" width="128" height="128" class="pfp r0"></v-img>
    <v-img :src="avatars[4]" width="128" height="128" class="pfp r1"></v-img>
    <v-img :src="avatars[5]" width="128" height="128" class="pfp r2"></v-img>

    <div v-if="matchData.roundLive">
      <SpinOverlay class="leftspin" v-if="currentDetails.maps[currentDetails.currentSpin[0]] !== undefined" :data="currentDetails.maps[currentDetails.currentSpin[0]]"></SpinOverlay>
      <SpinOverlay class="rightspin" v-if="currentDetails.maps[currentDetails.currentSpin[1]] !== undefined" :data="currentDetails.maps[currentDetails.currentSpin[1]]"></SpinOverlay>
      <CountdownBar class="leftcountdown" v-if="currentDetails.maps[currentDetails.currentSpin[0]] !== undefined" :timeRemaining="leftSpinTimeRemaining" :totalTime="leftSpinTotalTime" :height="27"></CountdownBar>
      <CountdownBar class="rightcountdown" v-if="currentDetails.maps[currentDetails.currentSpin[1]] !== undefined" :timeRemaining="rightSpinTimeRemaining" :totalTime="rightSpinTotalTime" :height="27"></CountdownBar>
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
.activePlayer {
  text-decoration: underline;
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
.l0 {
  left: 60px;
  top: 172px;
}
.l1 {
  left: 60px;
  top: 316px;
}
.l2 {
  left: 60px;
  top: 460px;
}
.r0 {
  right: 63px;
  top: 180px;
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
.leftspin {
  left: -260px;
  top: 573px;
  width: 1300px;
  height: 600px;
  transform: scale(0.6);
  position: absolute;
}
.leftcountdown {
  position: absolute;
  left: 0px;
  bottom: 0px;
  width: 780px;
}
.rightcountdown {
  position: absolute;
  right: 0px;
  bottom: 0px;
  width: 780px;
}
.rightspin {
  right: -260px;
  top: 573px;
  position: absolute;
  width: 1300px;
  height: 600px;
  transform: scale(0.6);
}
.runner {
  width: 16px;
  height: 16px;
  position: absolute;
  background-image: url('~@/assets/athletics.png');
  background-size: contain;
}
.lpRunner {
  top: 233px;
  left: 1145px
}
.rpRunner {
  top: 257px;
  left: 760px;
}
.bar {
  height: 3px;
  position: absolute;
  left: 768px;
}
.lpBar {
  top: 240px;
  background-color: #bc3b76;
}
.rpBar {
  top: 264px;
  background-color: #2e81cc;
}
</style>
<script lang="ts">
import {defineComponent} from "vue";
import SpinOverlay from "@/components/GameModesOverlay/RouletteSpin.vue";
import CountdownBar from "@/components/CountdownBar.vue";
import { get } from "@/http";

export default defineComponent({
  name: 'ProOverlay',
  components: {SpinOverlay, CountdownBar},
  data() {
    return {
      matchData: {
        round: {
          additionalDetails: {}
        },
        players: ["",""],
        avatars: ["",""],
        scores: [0,0],
        countdown: 0
      },
      updateInterval: -1,
      matchId: "",
      animations: {
        leftBar: undefined as any,
        rightBar: undefined as any,
        leftRunner: undefined as any,
        rightRunner: undefined as any,
      },
      avatars: ["","","","","",""],
      loadCompleted: false,
    }
  },
  async created() {
    this.matchId = window.location.pathname.split("/").pop() as string;
    this.updateInterval = setInterval(this.update, 1000);
    await this.update();
    
    for (let i = 0; i < 2; i++) {
      // i = team
      for (let j = 0; j < 3; j++) {
        // j = player
        this.avatars[i*3 + j] = await this.getPfp(this.getTeamPlayers(this.matchData.players[i])[j].id);
      }
    }
    this.loadCompleted = true;
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
      if (this.loadCompleted) {
        this.animateBars();
        this.animateRunners();
      }
    },
    animateBars() {
      const leftBar = document.getElementById("leftBar") as HTMLElement;
      const rightBar = document.getElementById("rightBar") as HTMLElement;
      if (leftBar.style.width !== this.getBarWidth(this.currentDetails.currentSpin[0] + 1) && this.animations.leftBar === undefined) {
        this.animations.leftBar = leftBar.animate(
            [ {width: leftBar.style.width}, {width: this.getBarWidth(this.currentDetails.currentSpin[0] + 1)} ],
            {duration: 1000, iterations: 1, easing: "ease"});
        (this.animations.leftBar as Animation).onfinish = () => {
          leftBar.style.width = this.getBarWidth(this.currentDetails.currentSpin[0] + 1)
          this.animations.leftBar = undefined;
        }
      }
      if (rightBar.style.width !== this.getBarWidth(this.currentDetails.currentSpin[1] + 1) && this.animations.rightBar === undefined) {
        this.animations.rightBar = rightBar.animate(
            [ {width: rightBar.style.width}, {width: this.getBarWidth(this.currentDetails.currentSpin[1] + 1)} ],
            {duration: 1000, iterations: 1, easing: "ease"});
        (this.animations.rightBar as Animation).onfinish = () => {
          rightBar.style.width = this.getBarWidth(this.currentDetails.currentSpin[1] + 1);
          this.animations.rightBar = undefined;
        }
      }
    },
    animateRunners() {
      const leftRunner = document.getElementById("leftRunner") as HTMLElement;
      const rightRunner = document.getElementById("rightRunner") as HTMLElement;
      if (leftRunner.style.left !== this.getRunnerPos(this.currentDetails.currentSpin[0] + 1) && this.animations.leftRunner === undefined) {
        this.animations.leftRunner = leftRunner.animate(
            [ {left: leftRunner.style.left}, {left: this.getRunnerPos(this.currentDetails.currentSpin[0] + 1)}],
            {duration: 1000, iterations: 1, easing: "ease"});
        (this.animations.leftRunner as Animation).onfinish = () => {
          leftRunner.style.left = this.getRunnerPos(this.currentDetails.currentSpin[0] + 1);
          this.animations.leftRunner = undefined;
        }
      }
      if (rightRunner.style.left !== this.getRunnerPos(this.currentDetails.currentSpin[1] + 1) && this.animations.rightRunner === undefined) {
        this.animations.rightRunner = rightRunner.animate(
            [ {left: rightRunner.style.left}, {left: this.getRunnerPos(this.currentDetails.currentSpin[1] + 1)}],
            {duration: 1000, iterations: 1, easing: "ease"});
        (this.animations.rightRunner as Animation).onfinish = () => {
          rightRunner.style.left = this.getRunnerPos(this.currentDetails.currentSpin[1] + 1);
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
    },
    getTeamPlayers(team: string): {name: string, id: string}[] {
      switch(team) {
        case "TSM":
          return [{name: "Meekah", id: "201065244297003008"}, {name: "Scruffy", id: "692039323905818704"}, {name: "The_Rieper_47", id: "965361108103876698"}];
        case "Based Brothers":
          return [{name: "Jokerj", id: "700245922722087012"}, {name: "TheTimeCube", id: "226549387696930819"}, {name: "Phanium", id: "708231270341148744"}];
        case "The Rusty Buckets":
          return [{name: "Fe2o3", id: "961718533811736587"}, {name: "Nezuko Chan", id: "577924506471890976"}, {name: "OhShitMan", id: "588954743661920256"}];
        case "The Other Team":
          return [{name: "ThatObserver", id: "247092196874911744"}, {name: "Moo", id: "168470987031969792"}, {name: "Papierfresse", id: "795428895284396052"}];
        case "The Settling Men":
          return [{name: "Yannini", id: "229973032234516480"}, {name: "Pigiero", id: "161873616684843030"}, {name: "CurryMaker", id: "292699566782939137"}];
        case "The Janus Miracles":
          return [{name: "Xoa", id: "401437107307937792"}, {name: "Rommel Of The Far East", id: "438469962147954688"}, {name: "GiggsRH", id: "383663791931392001"}];
        case "Fruit Van Hustlers":
          return [{name: "ChannelJoined", id: "104959458517520384"}, {name: "apricope", id: "898701013136080957"}, {name: "Gorg", id: "284748621583482881"}];
        default:
          return [{name: "", id: ""}, {name: "", id: ""}, {name: "", id: ""}];
      }
    },
    async getPfp(discordId: string): Promise<string> {
      const avatar = await get(`/data/avatar/${discordId}`);
      if (avatar.status !== 200) {
        return "";
      }
      return avatar.data.avatar;
    }
  },
  computed: {
    currentRound(): any {
      return this.matchData.round;
    },
    currentDetails(): any {
      return this.matchData.round.additionalDetails;
    },
    leftSpinTimeRemaining() {
      let countdown = 0;
      if (this.currentDetails.currentSpinStart[0] === -1) {
        countdown = (this.currentRound.arrivingTimestamp + this.currentDetails.timelimit) - Date.now();
      } else {
        countdown = (this.currentDetails.currentSpinStart[0] + this.currentDetails.timelimit) - Date.now();
      }
      return Math.floor(countdown / 1000);
    },
    rightSpinTimeRemaining() {
      let countdown = 0;
      if (this.currentDetails.currentSpinStart[1] === -1) {
        countdown = (this.currentRound.arrivingTimestamp + this.currentDetails.timelimit) - Date.now();
      } else {
        countdown = (this.currentDetails.currentSpinStart[1] + this.currentDetails.timelimit) - Date.now();
      }
      return Math.floor(countdown / 1000);
    },
    leftSpinTotalTime(): number {
      if (this.currentDetails.currentSpin[0] + 1 === this.currentDetails.maps.length) {
        return -1;
      }
      return this.currentDetails.timelimit / 1000
    },
    rightSpinTotalTime(): number {
      if (this.currentDetails.currentSpin[1] + 1 === this.currentDetails.maps.length) {
        return -1;
      }
      return this.currentDetails.timelimit / 1000
    },
    rightPlayersFirstClass() {
      if (this.currentDetails?.activePlayers[1][this.currentDetails.currentSpin[1]] === 'Player 1') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    rightPlayersSecondClass() {
      if (this.currentDetails?.activePlayers[1][this.currentDetails.currentSpin[1]] === 'Player 2') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    rightPlayersThirdClass() {
      if (this.currentDetails?.activePlayers[1][this.currentDetails.currentSpin[1]] === 'Player 3') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    leftPlayersFirstClass() {
      if (this.currentDetails?.activePlayers[0][this.currentDetails.currentSpin[0]] === 'Player 1') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    leftPlayersSecondClass() {
      if (this.currentDetails?.activePlayers[0][this.currentDetails.currentSpin[0]] === 'Player 2') {
        return "activePlayer";
      } else {
        return "";
      }
    },
    leftPlayersThirdClass() {
      if (this.currentDetails?.activePlayers[0][this.currentDetails.currentSpin[0]] === 'Player 3') {
        return "activePlayer";
      } else {
        return "";
      }
    },
  }
})
</script>