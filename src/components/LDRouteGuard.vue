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
    to: { type: [String, Object, Function], required: true },
    invertFlag: { type: Boolean, required: false, default: false },
  },
  computed: {
    // flagValue() {
    //   console.log("flag value. invertFlag: " + this.invertFlag);
    //   let res = (
    //     this.invertFlag
    //     ? !this.$ld.flags[this.requiredFeatureFlag] 
    //     : this.$ld.flags[this.requiredFeatureFlag] 
    //   )
    //   console.log(res);
    //   return res
    // },
    show() {
      return this.$ld.ready && this.flagValue;
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
