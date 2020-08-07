export default (requiredFeatureFlag, to) => {
  return {
    data() {
      return {
        ldRedirectWatcher: null,
      };
    },
    methods: {
      setLdRedirectWatcher() {
        this.ldRedirectWatcher = this.$watch(
          () => {
            return this.$ld.ready && !this.$ld[requiredFeatureFlag];
          },
          (shouldRedirect) => {
            if (shouldRedirect) {
              this.$router.push(to);
            } else if (this.$ld.ready && this.$ld[requiredFeatureFlag]) {
              this.ldRedirectWatcher(); // unwatch
            }
          }
        );
      },
    },
    created() {
      this.setLdRedirectWatcher();
    },
  };
};
