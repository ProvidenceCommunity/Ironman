<template>
  <h1>{{details.title}}</h1>
  <h3>{{details.additionalInfo}}</h3>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "TimerPlayer",
  props: [ 'details' ],
  data() {
    return {}
  }
})
</script>
