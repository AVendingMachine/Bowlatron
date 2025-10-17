<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import {loadMainDatabase} from "../functions/database-methods.ts";
import {getTableByName} from "../functions/database-methods.ts";
import {onMounted} from "vue";
import {ref} from "vue";
import {addAuthor} from "../functions/database-methods.ts";
import {updateEntryByID} from "../functions/database-methods.ts";
import {deleteEntryByID} from "../functions/database-methods.ts";

const authorsTable = ref()
const db = ref()
const viewSelected = ref('authors')
const errorMessage = ref('')

const authorForm = ref({
  name: '',
  nationality: '',
  birthYear: 0
})
const fieldChangeForm = ref({
  id: 0,
  table: '',
  fieldName: '',
  newValue: '' as any
})
const fieldDeletionForm = ref({
  id: 0,
  table: ''
})

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

/**
 * Attempts to submit the add author form, displays error message if it has a problem
 */
async function submitAuthorForm() {
  errorMessage.value = ""
  try {
    await addAuthor(db.value, authorForm.value)
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

async function submitFieldChangeForm(tableName: string) {
  errorMessage.value = ""
  try {
    await updateEntryByID(db.value, tableName, fieldChangeForm.value.id, fieldChangeForm.value.fieldName, fieldChangeForm.value.newValue)
  } catch (error: any) {
    errorMessage.value = error.message
  }
}
</script>


<template>
  <body>
  <header>
    <h1>Database Writer!</h1>
  </header>
  <main>
    <div class="Navigate">
      <button @click="viewSelected='authors'">Authors</button>
      <button @click="viewSelected='works'">Works</button>
      <button @click="viewSelected='authors_questions'">Authors Questions</button>
      <button @click="viewSelected='works_questions'">Works Questions</button>
    </div>
    <div v-if="viewSelected == 'authors'" class="AuthorDatabase">
      <h2>Authors</h2>
      <p class="error">{{ errorMessage }}</p>
      <p>Add Author</p>
      <span>Name:</span><input v-model="authorForm.name"><br>
      <span>Nationality:</span><input v-model="authorForm.nationality"><br>
      <span>Birth Year:</span><input v-model="authorForm.birthYear"><br>
      <button @click="submitAuthorForm">submit</button>

      <p>Edit Author</p>
      <span>ID:</span><input v-model="fieldChangeForm.id"><br>
      <span>Field Name:</span><input v-model="fieldChangeForm.fieldName"><br>
      <span>New Value:</span><input v-model="fieldChangeForm.newValue"><br>
      <button
          @click="submitFieldChangeForm('authors')">
        submit
      </button>
      <br>

      <p>Delete Author</p>
      <span>ID:</span><input v-model="fieldDeletionForm.id"><br>
      <button @click="deleteEntryByID(db,'authors',fieldDeletionForm.id)">submit</button>
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
    </div>
    <div v-if="viewSelected == 'works'" class="WorksDatabase">
      <h2>Works</h2>
    </div>
    <div v-if="viewSelected == 'authors_questions'" class="AuthorsQuestionsDatabase">
      <h2>Authors Questions</h2>
    </div>
    <div v-if="viewSelected == 'works_questions'" class="WorksQuestionsDatabase">
      <h2>Works Questions</h2>
    </div>
  </main>
  </body>
</template>

<style scoped>
table, td, th {
  border: 1px solid whitesmoke;
  border-collapse: collapse;
}

.error {
  color: red;
  font-weight: bold;
  background-color: white;
  padding: 16px;
}

td, th {
  padding: 10px;
}
</style>