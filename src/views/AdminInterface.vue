<template>
  <AddRoundDialog v-if="addingRound" :game_mode="gameModeToAdd" @done="doneAddingRound"/>
  <v-dialog v-model="matchDoneDialog" persistent>
    <v-card>
      <v-card-text>Are you sure you want to mark this match as done and return to the main page?</v-card-text>
      <v-card-actions>
        <v-btn @click="matchDoneDialog = false">Cancel</v-btn>
        <v-btn @click="confirmDone">Confirm & return</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-container fluid>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="10">
        <h1>Match {{ matchId }}</h1>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="5">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>Player links</v-expansion-panel-title>
            <v-expansion-panel-text>
              <ul>
                <li v-for="player of matchInfo.players" :key="player">
                  <b>{{player}}:</b> <a :href="getPlayerLink(player)">{{ getPlayerLink(player) }}</a>
                </li>
                <li>
                  <b>Shoutcast-Overlay:</b> <a :href="getOverlayLink()">{{ getOverlayLink() }}</a>
                </li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col cols="5">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>Player scores</v-expansion-panel-title>
            <v-expansion-panel-text>
              <ul>
                <li v-for="(player, index) of players" :key="index">
                  <v-text-field v-model="playerScores[index]" hide-details="true" density="compact" :label="player" @change="updateScores" type="number"></v-text-field>
                </li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="5">
        <b>Add new round:</b><br>
        <v-select :items="gameModes" v-model="gameModeToAdd" ></v-select>

        <v-container>
          <v-row>
            <v-col>
              <v-text-field label="Round starts" v-model="arrivingTimestamp" dense @change="updateTimestamps" type="datetime-local"></v-text-field>
            </v-col>
            <v-col>
              <v-text-field label="Round ends" v-model="leavingTimestamp" dense @change="updateTimestamps" type="datetime-local"></v-text-field>
            </v-col>
          </v-row>
        </v-container>

        <v-btn @click="markMatchDone">Mark match as done</v-btn>
      </v-col>
      <v-col cols="5">
        <b>Rounds of this match:</b><br>
        <ol>
          <li v-for="(round, index) of matchInfo.rounds" :key="index">{{ round.mode }} - <v-chip>{{ roundTimers[index] }}</v-chip></li>
        </ol><br>

        <v-select label="End round immediately and award points" :items="endRoundItems" v-model="endRound"></v-select>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="10">

        <DoneButtonAdmin v-if="currentRound.mode === 'simpleDoneButton'" :players="matchInfo.players" :details="currentRound.additionalDetails" :matchId="this.matchId"></DoneButtonAdmin>
        <RouletteSpinAdmin v-if="currentRound.mode === 'rouletteSpin'" :players="matchInfo.players" :details="currentRound.additionalDetails" :matchId="this.matchId"></RouletteSpinAdmin>
        <BingoAdmin v-if="currentRound.mode === 'bingo'" :players="matchInfo.players" :details="currentRound.additionalDetails" :matchId="this.matchId"></BingoAdmin>

      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { get, post } from '@/http';
import AddRoundDialog from '@/components/AddRoundDialog.vue';
import DoneButtonAdmin from "@/components/GameModesAdmin/DoneButton.vue";
import RouletteSpinAdmin from "@/components/GameModesAdmin/RouletteSpin.vue";
import BingoAdmin from "@/components/GameModesAdmin/Bingo.vue";
import { DateTime } from "luxon";

export default defineComponent({
  name: 'AdminInterface',
  components: {
    RouletteSpinAdmin,
    DoneButtonAdmin,
    BingoAdmin,
    AddRoundDialog
  },
  data() {
    return {
      matchId: "",
      gameModes: [],
      matchInfo: {
        scores: [] as number[]
      },
      gameModeToAdd: "",
      addingRound: false,
      refreshTask: -1,
      arrivingTimestamp: "",
      leavingTimestamp: "",
      matchDoneDialog: false,
      playerScores: [] as number[],
      players: [],
      roundTimers: [] as string[],
      endRound: undefined,
    }
  },
  async created() {
    this.matchId = window.location.pathname.split("/").pop() as string;
    const gameModes = await get("/data/game_modes");
    this.gameModes = gameModes.data.game_modes;
    this.refreshTask = setInterval(this.updateData, 1000);
    await this.updateData();
  },
  beforeUnmount() {
    clearInterval(this.refreshTask);
  },
  methods: {
    getPlayerLink(playerName: string): string {
      return `${window.location.origin}/client/${this.matchId}/${playerName}`
    },
    getOverlayLink(): string {
      return `${window.location.origin}/overlay/${this.matchId}`
    },
    async doneAddingRound(values: any) {
      if (values) {
        await post('/api/match/admin/' + this.matchId + '/addRound', {
          game_mode: this.gameModeToAdd,
          generatorOptions: values
        });
        this.arrivingTimestamp = "";
        this.leavingTimestamp = "";
        await this.updateData();
      }
      this.addingRound = false;
      this.gameModeToAdd = "";
    },
    async updateData() {
      const matchInfo = await get("/api/match/admin/" + this.matchId);
      if (JSON.stringify(this.matchInfo) !== JSON.stringify(matchInfo.data)) {
        this.playerScores = [...matchInfo.data.scores];
        this.players = matchInfo.data.players;
        this.matchInfo = matchInfo.data;
      }

      this.updateRoundTimers();
    },
    async sendData() {
      await post('/api/match/update/' + this.matchId, this.matchInfo);
    },
    async updateScores() {
      this.matchInfo['scores'] = [...this.playerScores];
      await this.sendData();
    },
    async updateTimestamps() {
      const roundIndex = this.getCurrentRoundIndex();
      if (roundIndex >= 0) {
        const arrivingTS = DateTime.fromISO(this.arrivingTimestamp).toMillis();
        if (!isNaN(arrivingTS)) {
          (this.matchInfo as any).rounds[roundIndex].arrivingTimestamp = arrivingTS;
        }
        const leavingTS = DateTime.fromISO(this.leavingTimestamp).toMillis();
        if (!isNaN(leavingTS)) {
          (this.matchInfo as any).rounds[roundIndex].leavingTimestamp = leavingTS;
        }
        await this.sendData();
      }
    },
    markMatchDone() {
      this.matchDoneDialog = true;
    },
    async confirmDone() {
      (this.matchInfo as any).finished = true;
      await this.sendData();
      this.matchDoneDialog = false;
      await this.$router.push("/admin");
    },
    getCurrentRoundIndex() {
      if ((this.matchInfo as any).rounds !== undefined) {
        let roundIndex = (this.matchInfo as any).rounds.length - 1;
        if (roundIndex >= 0) {
          return roundIndex;
        }
      }
      return -1;
    },
    updateRoundTimers() {
      (this.matchInfo as any).rounds.forEach((round: any, index: number) => {
        this.roundTimers[index] = this.getRoundStatus(round, index)
      });
    },
    getRoundStatus(round: any, index: number)  {
      if (index !== this.getCurrentRoundIndex()) {
        return "Finished";
      } else if (round.arrivingTimestamp < 0) {
        return "Not scheduled";
      } else if (DateTime.local().toMillis() < round.arrivingTimestamp) {
        const arrivingTime = DateTime.fromMillis(round.arrivingTimestamp);
        const nowTime = DateTime.local();
        const diff = arrivingTime.diff(nowTime, ['hours', 'minutes', 'seconds']);
        return `Arriving in ${diff.toFormat("hh:mm:ss")}`;
      } else if (round.leavingTimestamp < 0) {
        return "Running indefinitely";
      } else if (DateTime.local().toMillis() < round.leavingTimestamp) {
        const arrivingTime = DateTime.fromMillis(round.leavingTimestamp);
        const nowTime = DateTime.local();
        const diff = arrivingTime.diff(nowTime, ['hours', 'minutes', 'seconds']);
        return `Leaving in ${diff.toFormat("hh:mm:ss")}`;
      } else if (DateTime.local().toMillis() > round.leavingTimestamp) {
        return "Finished";
      } else {
        return "Literally unknown. What did you to? Talk to Curry please."
      }
    }
  },
  watch: {
    gameModeToAdd(newGM) {
      if (newGM !== "") {
        this.addingRound = true;
      }
    },
    async endRound(newER) {
      if (newER !== undefined) {
        const roundIndex = this.getCurrentRoundIndex();
        if (roundIndex >= 0) {
          (this.matchInfo as any).rounds[roundIndex].leavingTimestamp = Date.now();
          if (newER >= 0) {
            (this.matchInfo as any)['scores'][newER] += 1;
          }
          await this.sendData();
        }
        this.endRound = undefined;
      }
    }
  },
  computed: {
    currentRound(): unknown {
      let mInfo = this.matchInfo as any;
      if (mInfo.rounds !== undefined) {
        let roundIndex = mInfo.rounds.length - 1;
        if (roundIndex >= 0) {
          return mInfo.rounds[roundIndex];
        }
      }
      return { mode: "" };
    },
    endRoundItems(): unknown[] {
      let arr = this.players.map((p, idx) => { return {title: `End round and increase score of ${p} by 1`, value: idx} });
      arr.push({title: "End round and don't increase scores", value: -1});
      return arr;
    }
  }
})
</script>
