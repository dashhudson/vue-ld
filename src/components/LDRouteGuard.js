import { h, isVue3 } from 'vue-demi';
import ldRedirectMixin from '../mixins/ldRedirect';

const LDRouteGuard = {
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
  render(createElement) {
    if (this.show) {
      if (isVue3) {
        return h(this.importedComponent, { props: this.componentProps });
      }
      return createElement(this.importedComponent, { props: this.componentProps });
    }
    return null;
  },
};

if (isVue3) {
  LDRouteGuard.inject = ['$ld'];
}

export default LDRouteGuard;
