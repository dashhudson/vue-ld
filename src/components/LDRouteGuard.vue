<template>
  <component :is="importedComponent" v-if="show" v-bind="$props"></component>
</template>

<script>
import ldRedirectMixin from '../mixins/ldRedirect';

export default {
  mixins: [ldRedirectMixin()],
  props: {
    component: { type: [Object, Promise], required: true },
    requiredFeatureFlag: { type: String, required: true },
    to: { type: [String, Object], required: true },
  },
  computed: {
    show() {
      return this.$ld.ready && this.$ld.flags[this.requiredFeatureFlag];
    },
    isPromise() {
      return !!this.component && typeof this.component.then === 'function';
    },
    importedComponent() {
      return this.isPromise ? () => this.component : this.component;
    },
  },
  created() {
    this.ldRedirectTo = this.to;
  },
};
</script>
