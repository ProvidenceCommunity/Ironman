<template>
  <v-text-field v-if="option.type === 'string'" :label="option.caption" v-model="value"></v-text-field>
  <v-text-field v-if="option.type === 'number'" :label="option.caption" v-model="value" :rules="[isNumber]" type="number"></v-text-field>
  <v-checkbox v-if="option.type === 'boolean'" :label="option.caption" v-model="value"></v-checkbox>
  <v-select v-if="option.type === 'select'" v-model="value" :items="option.options" :label="option.caption"></v-select>
  <div v-if="option.type === 'list'">
    <span>{{option.caption}}</span>
    <v-btn class="float-right" @click="addListItem">+</v-btn>
    <v-btn class="float-right ml-5" @click="removeListItem">-</v-btn><br><br>
    <ul>
      <li v-for="(item, index) in list" :key="index"><GeneratorOption :option="transformListOption(option.options, index)" @change="changeList"></GeneratorOption></li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: 'GeneratorOption',
  props: ['option'],
  emits: ['change'],
  data() {
    return {
      value: undefined,
      list: [] as any[]
    }
  },
  methods: {
    isNumber(val: string) {
      if (/^\d+$/.test(val)) {
        return true;
      } else {
        return "Input must be a number";
      }
    },
    changeList(id: number, val: any) {
      this.list[id] = val;
      this.$emit('change', this.option.id, this.list);
    },
    addListItem() {
      this.list.push(undefined);
    },
    removeListItem() {
      this.list.pop();
    },
    transformListOption(option: any, index: number) {
      const newOption = JSON.parse(JSON.stringify(option));
      newOption.id = index;
      return newOption
    }
  },
  watch: {
    value(newVal, oldVal) {
      this.$emit('change', this.option.id, this.value);
    }
  }
})
</script>
