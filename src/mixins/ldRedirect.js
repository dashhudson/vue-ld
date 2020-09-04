export default (requiredFeatureFlag, to) => {
  return {
    data() {
      return {
        ldRedirectReadyWatcher: null,
        ldRedirectFlagWatcher: null,
      };
    },
    computed: {
      ldRedirectShouldRedirect() {
        return this.$ld.ready && !this.$ld.flags[requiredFeatureFlag];
      },
      ldRedirectShouldDestroy() {
        return this.$ld.ready && this.$ld.flags[requiredFeatureFlag];
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
              this.$router.push(to);
            } else if (this.ldRedirectShouldDestroy) {
              this.ldRedirectDestroyWatchers();
            }
          }
        );
      },
      setLdRedirectFlagWatcher() {
        this.ldRedirectFlagWatcher = this.$watch(
          () => {
            return this.$ld.flags[requiredFeatureFlag];
          },
          () => {
            if (this.ldRedirectShouldRedirect) {
              this.$router.push(to);
            } else if (this.ldRedirectShouldDestroy) {
              this.ldRedirectDestroyWatchers();
            }
          }
        );
      },
      ldRedirectDestroyWatchers() {
        this.ldRedirectReadyWatcher();
        this.ldRedirectReadyWatcher = null;
        this.ldRedirectFlagWatcher();
        this.ldRedirectFlagWatcher = null;
      },
    },
    created() {
      if (this.$ld.ready && !this.$ld.flags[to]) {
        this.$router.push(to);
      } else if (!this.ldReady) {
        this.setLdRedirectReadyWatcher();
        this.setLdRedirectFlagWatcher();
      }
    },
  };
};
