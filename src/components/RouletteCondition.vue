<template>
  <div class="viewer-spin">
      <div class="condition">
          <div class="image" :style="'background: url(' + target.target.tileUrl + ') center center / cover no-repeat;'"></div>
          <div class="icon" v-if="!noIcons">
              <HitmanIcon icon="challenge-category-assassination" />
          </div>
          <dl class="text">
              <dt>Target</dt>
              <dd>{{ target.target.name }}</dd>
          </dl>
          <div class="icon clickable" v-if="editable" @click="$emit('toggleNtko', target.target.name)">
            <HitmanIcon icon="complication" />
          </div>
      </div>
      <div class="condition">
          <div class="image" :style="'background: url(' + target.killMethod.tileUrl + ') center center / cover no-repeat;'"></div>
          <div class="icon" v-if="!noIcons">
              <HitmanIcon icon="difficulty-casual" />
          </div>
          <dl class="text">
              <dt>Eliminate using</dt>
              <dd>{{ buildKillMethod() }}</dd>
          </dl>
          <div class="icon clickable" v-if="editable" @click="$emit('editCondition', target.target.name)">
            <HitmanIcon icon="edit" />
          </div>
      </div>
      <div class="condition">
          <div class="image" :style="'background: url(' + target.disguise.tileUrl + ') center center / cover no-repeat;'"></div>
          <div class="icon" v-if="!noIcons">
              <HitmanIcon icon="disguise" />
          </div>
          <dl class="text">
              <dt>Wear disguise</dt>
              <dd>{{ target.disguise.name }}</dd>
          </dl>
          <div class="icon clickable" v-if="editable" @click="$emit('editDisguise', target.target.name)">
            <HitmanIcon icon="edit" />
          </div>
      </div>
      <template v-if="target.complications.length > 0">
          <div v-for="complication in target.complications" class="condition complication" :key="complication.name">
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
  name: 'ViewerTarget',
  props: ['target', 'noIcons', 'editable'],
  components: {
    HitmanIcon
  },
  data() {
      return {};
  },
  methods: {
      buildKillMethod() {
          if (this.target.killMethod.selectedVariant) {
              return this.target.killMethod.selectedVariant + ' ' + this.target.killMethod.name;
          } else {
              return this.target.killMethod.name;
          }
      },
  },
});
</script>
