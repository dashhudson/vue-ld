// Adapted from https://github.com/vuelidate/vuelidate/blob/9b5228c5444c78ca6bb41d2b51d74c27e30641a9/scripts/swap-vue.js
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const modules = path.join(__dirname, '../node_modules');
const libraries = ['vue', '@vue/test-utils'];
const version = Number(process.argv[2]) || 2;

function rename(fromPath, toPath) {
  if (!fs.existsSync(fromPath)) return;
  try {
    fs.renameSync(fromPath, toPath);
    console.log(`Renamed ${fromPath} to ${toPath}`);
  } catch (err) {
    console.error(err);
  }
}

libraries.forEach((library) => {
  const active = path.join(modules, library);
  const vue2 = path.join(modules, `${library}2`);
  const vue3 = path.join(modules, `${library}3`);

  if (fs.existsSync(active)) {
    if (version === 2 && fs.existsSync(vue2)) {
      // Swap in vue2
      rename(active, vue3);
      rename(vue2, active);
    } else if (version === 3 && fs.existsSync(vue3)) {
      // Swap in vue3
      rename(active, vue2);
      rename(vue3, active);
    } else {
      console.log(`${library} ${version} is already in use`);
    }
  } else {
    // No active version, so just activate desired version.
    console.log(`No currently active ${library} version`);
    if (!fs.existsSync(vue2)) {
      console.error(`Could not find ${vue2}`);
      process.exit(1);
    } else if (!fs.existsSync(vue3)) {
      console.error(`Could not find ${vue3}`);
      process.exit(1);
    } else if (version === 3) {
      rename(vue3, active);
    } else {
      rename(vue2, active);
    }
  }
});
