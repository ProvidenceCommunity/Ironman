<template>
  <h1>{{ details.title }}</h1>
  <h3>{{ details.additionalInfo }}</h3>
  <v-list>
    <v-list-item v-for="(player, index) in players" :key="index">
      <v-list-item-title>{{ player }}</v-list-item-title>
      <b>Current status:</b> {{ getPlayerStatus(index) }}<br>
      <v-list-item-action v-if="isPlayerDone(index)">
        <v-btn>Accept</v-btn>
        <v-btn>Reject</v-btn>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DoneButtonAdmin",
  props: [ 'players', 'details' ],
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
    }
  }
})
</script>
