<template>
  <div class="background" v-if="loadCompleted">
    <span class="title">
      RRLAN 2025
    </span>

    <span class="playername p1">
      {{ matchData.players[0] }}
    </span>
    <span class="playername p2">
      {{ matchData.players[1] }}
    </span>
    <span class="playeraccolade acc1">
      {{ translateNameToAccolade(matchData.players[0]) }}
    </span>
    <span class="playeraccolade acc2">
      {{ translateNameToAccolade(matchData.players[1]) }}
    </span>

    <div class="score left">
      {{ matchData.scores[0] }}
    </div>

    <div class="score right">
      {{ matchData.scores[1] }}
    </div>


    <v-img :src="avatars[0]" width="167" height="167" class="pfp imgl"></v-img>
    <v-img :src="avatars[1]" width="167" height="167" class="pfp imgr"></v-img>
    
    <WideOverlay class="overlay" />
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
  font-family: skyfont;
  src: url("@/assets/Skyfont.otf");
}
@font-face {
  font-family: heavitas;
  src: url("@/assets/Heavitas.ttf");
}
.playername {
  font-family: heavitas;
  font-size: 50px;
  position: absolute;
  width: 590px;
  /* letter-spacing: 1px; */
  white-space: 0.1px;
  top: 88px;
  color: white;
}
.p1 {
  left: 273px;
}
.p2 {
  right: 253px;
  text-align: right;
}
.playeraccolade {
  font-family: heavitas;
  font-size: 31px;
  position: absolute;
  width: 590px;
  /* letter-spacing: 1px; */
  white-space: 0.1px;
  top: 177px;
  color: white;
}
.acc1 {
  left: 273px;
}
.acc2 {
  right: 259px;
  text-align: right;
}
.score {
  color: white;
  font-family: skyfont;
  font-size: 200px;
  text-align: center;
  position: absolute;
  top: 26px;
}
.score.left {
  left: 740px;
  text-align: right;
  width: 188px;
}
.score.right {
  left: 997px;
}

.pfp {
  position: absolute;
  top: 86px;
}
.imgl {
  left: 56px;
}
.imgr {
  right: 56px;
}
.background {
  position: absolute;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  /* background-image: url("@/assets/Overlay_example.png"); */
  background-image: url("@/assets/Overlay_template_2.png");
  /* background-color: black */
}
.overlay {
  position: absolute;
  left: 0px;
  top: 813px;
}
.title {
  font-family: heavitas;
  font-size: 50px;
  position: absolute;
  /* letter-spacing: 1px; */
  white-space: 0.1px;
  width: 1920px;
  text-align: center;
  left: 0px;
  color: white;
}
</style>
<script lang="ts">
import {defineComponent} from "vue";
import SpinOverlay from "@/components/GameModesOverlay/RouletteSpin.vue";
import CountdownBar from "@/components/CountdownBar.vue";
import { get } from "@/http";
import WideOverlay from "./WideOverlay.vue";

export default defineComponent({
  name: 'ProOverlay',
  components: {SpinOverlay, CountdownBar, WideOverlay},
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
      avatars: ["",""],
      loadCompleted: false,
    }
  },
  async created() {
    this.matchId = window.location.pathname.split("/").pop() as string;
    this.updateInterval = setInterval(this.update, 1000);
    await this.update();

    this.avatars[0] = await this.getPfp(this.translateNameToId(this.matchData.players[0]));
    this.avatars[1] = await this.getPfp(this.translateNameToId(this.matchData.players[1]));

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
    },
    async getPfp(discordId: string): Promise<string> {
      if (discordId === "") {
        return "";
      }
      const avatar = await get(`/data/avatar/${discordId}`);
      if (avatar.status !== 200) {
        return "";
      }
      return avatar.data.avatar;
    },
    translateNameToId(name: string) {
      switch(name.toLowerCase()) {
        case "thatobserver":
          return "247092196874911744";
        case "currymaker":
          return "292699566782939137";
        case "in4fun":
          return "412288950854746113";
        case "scruffy":
          return "692039323905818704";
        case "veggerby":
          return "203962938250231808";
        case "some random person":
        case "random":
        case "randy":
          return "247360708562518016";
        case "yannini":
          return "229973032234516480";
        case "aphro":
          return "374542927751413760";
        case "cab":
        case "cabben":
          return "319549223722811402";
        case "chrisx3":
          return "355182845141975042";
        case "falcon":
          return "100578817474572288";
        case "luke":
        case "lukedotpng":
          return "577656406010757130";
        case "pigiero":
          return "161873616684843030";
      }
      return "";
    },
    translateNameToAccolade(name: string) {
      switch(name.toLowerCase()) {
        case "thatobserver":
          return "Returning Rival";
        case "currymaker":
          return "Returning Rival";
        case "in4fun":
          return "RRWC 2020 & RR13 Champion";
        case "scruffy":
          return "RRWC 2024 & 3x RR Champion";
        case "veggerby":
          return "Returning Rival";
        case "some random person":
        case "random":
        case "randy":
          return "Returning Rival";
        case "yannini":
          return "3-Time RR Champion";
        case "aphro":
          return "Returning Rival";
        case "cab":
        case "cabben":
          return "Returning Rival";
        case "chrisx3":
          return "RR Finalist";
        case "falcon":
          return "Returning Rival";
        case "luke":
        case "lukedotpng":
          return "Returning Rival";
        case "pigiero":
          return "RR8 Champion";
        default:
          return "";
      }
    }
  },
  computed: {
    currentRound(): any {
      return this.matchData.round;
    },
    currentDetails(): any {
      return this.matchData.round.additionalDetails;
    },
  }
})
</script>