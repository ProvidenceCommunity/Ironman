<template>
    <div class="hitman-icon" :class="{ bordered: bordered, hasText: text }">
        <i v-if="icon" :class="`hm-${icon}`" />
        <span v-else-if="text" class="hm-icon-text">{{ text }}</span>
    </div>
</template>

<script>
export default {
    name: 'HitmanIcon',
    props: {
        icon: {
            type: String,
            required: false,
        },
        text: {
            type: String,
            required: false,
        },
        bordered: {
            type: Boolean,
            default: true,
        },
    },
};
</script>

<style lang="scss">
.hitman-icon {
    &.bordered {
        display: inline-block;
        line-height: 0;
        padding: 0.25rem;
        border: 1.5px solid currentColor;
        border-radius: 4px;
        margin: 0 0.25rem;
    }
    &.hasText {
        padding: 1em 0.75em;
    }
}
</style>
