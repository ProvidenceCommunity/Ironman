<template>
  <h1>{{ details.title }}</h1>
  <h3>{{ details.additionalInfo }}</h3>
  <v-list>
    <v-list-item v-for="(player, index) in players" :key="index" lines="three">
      <v-list-item-header>
        <v-list-item-title>{{ player }}</v-list-item-title>
        <v-list-item-subtitle>Current status: {{ timeRemaining[index] }}</v-list-item-subtitle>
        <v-list-item-subtitle>Current RTA: {{ formatRTA(index) }}</v-list-item-subtitle>
      </v-list-item-header>
      <template v-slot:append v-if="isPlayerDone(index)">
        <v-btn @click="accept(index, 'Done')" color="green">Accept DONE</v-btn>
        <v-btn @click="reject(index, 'Done')" color="red">Reject DONE</v-btn>
      </template>
      <template v-slot:append v-if="hasPlayerForfeitted(index)">
        <v-btn @click="accept(index, 'Forfeit')" color="green">Accept FORFEIT</v-btn>
        <v-btn @click="reject(index, 'Forfeit')" color="red">Reject FORFEIT</v-btn>
      </template>
    </v-list-item>
  </v-list>
  <br><br>
  <v-expansion-panels multiple>
    <v-expansion-panel v-for="(map, index) in details.maps" :key="index">
      <v-expansion-panel-title>Map #{{index + 1}} - {{map.mission.name}}</v-expansion-panel-title>
      <v-expansion-panel-text>
        <RouletteCondition v-for="(target, index) in map.targetConditions" :key="index" :condition="target"></RouletteCondition>
        <v-btn @click="respin(index)">Respin</v-btn>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {post} from "@/http";
import {DateTime, Duration} from "luxon";
import RouletteCondition from '@/components/RouletteCondition.vue';

export default defineComponent({
  name: "RelayAdmin",
  props: [ 'players', 'details', 'matchId', 'arrivalTimestamp' ],
  emits: [ 'error' ],
  components: {
    RouletteCondition
  },
  data() {
    return {
      updateInterval: -1,
      timeRemaining: [] as string[]
    }
  },
  created() {
    this.updateInterval = setInterval(this.updateTimers, 1000);
  },
  beforeUnmount() {
    for (const player in this.players) {
      this.timeRemaining.push("");
    }
    clearInterval(this.updateInterval);
  },
  methods: {
    updateTimers() {
      for (let i = 0; i < this.players.length; i++) {
        this.timeRemaining[i] = this.getPlayerStatus(i);
      }
    },
    getPlayerStatus(index: number): string {
      if (this.details.doneStatus[index] === 1) {
        return `Player pressed done @${this.timestampToLocale(this.details.lastDone[index])}`;
      } else if (this.details.doneStatus[index] === 3) {
          return `Player forfeitted @${this.timestampToLocale(this.details.lastDone[index])}`;
      } else if (this.details.doneStatus[index] === 2) {
        return `Player's done @${this.timestampToLocale(this.details.lastDone[index])} was accepted.`;
      } else if (this.details.doneStatus[index] === 4) {
        return `Player's forfeit @${this.timestampToLocale(this.details.lastDone[index])} was accepted.`;
      } else {
        let countdown = Duration.fromMillis(0);
        if (this.details.currentSpinStart[index] === -1) {
          countdown = Duration.fromMillis((this.arrivalTimestamp + this.details.timelimit) - Date.now());
        } else {
          countdown = Duration.fromMillis((this.details.currentSpinStart[index] + this.details.timelimit) - Date.now());
        }
        if (this.details.currentSpin[index] + 1 === this.details.maps.length) {
          return `running on Map ${this.details.currentSpin[index] + 1} / ${this.details.maps.length} with unlimited time remaining`;
        } else {
          return `running on Map ${this.details.currentSpin[index] + 1} / ${this.details.maps.length} with ${countdown.toFormat("mm:ss")} remaining`;
        }
      }
    },
    formatRTA(index: number): string {
      let r = "Per Map: ";
      r += (this.details.rta[index] as number[]).map((e) => {return this.millisecondsToFormat(e)}).join(", ");
      r += "; Total RTA: ";
      r += this.millisecondsToFormat((this.details.rta[index] as number[]).reduce((previousValue, currentValue) => { return previousValue + currentValue}));
      return r;
    },
    millisecondsToFormat(ms: number): string {
      return Duration.fromMillis(ms).toFormat("mm:ss");
    },
    isPlayerDone(index: number): boolean {
      return this.details.doneStatus[index] === 1;
    },
    hasPlayerForfeitted(index: number): boolean {
      return this.details.doneStatus[index] === 3;
    },
    timestampToLocale(timestamp: number): string {
      return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
    },
    async accept(player: number, type: string) {
      const resp = await post("/api/match/admin/" + this.matchId + "/accept" + type, {playerIndex: player});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while accepting the player's run.");
      }
    },
    async reject(player: number, type: string) {
      const resp = await post("/api/match/admin/" + this.matchId + "/reject" + type, {playerIndex: player});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while rejecting the player's run.");
      }
    },
    async respin(map: number) {
      const resp = await post("/api/match/admin/" + this.matchId + "/respin", {mapIndex: map});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while respinning.");
      }
    }
  }
})
</script>
