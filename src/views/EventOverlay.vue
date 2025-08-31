<template>
  <div class="background" v-if="loadCompleted">
    <span class="playername p1">
      {{ fixedPlayerName(matchData.players[0]) }}
    </span>
    <span class="playername p2">
      {{ fixedPlayerName(matchData.players[1]) }}
    </span>
    <div class="playercards left" :style="getCardBackground(leftPlayerCard)">
      <template v-if="leftPlayerCard != null && leftPlayerCard != ''">
        <span class="cardtitle">{{ leftPlayerCard }}:</span>
        {{ getCardDescription(leftPlayerCard) }}
      </template>
    </div>
    <div class="playercards right" :style="getCardBackground(rightPlayerCard)">
      <template v-if="rightPlayerCard != null && rightPlayerCard != ''">
        <span class="cardtitle">{{ rightPlayerCard }}:</span>
        {{ getCardDescription(rightPlayerCard) }}
      </template>
    </div>
    
    <div class="card-overlay"></div>

    <div class="score left" :style="scoreColor(leftSuit)">
      {{ matchData.scores[0] }}
    </div>

    <div class="score right" :style="scoreColor(rightSuit)">
      {{ matchData.scores[1] }}
    </div>


    <img v-if="leftSuit == 0" src="../assets/wacky_scores/spade.png" alt="" class="suit left" />
    <img v-if="leftSuit == 1" src="../assets/wacky_scores/heart.png" alt="" class="suit left" />
    <img v-if="leftSuit == 2" src="../assets/wacky_scores/club.png" alt="" class="suit left" />
    <img v-if="leftSuit == 3" src="../assets/wacky_scores/diamond.png" alt="" class="suit left" />
    <img v-if="rightSuit == 0" src="../assets/wacky_scores/spade.png" alt="" class="suit right" />
    <img v-if="rightSuit == 1" src="../assets/wacky_scores/heart.png" alt="" class="suit right" />
    <img v-if="rightSuit == 2" src="../assets/wacky_scores/club.png" alt="" class="suit right" />
    <img v-if="rightSuit == 3" src="../assets/wacky_scores/diamond.png" alt="" class="suit right" />
    
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
  font-family: scream;
  src: url("@/assets/scream.ttf");
}

@font-face {
  font-family: jersey;
  src: url("@/assets/Jersey10-Regular.ttf");
}

.playername {
  font-family: scream;
  font-size: 40px;
  position: absolute;
  width: 700px;
  /* letter-spacing: 1px; */
  white-space: 0.1px;
  top: 40px;
  color: black;
  text-align: center;
}
.p1 {
  left: 40px;
}
.p2 {
  right: 40px;
}
.playercards {
  font-family: scream;
  font-size: 20px;
  position: absolute;
  width: 773px;
  /* letter-spacing: 1px; */
  white-space: 0.1px;
  top: 149px;
  padding-top: 4px;
  padding-left: 30px;
  padding-right: 30px;
  height: 99px;
  color: black;
  background-color: white;
}
.cardtitle {
  font-weight: bold;
}
.playercards.left {
  left: 8px;
}
.playercards.right {
  width: 770px;
  right: 6px;
}
.score {
  color: black;
  font-family: jersey;
  font-size: 150px;
  text-align: center;
  position: absolute;
  top: 20px;
  width: 125px;
}
.score.left {
  left: 834px;
}
.score.right {
  right: 834px;
}

.suit {
  position: absolute;
  top: 180px;
  width: 100px;
}
.suit.left {
  left: 847px;
}
.suit.right {
  right: 847px;
}

.background {
  position: absolute;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  background-image: url("@/assets/wacky-background.png");
}

.card-overlay {
  position: absolute;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  background-image: url("@/assets/wacky-playercards-overlay.png");
  z-index: 10;
}

.overlay {
  position: absolute;
  left: 0px;
  top: 813px;
}
</style>
<script lang="ts">
import {defineComponent} from "vue";
import { get } from "@/http";
import WideOverlay from "./WideOverlay.vue";
import ALL_CARDS from '@/wacky_cards.json';

export default defineComponent({
  name: 'ProOverlay',
  components: {WideOverlay},
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
      matchId: "",
      loadCompleted: false,
      leftSuit: Math.floor(Math.random() * 4),
      rightSuit: Math.floor(Math.random() * 4),
    }
  },
  async created() {
    this.matchId = window.location.pathname.split("/").pop() as string;
    this.updateInterval = window.setInterval(this.update, 1000);
    await this.update();

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
    scoreColor(suit: number) {
      switch (suit) {
        case 0:
          return "color: #3c4368";
        case 1:
          return "color: #f03464";
        case 2:
          return "color: #235955";
        case 3:
          return "color: #f06b3f";
      }
      return "color: black";
    },
    getCardDescription(cardName: string) {
        return ALL_CARDS.find((card) => card.title === cardName)?.description ?? "";
    },
    getCardBackground(cardName: string) {
        const cardType = ALL_CARDS.find((card) => card.title === cardName)?.category ?? "";
        switch (cardType) {
          case "Map":
            return "background-color: #ffe599";
          case "Settings":
            return "background-color: #ea9999";
          case "Loadout":
            return "background-color: #f9cb9c";
          case "Spin":
            return "background-color: #b4a7d6";
          case "Buff":
            return "background-color: #93c47d";
          case "Misc":
            return "background-color: #cccccc";
          case "Meta":
            return "background-color: #00ffff";
        }
        return "background-color: white";
    },
    fixedPlayerName(oldName: string) {
      switch (oldName) {
        case "userjoinedyourchannel":
          return "ChannelJoined";
        case "alphirox":
          return "Alph";
        case "aphrodytea_":
          return "aphro";
        case "channelreindeer":
          return "Channel Reindeer";
        case "cabben06":
          return "Cab";
        case "taranprits1":
          return "Taran";
        case "chrisx3_":
          return "ChrisX3";
        case "blithe51":
          return "Blithe";
        case "nezukochanpsn":
          return "Nezuko Chan";
        case "moo.2":
          return "Moo";
        case "scruffy05":
          return "Scruffy";
        default:
          return oldName;
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
    leftPlayerCard() {
      if (this.currentRound?.mode !== "wackyExtensions") {
        return null;
      }
      return this.currentDetails.cardsInPlay[0];
    },
    rightPlayerCard() {
      if (this.currentRound?.mode !== "wackyExtensions") {
        return null;
      }
      return this.currentDetails.cardsInPlay[1];
    }
  }
})
</script>