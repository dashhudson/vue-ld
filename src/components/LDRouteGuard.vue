<template>
  <component :is="component" v-if="show" v-bind="$props"></component>
</template>

<script>
import ldRedirectMixin from '../mixins/ldRedirect';

export default {
  mixins: [ldRedirectMixin()],
  props: {
    component: { type: Object, required: true },
    requiredFeatureFlag: { type: String, required: true },
    to: { type: [String, Object], required: true },
  },
  computed: {
    show() {
      return this.$ld.ready && this.$ld.flags[this.requiredFeatureFlag];
    },
  },
  created() {
    this.ldRedirectTo = this.to;
  },
};
</script>
