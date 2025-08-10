<template>
  <SpinConditionEditor v-if="editingCondition != ''" :mission="details.generatorOptions.missionPool[0]" :target="editingCondition" :generatorOptions="details.generatorOptions.criteriaFilters" @cancel="editingCondition = ''" @select="selectCondition" />
  <SpinDisguiseEditor v-if="editingDisguise != ''" :mission="details.generatorOptions.missionPool[0]" @cancel="editingDisguise = ''" @select="selectDisguise" />
  <SpinAdditionalEditor v-if="editingAdditional != ''" :mission="details.generatorOptions.missionPool[0]" :objective="editingAdditional" @cancel="editingAdditional = ''" @select="selectAdditionalMethod" />
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
  <h1>{{ details.currentSpin.mission.name }}</h1>
  <v-btn @click="respin">Respin</v-btn><br>
  <RouletteSpin :spin="details.currentSpin" :editable="true" @editCondition="(v) => editingCondition = v" @editDisguise="(v) => editingDisguise = v" @toggleNtko="toggleNtko" @editMethod="(v) => editingAdditional = v" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {post} from "@/http";
import RouletteSpin from "@/components/RouletteSpin.vue";
import {DateTime} from "luxon";
import SpinConditionEditor from "./SpinConditionEditor.vue";
import SpinDisguiseEditor from "./SpinDisguiseEditor.vue";
import SpinAdditionalEditor from "./SpinAdditionalEditor.vue";

export default defineComponent({
  name: "RouletteSpinAdmin",
  components: {RouletteSpin, SpinConditionEditor, SpinDisguiseEditor, SpinAdditionalEditor},
  props: [ 'players', 'details', 'matchId' ],
  emits: [ 'error' ],
  data() {
    return {
      editingCondition: "",
      editingDisguise: "",
      editingAdditional: "",
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
    async respin() {
      const resp = await post("/api/match/admin/" + this.matchId + "/respin", {});
      if (resp.status !== 204) {
        this.$emit("error", "An error occurred while generating a new spin.");
      }
    },
    async selectCondition(condition) {
      for (const targetIdx in this.details.currentSpin.targetConditions) {
        if (this.details.currentSpin.targetConditions[targetIdx].target.name === this.editingCondition) {
          this.details.currentSpin.targetConditions[targetIdx].killMethod = condition;
        }
      }
      const resp = await post("/api/match/admin/" + this.matchId + "/updateSpin", { spin: this.details.currentSpin });
      if (resp.status !== 204) {
        this.$emit("error", "An error occured while saving the kill method.");
      }
      this.editingCondition = "";
    },
    async selectDisguise(disguise) {
      for (const targetIdx in this.details.currentSpin.targetConditions) {
        if (this.details.currentSpin.targetConditions[targetIdx].target.name === this.editingDisguise) {
          this.details.currentSpin.targetConditions[targetIdx].disguise = disguise;
        }
      }
      for (const targetIdx in this.details.currentSpin.additionalObjectives) {
        if (this.details.currentSpin.additionalObjectives[targetIdx].objective.name === this.editingDisguise) {
          this.details.currentSpin.additionalObjectives[targetIdx].disguise = disguise;
        }
      }
      const resp = await post("/api/match/admin/" + this.matchId + "/updateSpin", { spin: this.details.currentSpin });
      if (resp.status !== 204) {
        this.$emit("error", "An error occured while saving the disguise.");
      }
      this.editingDisguise = "";
    },
    async toggleNtko(target) {
      for (const targetIdx in this.details.currentSpin.targetConditions) {
        if (this.details.currentSpin.targetConditions[targetIdx].target.name === target) {
          if (this.details.currentSpin.targetConditions[targetIdx].complications.length === 0) {
            this.details.currentSpin.targetConditions[targetIdx].complications = [
              { name: "No Target Pacification", description: "If you pacify or subdue the target in any way, you immediately fail the spin.", tileUrl: "https://media.hitmaps.com/img/hitman3/contracts/gamechangers/gamechanger_global_nopacifications.jpg" }
            ];
          } else {
            this.details.currentSpin.targetConditions[targetIdx].complications = [];
          }
        }
      }
      const resp = await post("/api/match/admin/" + this.matchId + "/updateSpin", { spin: this.details.currentSpin });
      if (resp.status !== 204) {
        this.$emit("error", "An error occured while saving the disguise.");
      }
    },
    async selectAdditionalMethod(method) {
      for (const targetIdx in this.details.currentSpin.additionalObjectives) {
        if (this.details.currentSpin.additionalObjectives[targetIdx].objective.name === this.editingAdditional) {
          this.details.currentSpin.additionalObjectives[targetIdx].completionMethod = method;
        }
      }
      const resp = await post("/api/match/admin/" + this.matchId + "/updateSpin", { spin: this.details.currentSpin });
      if (resp.status !== 204) {
        this.$emit("error", "An error occured while saving the kill method.");
      }
      this.editingAdditional = "";
    }
  }
})
</script>
