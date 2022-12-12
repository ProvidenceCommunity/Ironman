<template>
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
  <v-text-field v-model="newCard" label="Card"></v-text-field><v-btn @click="sendNewCard">New card</v-btn>
  <BingoCard :card="this.details.card" :claimedTiles="this.details.claimedTiles" :mode="this.details.mode" @click="toggleTile"></BingoCard>
  <v-select :items="players" v-model="deselectPlayer" label="Toggle tiles for player"></v-select>
  <v-btn color="red" @click="fullReset">Full-Reset for player</v-btn>
  <v-btn @click="halfReset" v-if="halfClaimEnabled">Half-Reset for player</v-btn>
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
  emits: [ 'error' ],
  data() {
    return {
      newCard: "",
      deselectPlayer: undefined
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
      return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
    },
    async acceptRun(player: number) {
      const resp = await post("/api/match/admin/" + this.matchId + "/acceptDone", {playerIndex: player});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while accepting the player's run.");
      }
    },
    async rejectRun(player: number) {
      const resp = await post("/api/match/admin/" + this.matchId + "/rejectDone", {playerIndex: player});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while rejecting the player's run.");
      }
    },
    async sendNewCard() {
      const resp = await post(`/api/match/admin/${this.matchId}/newCard`, {card: this.newCard});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while setting a new card.");
      }
    },
    async toggleTile(x: number, y: number) {
      const resp = await post(`/api/match/player/${this.matchId}/${this.deselectPlayer}/tile`, {tile: ((y-1)*5+x-1)});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while trying to toggle the selected tile.");
      }
    },
    async fullReset() {
      const resp = await post(`/api/match/player/${this.matchId}/${this.deselectPlayer}/fullReset`, {});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while trying to reset the player.");
      }
    },
    async halfReset() {
      const resp = await post(`/api/match/player/${this.matchId}/${this.deselectPlayer}/halfReset`, {});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while trying to half-reset the player.");
      }
    }
  },
  computed: {
    halfClaimEnabled() {
      return this.details.halfClaimEnabled || false;
    }
  }
})
</script>
