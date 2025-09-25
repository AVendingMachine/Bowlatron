<script setup lang="ts">
import {getAuthorNameByID} from "../functions/database-methods.ts";
import {loadMainDatabase} from "../functions/database-methods.ts";
import {onMounted} from "vue";
import {ref} from "vue";

const gorg = ref()
onMounted(async () => {
  const db = await loadMainDatabase()
  gorg.value = await getAuthorNameByID(db, 1)
})

</script>


<template>
  <body>
  <header>
    <h1>Database Writer!</h1>
    <p>{{ gorg }}</p>
  </header>
  <main>

  </main>
  </body>
</template>

<style scoped>

</style>