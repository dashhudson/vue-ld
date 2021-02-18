export default (requiredFeatureFlag, to, invertFlag) => {
  return {
    data() {
      return {
        ldRedirectReadyWatcher: null,
        ldRedirectFlagWatcher: null,
      };
    },
    computed: {
      flagValue() {
        return (
          this.$ld.ready && (
            this.invertFlag || invertFlag
            ? !this.$ld.flags[requiredFeatureFlag || this.requiredFeatureFlag] 
            : this.$ld.flags[requiredFeatureFlag || this.requiredFeatureFlag]
          )
        )
      },
      ldRedirectShouldRedirect() {
        // HERE
        return this.$ld.ready && !this.$ld.flags[requiredFeatureFlag || this.requiredFeatureFlag];
      },
      ldRedirectShouldDestroy() {
        // HERE
        return this.$ld.ready && this.$ld.flags[requiredFeatureFlag || this.requiredFeatureFlag];
      },
      resolveRedirect(){
        const redirectVal = to == null ? this.ldRedirectTo : to;
        if (typeof(redirectVal) === 'function') {
          const boundRedirectTo = redirectVal.bind(this);
          return boundRedirectTo();
        } else {
          return redirectVal;
        }
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
            // HERE
            return this.$ld.flags[requiredFeatureFlag || this.requiredFeatureFlag];
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
    },
    updated(){
      console.log(this.flagValue);
    },
    mounted() {
      // console.log("mounted");
      // console.log(invertFlag)
      // console.log(this.invertFlag);
      // console.log(this.ldRedirectTo);
      
      // HERE
      if (this.$ld.ready && !this.$ld.flags[requiredFeatureFlag || this.requiredFeatureFlag]) {
        this.$router.push(this.resolveRedirect);
      } else if (!this.ldReady) {
        this.setLdRedirectReadyWatcher();
        this.setLdRedirectFlagWatcher();
      }
    },
  };
};
