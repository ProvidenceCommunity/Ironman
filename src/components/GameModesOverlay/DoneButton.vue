<template>
  <h1>{{ data.title }}</h1>
  <h3>{{ data.additionalInfo }}</h3>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'DoneButtonOverlay',
  props: ['data'],
  data() {
    return {}
  }
})
</script>
