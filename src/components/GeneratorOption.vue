<template>
  <v-text-field v-if="option.type === 'string'" :label="option.caption" v-model="value" @change="change"></v-text-field>
  <v-text-field v-if="option.type === 'number'" :label="option.caption" v-model="value" @change="change" :rules="[isNumber]"></v-text-field>
  <v-checkbox v-if="option.type === 'boolean'" :label="option.caption" v-model="value" @change="change"></v-checkbox>
  <v-select v-if="option.type === 'select'" v-model="value" :items="option.options" :label="option.caption" @change="change"></v-select>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: 'GeneratorOption',
  props: ['option'],
  emits: ['change'],
  data() {
    return {
      value: undefined
    }
  },
  methods: {
    change() {
      this.$emit('change', this.option.id, this.value);
    },
    isNumber(val: string) {
      if (/^\d+$/.test(val)) {
        return true;
      } else {
        return "Input must be a number";
      }
    }
  }
})
</script>
