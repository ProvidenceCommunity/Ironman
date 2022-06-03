<template>
  <v-text-field v-model="newCard" label="Card"></v-text-field><v-btn @click="sendNewCard">New card</v-btn>
  <BingoCard :card="this.details.card" :claimedTiles="this.details.claimedTiles" :mode="this.details.mode"></BingoCard>
  <v-list>
    <v-list-item v-for="(player, index) in players" :key="index" lines="two">
      <v-list-item-header>
        <v-list-item-title>{{ player }}</v-list-item-title>
        <v-list-item-subtitle>Current status: {{ getPlayerStatus(index) }}</v-list-item-subtitle>
      </v-list-item-header>
      <template v-slot:append v-if="isPlayerDone(index)">
        <v-btn @click="acceptRun(index)" color="green">Accept</v-btn>
        <v-btn @click="rejectRun(index)" color="red">Reject</v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {post} from "@/http";
import BingoCard from "@/components/BingoCard.vue";
import {DateTime} from 'luxon';

export default defineComponent({
  name: "BingoAdmin",
  components: {BingoCard},
  props: [ 'players', 'details', 'matchId' ],
  data() {
    return {
      newCard: ""
    }
  },
  methods: {
    getPlayerStatus(index: number): string {
      if (this.details.doneStatus[index] === 1) {
        return `Player pressed done @${this.timestampToLocale(this.details.lastDone[index])}`;
      } else if (this.details.doneStatus[index] === 2) {
        return `Player's done @${this.timestampToLocale(this.details.lastDone[index])} was accepted.`;
      } else {
        return "running";
      }
    },
    isPlayerDone(index: number): boolean {
      return this.details.doneStatus[index] === 1;
    },
    timestampToLocale(timestamp: number): string {
      return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_SHORT);
    },
    async acceptRun(player: number) {
      await post("/api/match/admin/" + this.matchId + "/acceptDone", {playerIndex: player});
    },
    async rejectRun(player: number) {
      await post("/api/match/admin/" + this.matchId + "/rejectDone", {playerIndex: player});
    },
    async sendNewCard() {
      await post(`/api/match/admin/${this.matchId}/newCard`, {card: this.newCard});
    }
  }
})
</script>
