<template>
  <v-dialog v-model="show" persistent>
    <v-card>
      <v-card-title>Adding Round - {{ game_mode }}</v-card-title>
      <v-card-text>
        <GeneratorOption v-for="(item, index) in fields" :option="item" :key="index" @change="updateValue"></GeneratorOption>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="cancel">Cancel</v-btn><v-btn @click="addRound">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import { get } from '@/http';
import GeneratorOption from "@/components/GeneratorOption.vue";

export default defineComponent({
  name: 'AddRoundDialog',
  components: {GeneratorOption},
  props: [ 'game_mode' ],
  emits: [ 'done' ],
  data() {
    return {
      fields: [],
      show: true,
      values: {}
    };
  },
  async created() {
    const generatorData = await get('/data/game_modes/' + this.game_mode);
    this.fields = generatorData.data.generatorOptions;
  },
  methods: {
    cancel() {
      this.show = false;
      this.$emit('done', undefined);
    },
    addRound() {
      this.show = false;
      this.$emit('done', this.values);
    },
    updateValue(id: string, value: any) {
      (this.values as {[key: string]: unknown})[id] = value;
    }
  }
})
</script>
