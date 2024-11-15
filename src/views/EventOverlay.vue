<template>
  <div class="background" v-if="loadCompleted">
    <span class="playername p1">
      {{ matchData.players[0] }}<br>
      5th placer
    </span>
    <span class="playername p2">
      {{ matchData.players[1] }}<br>
      5th placer
    </span>

    <span class="score">
      [{{ matchData.scores[0] }}-{{ matchData.scores[1] }}]
    </span>

    <v-img :src="avatars[0]" width="160" height="160" class="pfp imgl"></v-img>
    <v-img :src="avatars[1]" width="160" height="160" class="pfp imgr"></v-img>
    
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
  font-family: turnbb;
  src: url("@/assets/TURNBB.TTF");
}
@font-face {
  font-family: permanentMarker;
  src: url("@/assets/PermanentMarker.ttf");
}
.playername {
  font-family: turnbb;
  font-size: 40px;
  position: absolute;
  width: 590px;
  letter-spacing: 1px;
  white-space: 0.1px;
  top: 90px;
  color: white;
}
.p1 {
  left: 220px;
}
.p2 {
  right: 220px;
  text-align: right;
}
.score {
  color: white;
  font-family: permanentMarker;
  font-size: 135px;
  text-align: center;
  top: 50px;
  left: 785px;
  position: absolute;
}
.pfp {
  border-radius: 10px;
  position: absolute;
  top: 70px;
}
.imgl {
  left: 50px;
}
.imgr {
  right: 50px;
}
.background {
  position: absolute;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  /* background-image: url("@/assets/FFF_Back_Unclean_2.png"); */
  /* background-color: black */
}
.overlay {
  position: absolute;
  left: 235px;
  top: 813px;
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
        case "sovietdubov":
          return "623597622271279126";
        case "channel reindeer":
          return "292699566782939137";
        case "dynaso":
          return "392817376623722507";
        case "linux_penguin":
          return "603970242053537824";
        case "falcon":
          return "100578817474572288";
        case "parapluie":
          return "664320213700968478";
        case "aphro":
          return "374542927751413760";
        case "rommel":
          return "438469962147954688";
      }
      return "";
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