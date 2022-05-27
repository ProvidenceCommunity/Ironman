<template>
  <v-container fluid>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="10">
        Matchid: {{ matchId }}<br>
        Players: {{ players }}<br>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { get } from '@/http';

export default defineComponent({
  name: 'AdminInterface',
  data() {
    return {
      matchId: "",
      players: "",
    }
  },
  async created() {
    this.matchId = window.location.pathname.split("/").pop() as string;
    const matchInfo = await get("/api/match/admin/" + this.matchId);
  }
})
</script>
