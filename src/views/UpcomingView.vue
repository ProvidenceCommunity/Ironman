<template>
    <div class="list">
        <div class="match">
            <div class="column header">
                <HitmanIcon icon="target" />
                Players
            </div>
            <div class="column header">
                <HitmanIcon icon="location" />
                Maps
            </div>
            <div class="column header">
                <HitmanIcon icon="timed" />
                Date & Time
            </div>
            <div class="column header">
                <HitmanIcon icon="audio" />
                Cast
            </div>
        </div>
        <div v-for="(match, idx) of filteredSortedMatches" :key="idx" class="match">
            <div class="column">
                {{ transformPlayers(match.players).join(" / ") }}
            </div>
            <div class="column">
                {{ match.schedulingData.picks?.join(", ") }}
            </div>
            <div class="column">
                {{ transformScheduleTime(match.timestamp) }}
            </div>
            <div class="column">
                {{ match.schedulingData.cast }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.list {
    display: flex;
    flex-direction: column;
    margin-left: 10%;
    margin-right: 10%;
    margin-top: 20px;
    width: 80%;
    gap: 20px;
}

.match {
    display: flex;
    flex-direction: row;
    padding: 20px;
    border: 1px solid black;
    background-color: rgba(0, 0, 0, 0.7);
}

.column {
    width: 25%;
}

.header {
    font-size: 25px;
    font-weight: bold;
}
</style>

<script lang="ts">
import HitmanIcon from '@/components/HitmanIcon.vue';
import { get } from '@/http';
import { DateTime } from 'luxon';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'UpcomingView',
    components: { HitmanIcon },
    data() {
        return {
            matches: {},
            users: {},
        }
    },
    async created() {
        const matchesQuery = await get("/data/matches");
        const usersQuery = await get("/data/users");
        this.matches = matchesQuery.data;
        this.users = usersQuery.data;
    },
    computed: {
        filteredSortedMatches() {
            if (this.matches.matches == null) {
                return [];
            }
            return this.matches.matches.filter((match) => {
                return match.finished !== true
            }).sort((a, b) => {
                if (a.timestamp === -1) {
                    return 1;
                }
                if (b.timestamp === -1) {
                    return -1;
                }

                return a.timestamp - b.timestamp;
            });
        }
    },
    methods: {
        transformScheduleTime(time: number) {
            if (time <= 0) {
                return "Not scheduled";
            }
            return DateTime.fromMillis(time).toLocaleString(DateTime.DATETIME_MED);
        },
        transformPlayers(players: string[]) {
            return players.map((player) => this.users[player]?.replace(/#\d+/g, "") ?? player);
        }
    }
})
</script>