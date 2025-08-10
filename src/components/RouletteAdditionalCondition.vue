<template>
  <div class="viewer-spin">
      <div class="condition">
          <div class="image" :style="'background: url(' + objective.objective.tileUrl + ') center center / cover no-repeat;'"></div>
          <div class="icon" v-if="!noIcons">
              <HitmanIcon icon="objective" />
          </div>
          <dl class="text">
              <dt>Objective</dt>
              <dd>{{ objective.objective.name }}</dd>
          </dl>
      </div>
      <div class="condition">
          <div class="image" :style="'background: url(' + objective.completionMethod.tileUrl + ') center center / cover no-repeat;'"></div>
          <div class="icon" v-if="!noIcons">
              <HitmanIcon icon="objective" />
          </div>
          <dl class="text">
              <dt>Complete using</dt>
              <dd>{{ objective.completionMethod.name }}</dd>
          </dl>
          <div class="icon clickable" v-if="editable" @click="$emit('editMethod', objective.objective.name)">
            <HitmanIcon icon="edit" />
          </div>
      </div>
      <div class="condition">
          <div class="image" :style="'background: url(' + objective.disguise.tileUrl + ') center center / cover no-repeat;'"></div>
          <div class="icon" v-if="!noIcons">
              <HitmanIcon icon="disguise" />
          </div>
          <dl class="text">
              <dt>Wear disguise</dt>
              <dd>{{ objective.disguise.name }}</dd>
          </dl>
          <div class="icon clickable" v-if="editable" @click="$emit('editDisguise', objective.objective.name)">
            <HitmanIcon icon="edit" />
          </div>
      </div>
      <template v-if="objective.complications.length > 0">
          <div v-for="complication in objective.complications" class="condition complication" :key="complication.name">
              <div class="image" :style="'background: url(' + complication.tileUrl + ') center center / cover no-repeat;'"></div>
              <div class="icon" v-if="!noIcons">
                  <HitmanIcon icon="complication" />
              </div>
              <dl class="text">
                  <dt>Complication</dt>
                  <dd>{{ complication.name }}</dd>
              </dl>
          </div>
      </template>
  </div>
</template>

<style lang="scss" scoped>
.clickable {
    cursor: pointer;
    font-size: 1rem !important;
}
.viewer-spin {
  .condition {
      display: flex;
      gap: 1rem;

      &.complication {
          color: white;
          background: rgba(red, 0.75);
      }
      .icon {
          flex: 0 0 3rem;
          width: 3rem;
          height: 5rem;
          padding: 1rem 1rem 0 0;
          font-size: 2rem;
      }
      .image {
          flex: 0 0 5rem;
          width: 5rem;
          height: 5rem;
          font-size: 2rem;
      }
      .text {
          padding: 1rem 1rem 0 0;
          dt {
              font-size: 0.75rem;
          }
          dd {
              font-size: 1.25rem;
              line-height: 1;
          }
      }
  }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import HitmanIcon from '@/components/HitmanIcon.vue'

export default defineComponent({
  name: 'RouletteAdditionalCondition',
  props: ['objective', 'noIcons', 'editable'],
  components: {
    HitmanIcon
  },
  data() {
      return {};
  }
});
</script>
