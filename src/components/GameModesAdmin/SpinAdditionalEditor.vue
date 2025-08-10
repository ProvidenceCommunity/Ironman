<template>
    <v-dialog v-model="show" persistent>
        <v-card style="align-self: center">
            <v-card-title>Select Method</v-card-title>
            <v-card-text>
                <div class="condition-grid">
                    <div v-for="(method, idx) of methods" :key="idx" class="condition-container">
                        <img :src="method.tileUrl" />
                        <div class="button" @click="selectMethod(method)">
                            {{ method.name }}
                        </div>
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-select label="Selected by" :items="['-- none --', 'Player 1', 'Player 2']" />
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
    name: "SpinAdditionalEditor",
    props: [ 'mission', 'objective' ],
    emits: [ 'select', 'cancel' ],
    data() {
        return {
            show: true,
            methods: []
        }
    },
    async mounted() {
        const splitMission = this.mission.split("|");
        const query = new URLSearchParams();
        query.set("missionGame", splitMission[0]);
        query.set("missionLocation", splitMission[1]);
        query.set("missionSlug", splitMission[2]);
        query.set("objectiveName", this.objective);

        this.methods = (await axios.get(`https://rouletteapi.hitmaps.com/api/spins/additional-objectives?${query.toString()}`)).data;
    },
    methods: {
        selectMethod(method) {
            this.$emit('select', { 
                name: method.name,
                tileUrl: method.tileUrl,
            });
        }
    }
});
</script>