<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import {loadMainDatabase} from "../functions/database-methods.ts";
import {getTableByName} from "../functions/database-methods.ts";
import {onMounted} from "vue";
import {ref} from "vue";
import {addAuthor} from "../functions/database-methods.ts";
import {updateAuthor} from "../functions/database-methods.ts";

const inputtedAuthorName = ref()
const inputtedAuthorNationality = ref()
const inputtedAuthorBirthYear = ref()
const inputtedAuthorID = ref()
const inputtedFieldName = ref()
const inputtedNewField = ref()
const authorsTable = ref()
const db = ref()

onMounted(async () => {
  db.value = await loadMainDatabase()
  authorsTable.value = await getTableByName(db.value, "authors")
})

/**
 * Reloads the "authors" table in the loaded database
 */
async function reloadAuthorsTable() {
  authorsTable.value = await getTableByName(db.value, "authors")
}

/**
 * Turns a given year integer into a string year, if it is
 * negative, then turns it into a BC date
 * @param year the given year number that can be positive or negative
 */
function toValidYear(year: number): string {
  let yearString: string = year.toString()
  if (year < 0) {
    return yearString.replace("-", "") + " BC"
  }
  return yearString
}

</script>


<template>
  <body>
  <header>
    <h1>Database Writer!</h1>
  </header>
  <main>
    <p>Add Author</p>
    <span>Name:</span><input v-model="inputtedAuthorName"><br>
    <span>Nationality:</span><input v-model="inputtedAuthorNationality"><br>
    <span>Birth Year:</span><input v-model="inputtedAuthorBirthYear"><br>
    <button @click="addAuthor(db,inputtedAuthorName,inputtedAuthorNationality,inputtedAuthorBirthYear)">submit</button>
    <p>Edit Author</p>
    <span>ID:</span><input v-model="inputtedAuthorID"><br>
    <span>Field Name:</span><input v-model="inputtedFieldName"><br>
    <span>New Value:</span><input v-model="inputtedNewField"><br>
    <button @click="updateAuthor(db,inputtedAuthorID,inputtedFieldName,inputtedNewField)">submit</button>
    <br><br>

    <button @click="reloadAuthorsTable()">Refresh DB</button>
    <br>
    <table>
      <tr>
        <th>id</th>
        <th>Name</th>
        <th>Nationality</th>
        <th>Birth Year</th>
      </tr>
      <tr v-for="author in authorsTable">
        <td>{{ author.id }}</td>
        <td>{{ author.name }}</td>
        <td>{{ author.nationality }}</td>
        <td>{{ toValidYear(author.birth_year) }}</td>
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