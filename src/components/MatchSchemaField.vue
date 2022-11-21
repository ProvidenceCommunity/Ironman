<template>
    <div>
        <span v-if="hasName">{{title || name}}:</span>
        <v-text-field outlined v-model="internalValue" v-if="type === 'string'" @change="update()"></v-text-field>
        <v-select outlined :items="options" v-model="internalValue" v-if="type === 'select'" @update:modelValue="update()">
            <template v-slot:append>
                <v-btn text v-if="type === 'select'" @click="randomize()">Random</v-btn>
            </template>
        </v-select>
        <v-btn icon v-if="type === 'list'" @click="addListItem()"><v-icon>mdi-plus-box</v-icon></v-btn>
        <v-btn icon v-if="type === 'list'" @click="removeListItem()"><v-icon>mdi-minus-box</v-icon></v-btn>
        <v-list v-if="type === 'list'">
        <v-list-item v-for="(item, index) of internalValue" :key="index">
            <template v-slot:prepend>
                <v-icon>mdi-circle-medium</v-icon>
            </template>
            <MatchSchemaField :type="options.type" :options="options.options" :value="internalValue[index]" @change="(e) => updateList(index, e)" :has-name="false" style="width: 100%"></MatchSchemaField>
        </v-list-item>
        </v-list>
    </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: "MatchSchemaField",
    data() {
        return {
            internalValue: this.value
        }
    },
    props: {
        hasName: {
            type: Boolean,
            default: true
        },
        name: String,
        type: String,
        options: null,
        value: [String, Array],
        title: String
    },
    emits: [ "change" ],
    methods: {
        randomize() {
            this.internalValue = this.options[Math.floor(Math.random()*this.options.length)];
            this.update();
        },
        addListItem() {
            if (typeof this.internalValue !== "object") {
                this.internalValue = [];
            }
            this.internalValue.push("");
            this.update();
        },
        removeListItem() {
            this.internalValue.pop();
            this.update();
        },
        updateList(index, element) {
            console.log(index);
            console.log(element);
            this.internalValue[index] = element;
            this.update();
        },
        update() {
            console.log("update");
            this.$emit('change', this.internalValue);
        },
    }
})
</script>
