<template>
    <v-dialog v-model="show" persistent>
        <v-card style="align-self: center">
            <v-card-title>Select Condition</v-card-title>
            <v-card-text>
                <div class="condition-grid">
                    <div v-for="(condition, idx) of conditions" :key="idx" class="condition-container">
                        <img :src="condition.tileUrl" />
                        <div class="button-container">
                            <div class="button" @click="selectMethod(condition)">
                                {{ condition.name }}
                            </div>
                            <div v-if="condition.variants.length > 0" class="variant-container">
                                <div v-for="(variant, vidx) of condition.variants" :idx="vidx" class="button" @click="selectVariant(condition, variant)">
                                    {{ variant.name }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="$emit('cancel')">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.condition-grid {
    display: grid;
    grid-template-columns: auto auto auto auto;
}
.condition-container {
    display: flex;
    flex-direction: row;
    height: 70px;
}
.button-container {
    display: flex;
    flex-direction: column;
    width: 200px;
    justify-items: center;
}
.variant-container {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}
.button {
    text-align: center;
    padding-top: 4px;
    padding-bottom: 4px;
}
.button:hover {
    background-color: gray;
}
.variant-container .button {
    flex-grow: 1;
}
</style>

<script lang="ts">
import axios from 'axios';
import { defineComponent } from 'vue';

const slugToDefaultTarget = {
    "hitman|ica-facility|freeform-training": ["Kalvin Ritter"],
    "hitman|ica-facility|the-final-test": ["Jasper Knight"],
    "hitman|paris|the-showstopper": ["Viktor Novikov", "Dalia Margolis"],
    "hitman|paris|holiday-hoarders": ["Harry \"Smokey\" Bagnato", "Marv \"Slick\" Gonif"],
    "hitman|sapienza|world-of-tomorrow": ["Silvio Caruso", "Francesca De Santis"],
    "hitman|sapienza|the-icon": ["Dino Bosco"],
    "hitman|sapienza|landslide": ["Marco Abiatti"],
    "hitman|sapienza|the-author": ["Craig Black", "Brother Akram"],
    "hitman|marrakesh|a-gilded-cage": ["Reza Zaydan", "Claus Hugo Strandberg"],
    "hitman|marrakesh|a-house-built-on-sand": ["Kong Tuo-Kwang", "Matthieu Mendola"],
    "hitman|bangkok|club-27": ["Jordan Cross", "Ken Morgan"],
    "hitman|bangkok|the-source": ["Oybek Nabazov", "Sister Yulduz"],
    "hitman|colorado|freedom-fighters": ["Sean Rose", "Penelope Graves", "Ezra Berg", "Maya Parvati"],
    "hitman|hokkaido|situs-inversus": ["Erich Soders", "Yuki Yamazaki"],
    "hitman|hokkaido|hokkaido-snow-festival": ["Dmitri Fedorov"],
    "hitman|hokkaido|patient-zero": ["Owen Cage", "Klaus Liebleid"],
    "hitman2|hawkes-bay|nightcall": ["Alma Reynard"],
    "hitman2|miami|finish-line": ["Sierra Knox", "Robert Knox"],
    "hitman2|miami|a-silver-tongue": ["Ajit Krish"],
    "hitman2|santa-fortuna|three-headed-serpent": ["Rico Delgado", "Jorge Franco", "Andrea Martinez"],
    "hitman2|santa-fortuna|embrace-of-the-serpent": ["Blair Reddington"],
    "hitman2|mumbai|chasing-a-ghost": ["Wazir Kale", "Vanya Shah", "Dawood Rangan"],
    "hitman2|mumbai|illusions-of-grandeur": ["Basil Carnaby"],
    "hitman2|whittleton-creek|another-life": ["Janus", "Nolan Cassidy"],
    "hitman2|whittleton-creek|a-bitter-pill": ["Galen Vholes"],
    "hitman2|ambrose-island|shadows-in-the-water": ["Noel Crest", "Sinhi \"Akka\" Venthan"],
    "hitman2|isle-of-sgail|ark-society": ["Zoe Washington", "Sophia Washington"],
    "hitman2|new-york|golden-handshake": ["Athena Savalas"],
    "hitman2|haven-island|the-last-resort": ["Tyson Williams", "Steven Bradley", "Ljudmila Vetrova"],
    "hitman3|dubai|on-top-of-the-world": ["Carl Ingram", "Marcus Stuyvesant"],
    "hitman3|dartmoor|death-in-the-family": ["Alexa Carlisle"],
    "hitman3|berlin|apex-predator": ["ICA Agent %231", "ICA Agent %232", "ICA Agent %233", "ICA Agent %234", "ICA Agent %235"],
    "hitman3|chongqing|end-of-an-era": ["Hush", "Imogen Royce"],
    "hitman3|mendoza|the-farewell": ["Don Archibald Yates", "Tamara Vidal"],
    "hitman3|carpathian-mountains|untouchable": ["Arthur Edwards"],
};

const slugsWithDefaultDifficulty = [
    "hitman|paris|holiday-hoarders",
    "hitman|sapienza|landslide",
    "hitman|sapienza|the-author",
    "hitman|sapienza|the-icon",
    "hitman|marrakesh|a-house-built-on-sand",
    "hitman|bangkok|the-source",
    "hitman|hokkaido|patient-zero",
    "hitman|hokkaido|hokkaido-snow-festival"
]

export default defineComponent({
    name: "SpinConditionEditor",
    props: [ 'mission', 'target', 'generatorOptions' ],
    emits: [ 'select', 'cancel' ],
    data() {
        return {
            show: true,
            conditions: []
        }
    },
    async mounted() {
        const splitMission = this.mission.split("|");

        const query = new URLSearchParams();
        query.set("missionGame", splitMission[0]);
        query.set("missionLocation", splitMission[1]);
        query.set("missionSlug", splitMission[2]);
        query.set("missionVariant", "professional");
        query.set("specificDisguises", String(this.generatorOptions.specificDisguises ?? false));
        query.set("specificMelee", String(this.generatorOptions.specificMelee ?? false));
        query.set("specificFirearms", String(this.generatorOptions.specificFirearms ?? false));
        query.set("specificAccidents", String(this.generatorOptions.specificAccidents ?? false));
        query.set("uniqueTargetKills", String(this.generatorOptions.uniqueTargetKills ?? false));
        query.set("genericKills", String(this.generatorOptions.genericKills ?? false));
        query.set("impossibleOrDifficultKills", String(this.generatorOptions.impossibleOrDifficultKills ?? false));
        query.set("targetName", this.target);

        if (this.target.startsWith("Target #")) {
            const targetIdx = parseInt(this.target.substring(8)) - 1;
            query.set("targetName", slugToDefaultTarget[this.mission][targetIdx]);
        }
        if (slugsWithDefaultDifficulty.includes(this.mission)) {
            query.set("missionVariant", "standard");
        }

        this.conditions = (await axios.get(`https://rouletteapi.hitmaps.com/api/spins/kill-conditions?${query.toString()}`)).data;
    },
    methods: {
        selectVariant(method, variant) {
            this.$emit('select', { 
                name: method.name,
                tileUrl: variant.imageOverride ?? method.tileUrl,
                selectedVariant: variant.name
            });
        },
        selectMethod(method) {
            this.$emit('select', { 
                name: method.name,
                tileUrl: method.tileUrl,
                selectedVariant: null
            });
        }
    }
});
</script>