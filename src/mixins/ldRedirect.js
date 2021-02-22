export default (requiredFeatureFlag, to, invertFlag) => {
  return {
    data() {
      return {
        ldRedirectReadyWatcher: null,
        ldRedirectFlagWatcher: null,
        hasBeenDeactivated: false,
      };
    },
    computed: {
      ldRedirectFlagValue() {
        return this.invertFlag || invertFlag
          ? !this.$ld.flags[requiredFeatureFlag || this.requiredFeatureFlag]
          : this.$ld.flags[requiredFeatureFlag || this.requiredFeatureFlag];
      },
      ldRedirectShouldRedirect() {
        return this.$ld.ready && !this.ldRedirectFlagValue;
      },
      ldRedirectShouldDestroy() {
        return this.$ld.ready && this.ldRedirectFlagValue;
      },
      resolveRedirect() {
        // handles 'to' redirect values passed as functions
        const redirectVal = to == null ? this.ldRedirectTo : to;
        if (typeof redirectVal === 'function') {
          const boundRedirectTo = redirectVal.bind(this);
          return boundRedirectTo();
        }
        return redirectVal;
      },
    },
    methods: {
      setLdRedirectReadyWatcher() {
        this.ldRedirectReadyWatcher = this.$watch(
          () => {
            return this.$ld.ready;
          },
          () => {
            if (this.ldRedirectShouldRedirect) {
              this.$router.push(this.resolveRedirect);
            } else if (this.ldRedirectShouldDestroy) {
              this.ldRedirectDestroyWatchers();
            }
          }
        );
      },
      setLdRedirectFlagWatcher() {
        this.ldRedirectFlagWatcher = this.$watch(
          () => {
            return this.ldRedirectFlagValue;
          },
          () => {
            if (this.ldRedirectShouldRedirect) {
              this.$router.push(this.resolveRedirect);
            } else if (this.ldRedirectShouldDestroy) {
              this.ldRedirectDestroyWatchers();
            }
          }
        );
      },
      ldRedirectDestroyWatchers() {
        if (this.ldRedirectReadyWatcher) {
          this.ldRedirectReadyWatcher();
          this.ldRedirectReadyWatcher = null;
        }
        if (this.ldRedirectFlagWatcher) {
          this.ldRedirectFlagWatcher();
          this.ldRedirectFlagWatcher = null;
        }
      },
      redirectHandler() {
        if (this.$ld.ready && !this.ldRedirectFlagValue) {
          this.$router.push(this.resolveRedirect);
        } else if (!this.ldReady) {
          this.setLdRedirectReadyWatcher();
          this.setLdRedirectFlagWatcher();
        }
      },
    },
    activated() {
      if (this.hasBeenDeactivated) {
        this.redirectHandler();
      }
    },
    mounted() {
      this.redirectHandler();
    },
    deactivated() {
      this.hasBeenDeactivated = true;
    },
  };
};
