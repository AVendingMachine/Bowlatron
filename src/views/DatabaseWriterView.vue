<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import {addWork, loadMainDatabase} from "../functions/database-methods.ts";
import {getTableByName} from "../functions/database-methods.ts";
import {onMounted} from "vue";
import {ref} from "vue";
import {addAuthor} from "../functions/database-methods.ts";
import {updateEntryByID} from "../functions/database-methods.ts";
import {deleteEntryByID} from "../functions/database-methods.ts";
import {getIDByFieldValue} from "../functions/database-methods.ts";

// Generic
const db = ref()
const viewSelected = ref('authors')
const errorMessage = ref('')
const fieldDeletionForm = ref({
  id: 0,
})

// Author-Related
const authorsTable = ref()
const authorAddForm = ref({
  name: '',
  nationality: '',
  birthYear: 0
})
const authorChangeForm = ref({
  name: '',
  fieldName: '',
  newValue: '' as any
})

// Work-Related
const worksTable = ref()
const workAddForm = ref({
  title: '',
  genre: '',
  language: '',
  yearPublished: 0,
  author: '',
})
const workChangeForm = ref({
  title: '',
  fieldName: '',
  newValue: '' as any
})

onMounted(async () => {
  db.value = await loadMainDatabase()
  authorsTable.value = await getTableByName(db.value, "authors")
  worksTable.value = await getTableByName(db.value, "works")
})

// Author-Related functions

/**
 * Reloads the "authors" table in the loaded database
 */
async function reloadAuthorsTable() {
  authorsTable.value = await getTableByName(db.value, "authors")
}

/**
 * Attempts to submit the add author form, displays error message if it has a problem
 */
async function submitAuthorAddForm() {
  errorMessage.value = ""
  try {
    await addAuthor(db.value, authorAddForm.value)
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

/**
 * Attempts to submit changes to an author
 */
async function submitAuthorChangeForm() {
  try {
    const authorID: number = await getIDByFieldValue(db.value, 'authors', 'name', authorChangeForm.value.name)
    console.log("AUTHORID: " + authorID)
    await updateEntryByID(db.value, 'authors', authorID, authorChangeForm.value.fieldName, authorChangeForm.value.newValue)
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

// Work-Related functions

/**
 * Attempts to reload the "works" table in the specified database
 */
async function reloadWorksTable() {
  worksTable.value = await getTableByName(db.value, "works")
}

async function submitWorkAddForm() {
  errorMessage.value = ""
  try {
    await addWork(db.value, workAddForm.value)
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

async function submitWorkChangeForm() {
}

// AuthorQuestion-Related functions

// WorkQuestion-Related functions

// Generic functions

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
 * Attempts to submit the field deletion form for the given table
 * @param tableName the name of the table to check
 */
async function submitFieldDeletionForm(tableName: String) {
  try {
    await deleteEntryByID(db.value, tableName, fieldDeletionForm.value.id)
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
      <span>Name:</span><input v-model="authorAddForm.name"><br>
      <span>Nationality:</span><input v-model="authorAddForm.nationality"><br>
      <span>Birth Year:</span><input v-model="authorAddForm.birthYear"><br>
      <button @click="submitAuthorAddForm">submit</button>

      <p>Edit Author</p>
      <span>Name:</span><input v-model="authorChangeForm.name"><br>
      <span>Field Name:</span><input v-model="authorChangeForm.fieldName"><br>
      <span>New Value:</span><input v-model="authorChangeForm.newValue"><br>
      <button
          @click="submitAuthorChangeForm()">
        submit
      </button>
      <br>

      <p>Delete Author</p>
      <span>ID:</span><input v-model="fieldDeletionForm.id"><br>
      <button @click="submitFieldDeletionForm(`authors`)">submit</button>
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
      <p class="error">{{ errorMessage }}</p>
      <p>Add Work</p>
      <span>Title:</span><input v-model="workAddForm.title"><br>
      <span>Genre:</span><input v-model="workAddForm.genre"><br>
      <span>Language:</span><input v-model="workAddForm.language"><br>
      <span>Year Published:</span><input v-model="workAddForm.yearPublished"><br>
      <span>Author:</span><input v-model="workAddForm.author"><br>
      <button @click="submitWorkAddForm">submit</button>
      <br><br>
      <button @click="reloadWorksTable">Refresh DB</button>
      <table>
        <tr>
          <th>id</th>
          <th>Title</th>
          <th>Genre</th>
          <th>Language</th>
          <th>Year Published</th>
          <th>Author</th>
        </tr>
        <tr v-for="work in worksTable">
          <td>{{ work.id }}</td>
          <td>{{ work.title }}</td>
          <td>{{ work.genre }}</td>
          <td>{{ work.language }}</td>
          <td> {{ toValidYear(work.year_published) }}</td>
          <td>{{ work.author_id }}</td>
        </tr>
      </table>
    </div>
    <div v-if="viewSelected == 'authors_questions'" class="AuthorsQuestionsDatabase">
      <h2>Authors Questions</h2>
      <p class="error">{{ errorMessage }}</p>
    </div>
    <div v-if="viewSelected == 'works_questions'" class="WorksQuestionsDatabase">
      <h2>Works Questions</h2>
      <p class="error">{{ errorMessage }}</p>
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