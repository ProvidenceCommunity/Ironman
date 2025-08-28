<template>
  <v-container fluid>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="10">
        <v-alert type="error" v-model="errorShown" border="start" closable>{{error}}</v-alert>
        <v-alert type="error" v-if="connectionIssues" border="start">
          No connection to the server. Make sure you have a stable network connection and refresh the page / contact your match admin if the issue persists.
        </v-alert>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row v-for="i in Math.ceil(matchInfo.players.length/2)" :key="i">
      <v-spacer></v-spacer>
      <v-col cols="3"><b style="font-size: 20pt;">{{ matchInfo.scores[2*(i-1)] }} - {{ matchInfo.players[2*(i-1)] }}</b></v-col>
      <v-spacer></v-spacer>
      <v-col cols="3"><b style="font-size: 20pt;" v-if="matchInfo.players.length > (2*[i-1]+1)" class="float-right">{{ matchInfo.players[2*(i-1)+1] }} - {{ matchInfo.scores[2*(i-1)+1] }}</b></v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="10">
        <div v-if="matchInfo.roundLive">
          <CountdownBar :total-time="matchInfo.totalMatchTime!" :time-remaining="matchInfo.countdown!"></CountdownBar>
          <DoneButtonPlayer v-if="matchInfo.currentGameMode === 'simpleDoneButton'" :matchId="matchId" :player="player" :details="matchInfo.round" @error="onError"></DoneButtonPlayer>
          <RouletteSpinPlayer v-else-if="matchInfo.currentGameMode === 'rouletteSpin' || matchInfo.currentGameMode === 'wackyExtensions'" :matchId="matchId" :player="player" :details="this.matchInfo.round" @error="onError"></RouletteSpinPlayer>
          <BingoPlayer v-else-if="matchInfo.currentGameMode === 'bingo'" :matchId="matchId" :player="player" :details="matchInfo.round" :players="matchInfo.players" @error="onError"></BingoPlayer>
          <TimerPlayer v-else-if="matchInfo.currentGameMode === 'timer'" :details="matchInfo.round"></TimerPlayer>
          <TwoSpinsPlayer v-else-if="matchInfo.currentGameMode === 'twoSpins'" :matchId="matchId" :player="player" :details="matchInfo.round" @error="onError"></TwoSpinsPlayer>
          <RelayPlayer v-else-if="matchInfo.currentGameMode === 'relay'" :matchId="matchId" :player="player" :details="matchInfo.round" @error="onError"></RelayPlayer>
        </div>
        <div v-else>
          <h1>Waiting for match info...</h1>
          <h3 v-if="matchInfo.countdown">Next mode: {{ matchInfo.roundTitle }}</h3>
          <h3 v-if="matchInfo.countdown">Arriving in: {{ countdown }}</h3>
        </div>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer />
      <v-col cols="2">
          <div class="audio-button" @click="initAudio" v-if="!audioEnabled">
            <HitmanIcon icon="audio" />
            Enable audio
          </div>
          <template v-else>
            <div class="audio-button-enabled">
              <HitmanIcon icon="audio" />
              Audio enabled
            </div>
            <div class="audio-disable-hint">
              To disable audio again, refresh the page.
            </div>
          </template>
      </v-col>
      <v-spacer />
    </v-row>
  </v-container>
</template>

<style scoped>
.audio-button {
  border: 1 solid white;
  background-color: darkslategray;
  cursor: pointer;
  padding: 7px;
  border-radius: 10px;
  margin: auto;
  width: fit-content;
}
.audio-button:hover {
  background-color: gray;
}

.audio-button-enabled {
  border: 1 solid white;
  background-color: darkgreen;
  padding: 7px;
  border-radius: 10px;
  margin: auto;
  width: fit-content;
}
.audio-disable-hint {
  font-style: italic;
  font-size: 8pt;
  margin: auto;
  width: fit-content;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import DoneButtonPlayer from '@/components/GameModesPlayer/DoneButton.vue';
import RouletteSpinPlayer from '@/components/GameModesPlayer/RouletteSpin.vue';
import { get } from '@/http';
import BingoPlayer from "@/components/GameModesPlayer/Bingo.vue";
import CountdownBar from "@/components/CountdownBar.vue";
import TimerPlayer from "@/components/GameModesPlayer/Timer.vue";
import TwoSpinsPlayer from "@/components/GameModesPlayer/TwoSpins.vue";
import RelayPlayer from "@/components/GameModesPlayer/Relay.vue";
import { Howl, Howler } from 'howler';
import HitmanIcon from "@/components/HitmanIcon.vue";
import { MatchInfo } from "@shared-types/MatchInfo";

export default defineComponent({
  name: "PlayerClient",
  components: {
    TimerPlayer,
    CountdownBar,
    BingoPlayer,
    DoneButtonPlayer,
    RouletteSpinPlayer,
    TwoSpinsPlayer,
    RelayPlayer,
    HitmanIcon
  },
  data() {
    return {
      matchId: "",
      player: "",
      updateInterval: -1,
      matchInfo: {
        players: [],
        scores: [],
        countdown: 0,
        index: -1,
        roundLive: false,
      } as MatchInfo,
      error: "",
      errorShown: false,
      connectionIssues: false,
      sounds: {} as Record<string, { name: string, file: Howl, ready: boolean }>,
      audioEnabled: false,
    }
  },
  async created() {
    const pathname = window.location.pathname.split("/");
    this.player = pathname.pop() as string;
    this.matchId = pathname.pop() as string;
    this.updateInterval = window.setInterval(this.update, 1000);
  },
  beforeUnmount() {
    clearInterval(this.updateInterval)
  },
  methods: {
    async update() {
      try {
        const resp = await get("/api/match/player/" + this.matchId + "/" + this.player);
        if (resp.status !== 200) {
          this.connectionIssues = true;
        } else {
          this.connectionIssues = false;
          this.checkSound(this.matchInfo, resp.data);
          this.matchInfo = resp.data;
        }
      } catch(e) {
        console.log(e);
        this.connectionIssues = true;
      }
    },
    onError(error: string) {
      this.error = error;
      this.errorShown = true;
    },
    checkSound(oldMatch: MatchInfo, newMatch: MatchInfo) {
      switch (newMatch.countdown) {
        case 18:
          if (!newMatch.roundLive) break;
          this.playSound('17_Announcer_TargetDespawn15Sec_ANNOUNCER_VERSUS_001');
          break;
        case 14: {
          if (newMatch.roundLive) break;
          const options = ['01_Announcer_MatchInitializedGetReady_ANNOUNCER_VERSUS_001', '02_Announcer_MatchInitializedPrepare_ANNOUNCER_VERSUS_001'];
          const chosenOption = options[Math.floor(Math.random() * Math.floor(options.length))];
          this.playSound(chosenOption);
          break;
        }
        case 13:
          if (!newMatch.roundLive) break;
          this.playSound('18_Announcer_TargetDespawn10Sec_ANNOUNCER_VERSUS_001');
          break;
        case 12:
        if (newMatch.roundLive) break;
          this.playSound('04_Announcer_MatchIntroDuel10Sec_ANNOUNCER_VERSUS_001');
          break;
        case 9:
          this.playSound('09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_001');
          break;
        case 8:
          this.playSound('09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_002');
          break;
        case 7:
          this.playSound('09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_003');
          break;
        case 6:
          this.playSound('09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_004');
          break;
        case 5:
          this.playSound('09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_005');
          break;
        case 4:
          this.playSound('09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_006');
          break;
        case 3:
          this.playSound('09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_007');
          break;
        case 2:
          this.playSound('09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_008');
          break;
        case 1:
          this.playSound('09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_009');
          break;
        default:
          break;
      }

      if (!oldMatch.roundLive && newMatch.roundLive) {
        this.playSound('10_Announcer_MatchStartEliminateTarget_ANNOUNCER_VERSUS_001');
      }

      if (oldMatch.roundLive && !newMatch.roundLive) {
        const selfScoreGain = newMatch.scores[newMatch.index] - oldMatch.scores[newMatch.index];
        if (selfScoreGain >= 2) {
          this.playSound('33_Announcer_MatchWon_ANNOUNCER_VERSUS_001');
        } else {
          this.playSound('19_Announcer_TargetLost_ANNOUNCER_VERSUS_001');
        }
      }
    },
    playSound(sound: string) {
      if (this.sounds[sound]?.file.playing() || !this.sounds[sound]?.ready) return;
      if (!this.audioEnabled) return;

      Howler.stop();
      this.sounds[sound].file.play();
    },
    initAudio() {
      this.audioEnabled = true;
      const soundNames = [
        '01_Announcer_MatchInitializedGetReady_ANNOUNCER_VERSUS_001',
        '02_Announcer_MatchInitializedPrepare_ANNOUNCER_VERSUS_001',
        '04_Announcer_MatchIntroDuel10Sec_ANNOUNCER_VERSUS_001',
        '09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_001',
        '09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_002',
        '09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_003',
        '09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_004',
        '09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_005',
        '09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_006',
        '09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_007',
        '09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_008',
        '09_Announcer_Countdown10Sec_ANNOUNCER_VERSUS_009',
        '10_Announcer_MatchStartEliminateTarget_ANNOUNCER_VERSUS_001',
        '19_Announcer_TargetLost_ANNOUNCER_VERSUS_001',
        '33_Announcer_MatchWon_ANNOUNCER_VERSUS_001',
        '17_Announcer_TargetDespawn15Sec_ANNOUNCER_VERSUS_001',
        '18_Announcer_TargetDespawn10Sec_ANNOUNCER_VERSUS_001'
      ];

      Howler.autoSuspend = false;

      for (const soundName of soundNames) {
        this.sounds[soundName] = {
          name: soundName,
          file: new Howl({
            src: [
              `https://media.hitmaps.com/img/hitmaps-roulette/fake-diana/webm/${soundName}.webm`,
              `https://media.hitmaps.com/img/hitmaps-roulette/fake-diana/mp3/${soundName}.mp3`,
            ],
          }),
          ready: false,
        };

        const that = this;
        this.sounds[soundName].file.once('load', () => {
          that.sounds[soundName].ready = true;
        });
      }
    },
  },
  computed: {
    countdown() {
      if (this.matchInfo.countdown == null) {
        return "";
      }
      let h = Math.floor(this.matchInfo.countdown / 3600);
      let m = Math.floor((this.matchInfo.countdown - h * 3600) / 60);
      let s = this.matchInfo.countdown - h * 3600 - m * 60;
      let result = "";
      if (h < 10) {
        result += "0" + h.toString() + ":";
      } else {
        result += h.toString() + ":";
      }
      if (m < 10) {
        result += "0" + m.toString() + ":";
      } else {
        result += m.toString() + ":";
      }
      if (s < 10) {
        result += "0" + s.toString();
      } else {
        result += s.toString();
      }
      return result;
    }
  }
})
</script>
