<template>

    <div v-if="details.currentMapIndex < details.totalMaps">
      <h3>Map #{{details.currentMapIndex + 1}}/{{details.totalMaps}}</h3>
      <CountdownBar :total-time="totalTime" :time-remaining="details.countdown / 1000"></CountdownBar>
      <RouletteSpin v-if="details.map !== undefined" :spin="details.map" />
      <h5>Please click the done button upon finishing!</h5>
      <v-btn @click="done" size="x-large">{{ buttonText }}</v-btn><br><br>
      <template v-if="details.allowForfeits">
        Warning! Forfeiting will add {{ forfeitTime }} of RTA to your time.<br>
        Forfeits must be accepted by the match admin.
        <v-btn @click="forfeit" color="red">{{ forfeitText }}</v-btn>
      </template>
    </div>
    <div v-else>
      <h1>You're through with all maps!</h1>
    </div>
  </template>
  
  <script lang="ts">
  import {defineComponent} from "vue";
  import {post} from "@/http";
  import RouletteSpin from '@/components/RouletteSpin.vue';
  import CountdownBar from "@/components/CountdownBar.vue";
import { Duration } from "luxon";
  
  export default defineComponent({
    name: "RelayPlayer",
    props: ['matchId', 'player', 'details'],
    emits: ['error'],
    components: {
      CountdownBar,
      RouletteSpin,
    },
    data() {
      return {
        sendingDone: false,
        timer: -1,
        rejectedFor: 0,
        map: "",
        cachedStatus: 0,
      }
    },
    created() {
      this.timer = setInterval(this.rejectionTimer, 1000);
    },
    beforeUnmount() {
      clearInterval(this.timer);
    },
    methods: {
      async done() {
        this.sendingDone = true;
        this.map = this.details.map.mission.slug;
        const resp = await post('/api/match/player/' + this.matchId + '/' + this.player + '/done', {});
        this.sendingDone = false;
        if (resp.status !== 204) {
          this.$emit("error", "An error occurred while sending the 'done' signal. Please inform your match admin via discord.");
        } else {
          this.cachedStatus = 1;
        }
      },
      async forfeit() {
        this.sendingDone = true;
        this.map = this.details.map.mission.slug;
        const resp = await post('/api/match/player/' + this.matchId + '/' + this.player + '/forfeit', {});
        this.sendingDone = false;
        if (resp.status !== 204) {
          this.$emit("error", "An error occurred while sending the 'done' signal. Please inform your match admin via discord.");
        } else {
          this.cachedStatus = 3;
        }
      },
      rejectionTimer() {
        if (this.rejectedFor > 0) {
          this.rejectedFor--;
        }
      },
    },
    computed: {
      buttonText() {
        if (this.sendingDone) return "Sending done...";
        if (this.rejectedFor > 0) return "REJECTED!";
        switch (this.cachedStatus) {
          case 0:
            return "DONE";
          case 1:
            return "Awaiting verification...";
          case 2:
            return "Run verified!"
          case 3:
            return "Awaiting forfeit accept...";
          case 4:
            return "Forfeit accepted!";
          default:
            return "";
        }
      },
      forfeitText() {
        if (!this.sendingDone && this.rejectedFor <= 0 && this.cachedStatus === 0) {
          return "Forfeit this map";
        }
        return this.buttonText;
      },
      totalTime() {
        if (this.details.countdown <= -1) {
          return -1;
        } else {
          return this.details.timelimit / 1000;
        }
      },
      forfeitTime() {
        if (this.details?.timelimit <= 0) {
          return "0 minutes"
        }
        const time = Duration.fromMillis(this.details.timelimit, { locale: 'en-US' }).rescale();
        return time.toHuman();
      }
    },
    watch: {
      details(newDetails: { doneStatus: number; map: { mission: { slug: string; }} }) {
        if (this.cachedStatus !== 0 && newDetails.doneStatus === 0 && this.map !== newDetails.map.mission.slug) {
          this.rejectedFor = 10;
        }

        this.cachedStatus = newDetails.doneStatus;
        this.map = newDetails.map.mission.slug;
      }
    }
  })
  </script>