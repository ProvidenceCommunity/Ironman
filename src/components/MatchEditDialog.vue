<template>
    <v-dialog v-model="dialog" persistent>
        <v-card width="600" style="align-self: center">
            <v-card-title>Edit match</v-card-title>
            <v-card-text>
                <input type="datetime-local" label="Match date & time" v-model="datetime">
                <v-textarea v-model="players"></v-textarea>
                <v-divider></v-divider>
                <!-- TODO: Match Fields -->
            </v-card-text>
            <v-card-actions>
                <v-btn text @click="cancel">Cancel</v-btn>
                <v-btn text @click="confirm">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
    name: "MatchEditDialog",
    props: ['showDialog', 'match', 'schema'],
    emits: ['cancel', 'save'],
    data() {
        return {
            datetime: "",
            players: ""
        }
    },
    methods: {
        resetDialog() {
            if (this.match !== null) {
                this.datetime = "";
                this.players = this.match.players.join("\n");
            }
        },
        cancel() {
            this.$emit('cancel');
        },
        confirm() {
            this.$emit('save', this.match.id, {
                datetime: this.datetime,
                players: this.players
            });
        }
    },
    computed: {
        dialog() {
            return this.showDialog;
        }
    },
    watch: {
        match() {
            this.resetDialog();
        }
    }
})
</script>
