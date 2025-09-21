<script setup lang="ts">

import {getAuthors} from "../composables/useDatabase.ts";

console.log(getAuthors());

</script>

<template>
  <body>
  <header>
    <h1 ref="gorg">Database Writer!</h1>
  </header>
  <main>

  </main>
  </body>
</template>

<style scoped>

</style>