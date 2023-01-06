<template>
  <div v-for="(target, index) in details.currentSpin.targetConditions" :key="index">
    <h5>Target {{ index+1 }}</h5>
    <v-select :items="details.disguiseOptions" return-object item-title="name"></v-select>
    <v-select :items="details.methodOptions" return-object item-title="name" v-model="condition"></v-select>
    <v-select :items="condition?.variants.concat([''])" v-if="condition?.variants.length > 0"></v-select>
  </div>
  <v-list>
    <v-list-item v-for="(player, index) in players" :key="index" lines="two">
    <v-list-item-title>{{ player }}</v-list-item-title> 
    <v-list-item-subtitle>Current status: {{ getPlayerStatus(index) }}</v-list-item-subtitle>
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
import {DateTime} from "luxon";

export default defineComponent({
  name: "SelectableSpinAdmin",
  props: [ 'players', 'details', 'matchId' ],
  emits: [ 'error' ],
  data() {
    return {
        condition: undefined
    }
  },
  methods: {
    getPlayerStatus(index: number): string {
      if (this.details.doneStatus[index] === 1) {
        return `Player pressed done @${this.timestampToLocale(this.details.lastDone[index])}`;
      } else if (this.details.doneStatus[index] === 2) {
        return `Player's done @${this.timestampToLocale(this.details.lastDone[index])} was accepted. Position: ${this.formatPlayerPosition(this.details.finishingOrder[index])}`;
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
    formatPlayerPosition(position: number): string {
      if (position % 10 === 1 && position !== 11) {
        return position + "st";
      }
      if (position % 10 === 2 && position !== 12) {
        return position + "nd";
      }
      if (position % 10 === 3 && position !== 13) {
        return position + "rd";
      }
      return position + "th";
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
    }
  }
})
</script>
