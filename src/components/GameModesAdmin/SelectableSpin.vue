<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-title>Curate Spin</v-expansion-panel-title>
      <v-expansion-panel-text>
        <div v-for="(target, index) in details.currentSpin.targetConditions" :key="index">
          <h5>Target {{ index+1 }}</h5>
          <v-row>
            <v-col><v-select label="Method" :items="details.methodOptions" return-object item-title="name" @update:modelValue="(e) => { updateMethod(index, e) }" v-model="conditions[index]"></v-select></v-col>
            <v-col><v-select label="Variant" :items="conditions[index]?.variants.concat([''])" v-if="conditions[index]?.variants.length > 0" @update:modelValue="(e) => { updateVariant(index, e) }" v-model="variants[index]"></v-select></v-col>
            <v-col><v-select label="Chosen by" :items="selectedByOptions"  @update:modelValue="(e) => { updateSelectedMethod(index, e) }"></v-select></v-col>
          </v-row>
          <v-row>
            <v-col><v-select label="Disguise" :items="details.disguiseOptions" return-object item-title="name" @update:modelValue="(e) => { updateDisguise(index, e) }" v-model="disguises[index]"></v-select></v-col>
            <v-col></v-col>
            <v-col><v-select label="Chosen by" :items="selectedByOptions"  @update:modelValue="(e) => { updateSelectedDisguise(index, e) }"></v-select></v-col>
          </v-row>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
  <br>
  <v-divider></v-divider>
  <br>
  <v-row no-gutters>
    <v-col v-for="(target, index) in details.currentSpin.targetConditions" :key="index" cols="6">
      <FreestyleCondition :condition="target"></FreestyleCondition>
    </v-col>
  </v-row>
  <br>
  <v-divider></v-divider>
  <br>
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
import FreestyleCondition from "../FreestyleCondition.vue";

export default defineComponent({
  name: "SelectableSpinAdmin",
  components: {
    FreestyleCondition
  },
  props: [ 'players', 'details', 'matchId' ],
  emits: [ 'error' ],
  data() {
    return {
        disguises: this.details.currentSpin.targetConditions.map(() => { return undefined }),
        variants: this.details.currentSpin.targetConditions.map(() => { return undefined }),
        conditions: this.details.currentSpin.targetConditions.map(() => { return undefined })
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
    },
    async updateSpin(spin: any) {
      const resp = await post("/api/match/admin/" + this.matchId + "/updateSpin", { spin: spin });
      if (resp.status !== 204) {
        this.$emit("error", "An error occured while updating the spin.");
      }
    },
    async updateDisguise(targetIndex: number, disguise: any) {
      const newSpin = Object.assign({}, this.details.currentSpin);
      newSpin.targetConditions[targetIndex].disguise.name = disguise.name;
      newSpin.targetConditions[targetIndex].disguise.tileUrl = disguise.image;
      await this.updateSpin(newSpin);
    },
    async updateMethod(targetIndex: number, method: any) {
      const newSpin = Object.assign({}, this.details.currentSpin);
      newSpin.targetConditions[targetIndex].killMethod.name = method.name;
      newSpin.targetConditions[targetIndex].killMethod.tileUrl = method.tileUrl;
      await this.updateSpin(newSpin);
    },
    async updateVariant(targetIndex: number, variant: any) {
      const newSpin = Object.assign({}, this.details.currentSpin);
      newSpin.targetConditions[targetIndex].killMethod.variant = variant;
      await this.updateSpin(newSpin);
    },
    async updateSelectedMethod(targetIndex: number, selectedBy: any) {
      const newSpin = Object.assign({}, this.details.currentSpin);
      newSpin.targetConditions[targetIndex].killMethod.selectedBy = selectedBy;
      if (selectedBy == 0) {
        // Random selection
        this.conditions[targetIndex] = this.randomElement(this.details.methodOptions);
        
        newSpin.targetConditions[targetIndex].killMethod.name = this.conditions[targetIndex].name;
        newSpin.targetConditions[targetIndex].killMethod.tileUrl = this.conditions[targetIndex].tileUrl;

        if (this.conditions[targetIndex].variants.length > 0) {
          this.variants[targetIndex] = this.randomElement(this.conditions[targetIndex].variants.concat([""]));
          newSpin.targetConditions[targetIndex].killMethod.variant = this.variants[targetIndex];
        } else {
          newSpin.targetConditions[targetIndex].killMethod.variant = "";
        }
      }
      await this.updateSpin(newSpin);
    },
    async updateSelectedDisguise(targetIndex: number, selectedBy: any) {
      const newSpin = Object.assign({}, this.details.currentSpin);
      newSpin.targetConditions[targetIndex].disguise.selectedBy = selectedBy;
      if (selectedBy == 0) {
        // Random selection
        this.disguises[targetIndex] = this.randomElement(this.details.disguiseOptions);
        
        newSpin.targetConditions[targetIndex].disguise.name = this.disguises[targetIndex].name;
        newSpin.targetConditions[targetIndex].disguise.tileUrl = this.disguises[targetIndex].image;
      }
      await this.updateSpin(newSpin);
    },
    randomElement(array: any[]): any {
      return array[Math.floor(Math.random() * array.length)];
    }
  },
  computed: {
    selectedByOptions() {
      return [{ title: "Random", value: 0 }].concat(this.players.map((e: string, idx: number) => { return { title: e, value: idx + 1 }}));
    }
  }
})
</script>
