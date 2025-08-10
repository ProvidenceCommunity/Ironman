<template>
    <v-dialog v-model="show" persistent>
        <v-card style="align-self: center">
            <v-card-title>Select Disguise</v-card-title>
            <v-card-text>
                <div class="condition-grid">
                    <div v-for="(disguise, idx) of disguises" :key="idx" class="condition-container">
                        <img :src="disguise.image" />
                        <div class="button" @click="selectDisguise(disguise)">
                            {{ disguise.suit ? 'Suit' : disguise.name }}
                        </div>
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="$emit('cancel')">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.condition-grid {
    display: grid;
    grid-template-columns: auto auto auto auto;
}
.condition-container {
    display: flex;
    flex-direction: row;
    height: 70px;
    align-content: center;
}
.button {
    text-align: center;
    padding-top: 4px;
    padding-bottom: 4px;
    flex-grow: 1;
}
.button:hover {
    background-color: gray;
}
</style>

<script lang="ts">
import axios from 'axios';
import { defineComponent } from 'vue';

export default defineComponent({
    name: "SpinDisguiseEditor",
    props: [ 'mission' ],
    emits: [ 'select', 'cancel' ],
    data() {
        return {
            show: true,
            disguises: []
        }
    },
    async mounted() {
        const splitMission = this.mission.split("|");
        this.disguises = (await axios.get(`https://api.hitmaps.com/api/games/${splitMission[0]}/locations/${splitMission[1]}/missions/${splitMission[2]}/disguises`)).data.disguises;
    },
    methods: {
        selectDisguise(disguise) {
            this.$emit('select', { 
                name: disguise.suit ? 'Suit' : disguise.name,
                tileUrl: disguise.image,
            });
        }
    }
});
</script>