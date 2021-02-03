<template>
  <component :is="importedComponent" v-if="show" v-bind="$props"></component>
</template>

<script>
import ldRedirectMixin from '../mixins/ldRedirect';

export default {
  mixins: [ldRedirectMixin()],
  props: {
    component: { type: [Function, Object, Promise], required: true },
    requiredFeatureFlag: { type: String, required: true },
    to: { type: [String, Object], required: true },
  },
  computed: {
    show() {
      return this.$ld.ready && this.$ld.flags[this.requiredFeatureFlag];
    },
    importedComponent() {
      // Handle dynamically imported components
      if (!!this.component && typeof this.component.then === 'function') {
        return () => this.component;
      }
      return this.component;
    },
  },
  created() {
    this.ldRedirectTo = this.to;
  },
};
</script>
