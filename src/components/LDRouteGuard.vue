<template>
  <component :is="importedComponent" v-if="show" v-bind="componentProps"></component>
</template>

<script>
import ldRedirectMixin from '../mixins/ldRedirect';

export default {
  mixins: [ldRedirectMixin()],
  props: {
    component: { type: [Function, Object, Promise], required: true },
    componentProps: { type: Object, required: false, default: () => {} },
    requiredFeatureFlag: { type: String, required: true },
    to: { type: [String, Object, Function], required: true },
    invertFlag: { type: Boolean, required: false, default: false },
  },
  computed: {
    show() {
      return this.$ld.ready && this.ldRedirectFlagValue;
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
