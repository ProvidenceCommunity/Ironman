<template>
    <v-autocomplete style="margin-bottom: 8px;" v-for="(player, index) in players" :key="index" :items="allCards" :label="'Card used by ' + player" v-model="cards[index]" @update:model-value="setCards" density="compact" persistent-hint :hint="getCardDescription(cards[index])" />
    <RouletteSpinAdmin :players="players" :details="details" :matchId="matchId" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { post } from "@/http";
import RouletteSpinAdmin from './RouletteSpin.vue';
import ALL_CARDS from '@/wacky_cards.json';

const allCards = ALL_CARDS.map((card) => card.title);

export default defineComponent({
    name: "WackyExtensionAdmin",
    components: { RouletteSpinAdmin },
    props: [ 'players', 'details', 'matchId' ],
    emits: [ 'error' ],
    data() {
        return {
            cards: this.details.cardsInPlay,
            allCards: allCards
        }
    },
    methods: {
        async setCards() {
            const resp = await post("/api/match/admin/" + this.matchId + "/setCards", { cards: this.cards });
            if (resp.status !== 204) {
                this.$emit("error", "An error occurred while accepting the player's run.");
            }
        },
        getCardDescription(cardName) {
            return ALL_CARDS.find((card) => card.title === cardName)?.description ?? "";
        }
    }
})
</script>