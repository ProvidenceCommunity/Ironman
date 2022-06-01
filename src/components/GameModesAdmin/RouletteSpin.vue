<template>
  <h1>{{ details.currentSpin.mission.name }}</h1>
  <v-btn @click="respin">Respin</v-btn><br>
  <RouletteCondition v-for="(target, index) in details.currentSpin.targetConditions" :key="index" :condition="target"></RouletteCondition>
  <v-list>
    <v-list-item v-for="(player, index) in players" :key="index">
      <v-list-item-title>{{ player }}</v-list-item-title>
      <b>Current status:</b> {{ getPlayerStatus(index) }}<br>
      <v-list-item-action v-if="isPlayerDone(index)">
        <v-btn @click="acceptRun(index)">Accept</v-btn>
        <v-btn @click="rejectRun(index)">Reject</v-btn>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {post} from "@/http";
import RouletteCondition from "@/components/RouletteCondition.vue";

export default defineComponent({
  name: "RouletteSpinAdmin",
  components: {RouletteCondition},
  props: [ 'players', 'details', 'matchId' ],
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
      return timestamp.toString();
    },
    async acceptRun(player: number) {
      await post("/api/match/admin/" + this.matchId + "/acceptDone", {playerIndex: player});
    },
    async rejectRun(player: number) {
      await post("/api/match/admin/" + this.matchId + "/rejectDone", {playerIndex: player});
    },
    async respin() {
      await post("/api/match/admin/" + this.matchId + "/respin", {});
    }
  }
})
</script>
