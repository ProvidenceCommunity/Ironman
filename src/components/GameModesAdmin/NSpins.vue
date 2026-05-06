<template>
  <v-list>
    <v-list-item v-for="(player, index) in players" :key="index" lines="two">
      <v-list-item-title>{{ player }}</v-list-item-title>
      <v-list-item-subtitle>Current status: {{ getPlayerStatus(index as number) }}</v-list-item-subtitle>
      <template v-slot:append v-if="isPlayerDone(index as number)">
        <v-btn @click="acceptRun(index as number)" color="green">Accept</v-btn>
        <v-btn @click="rejectRun(index as number)" color="red">Reject</v-btn>
      </template>
    </v-list-item>
  </v-list>
  <template v-for="(spin, idx) in details.currentSpins" :key="idx">
    <h3>{{ spin.mission.name }}</h3>
    <v-btn @click="respin(idx as number)">Respin</v-btn><br>
    <RouletteSpin :spin="spin" />
    <v-divider />
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {post} from "@/http";
import RouletteSpin from '@/components/RouletteSpin.vue';
import {DateTime} from "luxon";

export default defineComponent({
  name: "NSpinsAdmin",
  components: { RouletteSpin },
  props: [ 'players', 'details', 'matchId' ],
  emits: [ 'error' ],
  data() {
    return {}
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
    async respin(mapIndex: number) {
      const resp = await post("/api/match/admin/" + this.matchId + "/respin", { mapIndex: mapIndex });
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while generating a new spin.");
      }
    }
  }
})
</script>
