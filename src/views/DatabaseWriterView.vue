<script setup lang="ts">
import {loadMainDatabase} from "../functions/database-methods.ts";
import {getTableByName} from "../functions/database-methods.ts";
import {onMounted} from "vue";
import {ref} from "vue";

const authorsTable = ref()
onMounted(async () => {
  const db = await loadMainDatabase()
  authorsTable.value = await getTableByName(db, "authors")
})

</script>


<template>
  <body>
  <header>
    <h1>Database Writer!</h1>
  </header>
  <main>
    <table>
      <tr>
        <th>id</th>
        <th>Name</th>
        <th>Nationality</th>
      </tr>
      <tr v-for="author in authorsTable">
        <td>{{ author.id }}</td>
        <td>{{ author.name }}</td>
        <td>{{ author.nationality }}</td>
      </tr>
    </table>

  </main>
  </body>
</template>

<style scoped>
table, td, th {
  border: 1px solid whitesmoke;
  border-collapse: collapse;
}

td, th {
  padding: 10px;
}
</style>