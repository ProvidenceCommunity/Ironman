<template>
    <v-dialog v-model="dialog" persistent>
        <v-card width="600" style="align-self: center">
            <v-card-title>Edit match</v-card-title>
            <v-card-text>
                <input type="datetime-local" label="Match date & time" v-model="datetime">
                <v-textarea v-model="players"></v-textarea>
                <v-divider></v-divider>
                <MatchSchemaField v-for="field of schema" :key="field.name" :name="field.name" :value="match?.schedulingData[field.name]" :options="field.options" :type="field.type" @change="(e) => newSchedulingInformation[field.name] = e" :title="field.title"></MatchSchemaField>
            </v-card-text>
            <v-card-actions>
                <v-btn text @click="cancel">Cancel</v-btn>
                <v-btn text @click="confirm" :loading="isSaving" :disabled="isSaving">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import { DateTime } from 'luxon';
import MatchSchemaField from './MatchSchemaField.vue'

export default defineComponent({
    name: "MatchEditDialog",
    components: {
        MatchSchemaField
    },
    props: ['showDialog', 'match', 'schema'],
    emits: ['cancel', 'save'],
    data() {
        return {
            datetime: "",
            players: "",
            newSchedulingInformation: {},
            isSaving: false
        }
    },
    methods: {
        resetDialog() {
            if (this.match !== null) {
                this.isSaving = false;
                if (this.match.timestamp <= 0) {
                    this.datetime = "";
                } else {
                    this.datetime = DateTime.fromMillis(this.match.timestamp).toFormat("yyyy-MM-dd'T'HH:mm");
                }
                this.players = this.match.players.join("\n");
                this.newSchedulingInformation = {};
                Object.assign(this.newSchedulingInformation, this.match.schedulingData);
            }
        },
        cancel() {
            this.$emit('cancel');
        },
        confirm() {
            this.isSaving = true;
            this.$emit('save', this.match.id, {
                timestamp: DateTime.fromISO(this.datetime).toMillis() || -1,
                players: this.players.split("\n"),
                schedulingData: this.newSchedulingInformation
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
