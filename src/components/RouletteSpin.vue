<template>
    <div :class="`spin spins-${spin.targetConditions.length}`">
        <RouletteCondition v-for="(target, i) in spin.targetConditions" :target="target" :key="i" :noIcons="spin.targetConditions.length > 4" :editable="editable" @editCondition="(v) => $emit('editCondition', v)" @editDisguise="(v) => $emit('editDisguise', v)" @toggleNtko="(v) => $emit('toggleNtko', v)" />
        <RouletteAdditionalCondition v-for="(objective, i) in spin.additionalObjectives" :objective="objective" :key="i" :noIcons="spin.targetConditions.length > 4" :editable="editable" @editMethod="(v) => $emit('editMethod', v)" @editDisguise="(v) => $emit('editDisguise', v)" />
    </div>
</template>

<style lang="scss" scoped>
.spin {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    > * {
        background: rgba(0, 0, 0, 0.75);
        flex: 0 0 23rem;
    }
    &.spins-4,
    &.spins-5 {
        padding: 1rem 0;
        flex-wrap: wrap;
        > * {
            flex: 1 0 16rem;
        }
    }
    @media (orientation: portrait) and (max-width: 800px) {
        flex-direction: column;
        > * {
            width: 100%;
            flex: 0 1 auto !important;
            min-width: auto;
        }
    }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import RouletteCondition from '@/components/RouletteCondition.vue';
import RouletteAdditionalCondition from '@/components/RouletteAdditionalCondition.vue';

export default defineComponent({
    name: 'RouletteSpin',
    props: ['spin', 'editable'],
    components: {
        RouletteCondition, RouletteAdditionalCondition,
    },
    emits: [
        'editCondition'
    ],
});
</script>
