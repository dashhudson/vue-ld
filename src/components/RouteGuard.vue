<template>
  <component :is="component" v-if="$ld.ready"></component>
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
  created() {
    this.ldRedirectTo = this.to;
  },
};
</script>
