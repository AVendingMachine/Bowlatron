<script lang="ts" setup xmlns="http://www.w3.org/1999/html">
import {
  addAuthor,
  addAuthorQuestion,
  addWork,
  addWorkQuestion,
  deleteEntryByID,
  difficulties,
  getIDByFieldValue,
  getTableByName,
  loadMainDatabase,
  updateEntryByID,
  validGenres,
  validLanguages,
  validNationalities
} from "../functions/database-methods.ts";
import {onMounted, ref} from "vue";
//@ts-ignore
import VSelect from "vue-select";


// Generic
const db = ref()
const viewSelected = ref('authors')
const actionSelected = ref('add')
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

// Author-Question Related
const authorsQuestionsTable = ref()
const authorQuestionsAddForm = ref({
  questionContent: '',
  difficulty: 'Easy',
  authorName: ''
})
const authorQuestionsChangeForm = ref({
  id: 0,
  fieldName: '',
  newValue: '' as any
})

// Work-Question Related
const worksQuestionsTable = ref()
const worksQuestionsAddForm = ref({
  questionContent: '',
  difficulty: 'Easy',
  workName: ''
})
const worksQuestionsChangeForm = ref({
  id: 0,
  fieldName: '',
  newValue: '' as any
})

onMounted(async () => {
  db.value = await loadMainDatabase()
  authorsTable.value = await getTableByName(db.value, "authors")
  worksTable.value = await getTableByName(db.value, "works")
  authorsQuestionsTable.value = await getTableByName(db.value, "authors_questions")
  worksQuestionsTable.value = await getTableByName(db.value, "works_questions")
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
    await reloadAuthorsTable()
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
    await updateEntryByID(db.value, 'authors', authorID, authorChangeForm.value.fieldName, authorChangeForm.value.newValue)
    await reloadAuthorsTable()
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

/**
 * Attempts to submit the work add form
 */
async function submitWorkAddForm() {
  errorMessage.value = ""
  try {
    await addWork(db.value, workAddForm.value)
    await reloadWorksTable()
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

/**
 * Attempts to change the work specified by workChangeForm
 */
async function submitWorkChangeForm() {
  try {
    const workID: number = await getIDByFieldValue(db.value, 'works', 'title', workChangeForm.value.title)
    await updateEntryByID(db.value, 'works', workID, workChangeForm.value.fieldName, workChangeForm.value.newValue)
    await reloadWorksTable()
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

// AuthorQuestion-Related functions

/**
 * Attempts to reload the "authors_questions" table
 */
async function reloadAuthorQuestionsTable() {
  authorsQuestionsTable.value = await getTableByName(db.value, "authors_questions")
}

/**
 * Attempts to add an author question to the database
 */
async function submitAuthorQuestionsAddForm() {
  errorMessage.value = ""
  try {
    await addAuthorQuestion(db.value, authorQuestionsAddForm.value)
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

/**
 * Changes a work in the authors questions table
 */
async function submitAuthorQuestionsChangeForm() {
  try {
    await updateEntryByID(db.value, 'authors_questions', authorQuestionsChangeForm.value.id,
        authorQuestionsChangeForm.value.fieldName, authorQuestionsChangeForm.value.newValue)
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

// WorkQuestion-Related functions

/**
 * Attempts to reload the "authors_questions" table
 */
async function reloadWorkQuestionsTable() {
  worksQuestionsTable.value = await getTableByName(db.value, "works_questions")
}

/**
 * Attempts to add an author question to the database
 */
async function submitWorkQuestionsAddForm() {
  errorMessage.value = ""
  try {
    await addWorkQuestion(db.value, worksQuestionsAddForm.value)
    await reloadWorkQuestionsTable()
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

/**
 * Changes a work in the authors questions table
 */
async function submitWorkQuestionsChangeForm() {
  try {
    await updateEntryByID(db.value, 'works_questions', worksQuestionsChangeForm.value.id,
        worksQuestionsChangeForm.value.fieldName, worksQuestionsChangeForm.value.newValue)
    await reloadWorkQuestionsTable()
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

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
 * Reloads all relevant tables
 */
async function reloadAllTables() {
  await reloadWorksTable()
  await reloadAuthorsTable()
  await reloadAuthorQuestionsTable()
  await reloadWorkQuestionsTable()
}

/**
 * Attempts to submit the field deletion form for the given table
 * @param tableName the name of the table to check
 */
async function submitFieldDeletionForm(tableName: String) {
  try {
    await deleteEntryByID(db.value, tableName, fieldDeletionForm.value.id)
    await reloadAllTables()
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
    <div v-if="viewSelected == 'authors'" class="NavigationView">
      <div class="Forms">
        <h2>Authors</h2>
        <p class="error">{{ errorMessage }}</p>
        <div class="Navigate">
          <button @click="actionSelected = 'add'">Add</button>
          <button @click="actionSelected = 'edit'">Edit</button>
          <button @click="actionSelected = 'delete'">Delete</button>
        </div>
        <div v-if="actionSelected == 'add'">
          <h3>Add Author</h3>
          <p>Name</p>
          <input v-model="authorAddForm.name"><br>
          <p>Nationality</p>
          <v-select v-model="authorAddForm.nationality" :options="validNationalities" class="dropdownSelect"></v-select>
          <p>Birth Year</p>
          <input v-model="authorAddForm.birthYear"><br>
          <br>
          <button @click="submitAuthorAddForm">submit</button>
        </div>
        <div v-if="actionSelected == 'edit'">
          <h3>Edit Author</h3>
          <p>Name</p>
          <input v-model="authorChangeForm.name"><br>
          <p>Field Name:</p>
          <input v-model="authorChangeForm.fieldName"><br>
          <p>New Value:</p>
          <input v-model="authorChangeForm.newValue"><br>
          <br>
          <button
              @click="submitAuthorChangeForm()">
            submit
          </button>
        </div>
        <div v-if="actionSelected == 'delete'">
          <h3>Delete Author</h3>
          <p>ID</p>
          <input v-model="fieldDeletionForm.id"><br>
          <br>
          <button @click="submitFieldDeletionForm(`authors`)">submit</button>
        </div>
      </div>
      <div class="Tables">
        <table>
          <tbody>
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
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="viewSelected == 'works'" class="NavigationView">
      <div class="Forms">
        <h2>Works</h2>
        <p class="error">{{ errorMessage }}</p>
        <div class="Navigate">
          <button @click="actionSelected = 'add'">Add</button>
          <button @click="actionSelected = 'edit'">Edit</button>
          <button @click="actionSelected = 'delete'">Delete</button>
        </div>
        <div v-if="actionSelected == 'add'">
          <h3>Add Work</h3>
          <p>Title</p>
          <input v-model="workAddForm.title"><br>
          <p>Genre</p>
          <v-select v-model="workAddForm.genre" :options="validGenres" class="dropdownSelect"></v-select>
          <p>Language</p>
          <v-select v-model="workAddForm.language" :options="validLanguages" class="dropdownSelect"></v-select>
          <p>Year Published:</p>
          <input v-model="workAddForm.yearPublished"><br>
          <p>Author</p>
          <v-select v-model="workAddForm.author" :options="authorsTable" :reduce="authorsTable => authorsTable.name"
                    class="dropdownSelect" label="name"></v-select>
          <br>
          <button @click="submitWorkAddForm">submit</button>
        </div>
        <div v-if="actionSelected == 'edit'">
          <h3>Edit Work</h3>
          <p>Title</p>
          <input v-model="workChangeForm.title"><br>
          <p>Field Name</p>
          <input v-model="workChangeForm.fieldName"><br>
          <p>New Value</p>
          <input v-model="workChangeForm.newValue"><br>
          <br>
          <button @click="submitWorkChangeForm">Submit</button>
        </div>
        <div v-if="actionSelected == 'delete'">
          <h3>Delete Work</h3>
          <p>ID</p>
          <input v-model="fieldDeletionForm.id"><br>
          <br>
          <button @click="submitFieldDeletionForm(`works`)">submit</button>
        </div>
      </div>
      <div class="Tables">
        <table>
          <tbody>
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
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="viewSelected == 'authors_questions'" class="NavigationView">
      <div class="Forms">
        <h2>Authors Questions</h2>
        <p class="error">{{ errorMessage }}</p>
        <div class="Navigate">
          <button @click="actionSelected = 'add'">Add</button>
          <button @click="actionSelected = 'edit'">Edit</button>
          <button @click="actionSelected = 'delete'">Delete</button>
        </div>
        <div v-if="actionSelected == 'add'">
          <h3>Add Question</h3>
          <p>Question</p>
          <textarea v-model="authorQuestionsAddForm.questionContent" cols="50" rows="3"></textarea><br>
          <p>Difficulty</p>
          <v-select v-model="authorQuestionsAddForm.difficulty" :options="difficulties"
                    class="dropdownSelect"></v-select>
          <p>Author</p>
          <v-select v-model="authorQuestionsAddForm.authorName" :options="authorsTable"
                    :reduce="authorsTable => authorsTable.name"
                    class="dropdownSelect" label="name"></v-select>
          <br>
          <button @click="submitAuthorQuestionsAddForm">submit</button>
        </div>
        <div v-if="actionSelected == 'edit'">
          <h3>Edit Question</h3>
          <p>ID</p>
          <input v-model="authorQuestionsChangeForm.id"><br>
          <p>Field Name</p>
          <input v-model="authorQuestionsChangeForm.fieldName"><br>
          <p>New Value</p>
          <input v-model="authorQuestionsChangeForm.newValue"><br>
          <br>
          <button @click="submitAuthorQuestionsChangeForm">Submit</button>
        </div>
        <div v-if="actionSelected == 'delete'">
          <h3>Delete Question</h3>
          <p>ID</p>
          <input v-model="fieldDeletionForm.id"><br>
          <br>
          <button @click="submitFieldDeletionForm(`authors_questions`)">submit</button>
        </div>
      </div>
      <div class="Tables">
        <table>
          <tbody>
          <tr>
            <th>id</th>
            <th>Weight</th>
            <th>Difficulty</th>
            <th>Content</th>
            <th>Author</th>
          </tr>
          <tr v-for="authorQuestion in authorsQuestionsTable">
            <td>{{ authorQuestion.id }}</td>
            <td>{{ authorQuestion.weight }}</td>
            <td>{{ authorQuestion.difficulty }}</td>
            <td>{{ authorQuestion.content }}</td>
            <td>{{ authorQuestion.author_id }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="viewSelected == 'works_questions'" class="NavigationView">
      <div class="Forms">
        <h2>Works Questions</h2>
        <p class="error">{{ errorMessage }}</p>
        <div class="Navigate">
          <button @click="actionSelected = 'add'">Add</button>
          <button @click="actionSelected = 'edit'">Edit</button>
          <button @click="actionSelected = 'delete'">Delete</button>
        </div>
        <div v-if="actionSelected == 'add'">
          <h3>Add Question</h3>
          <p>Question</p>
          <textarea v-model="worksQuestionsAddForm.questionContent" cols="50" rows="3"></textarea><br>
          <p>Difficulty</p>
          <v-select v-model="worksQuestionsAddForm.difficulty" :options="difficulties"
                    class="dropdownSelect"></v-select>
          <p>Work</p>
          <v-select v-model="worksQuestionsAddForm.workName" :options="worksTable"
                    :reduce="worksTable => worksTable.title"
                    class="dropdownSelect" label="title"></v-select>
          <br>
          <button @click="submitWorkQuestionsAddForm">submit</button>
        </div>
        <div v-if="actionSelected == 'edit'">
          <h3>Edit Question</h3>
          <p>ID</p>
          <input v-model="worksQuestionsChangeForm.id"><br>
          <p>Field Name</p>
          <input v-model="worksQuestionsChangeForm.fieldName"><br>
          <p>New Value</p>
          <input v-model="worksQuestionsChangeForm.newValue"><br>
          <br>
          <button @click="submitWorkQuestionsChangeForm">Submit</button>
        </div>
        <div v-if="actionSelected == 'delete'">
          <h3>Delete Question</h3>
          <p>ID</p>
          <input v-model="fieldDeletionForm.id"><br>
          <br>
          <button @click="submitFieldDeletionForm(`works_questions`)">submit</button>
        </div>
      </div>
      <div class="Tables">
        <table>
          <tbody>
          <tr>
            <th>id</th>
            <th>Weight</th>
            <th>Difficulty</th>
            <th>Content</th>
            <th>Work</th>
          </tr>
          <tr v-for="workQuestion in worksQuestionsTable">
            <td>{{ workQuestion.id }}</td>
            <td>{{ workQuestion.weight }}</td>
            <td>{{ workQuestion.difficulty }}</td>
            <td>{{ workQuestion.content }}</td>
            <td>{{ workQuestion.work_id }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
  </body>
</template>

<style scoped>
@font-face {
  font-family: 'Open-Sans';
  src: url('../assets/fonts/opensans-webfont.woff');
}

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
  max-width: 20rem;
}

textarea {
  resize: none;
}

:deep() {
  --vs-controls-color: #ffffff;
  --vs-border-color: #ffffff;
  --vs-dropdown-bg: #ffffff;
  --vs-dropdown-color: #ffffff;
  --vs-dropdown-option-color: #000000;
  --vs-dropdown-option--active-bg: #5897fb;
  --vs-selected-bg: #000000;
  --vs-selected-color: #eeeeee;
  --vs-search-input-color: #eeeeee;
  --vs-search-input-bg: rgb(255, 255, 255);
  --vs-dropdown-option--active-color: #eeeeee;
  --vs-border-radius: 0;
  --vs-selected-border-width: var(0);
}

input:focus textarea:focus {
  outline: none;
}

.NavigationView {
  display: flex;
}

.NavigationView > * {
  width: 100%;
  margin: 1rem;
}

table {
  width: 100%;
}

.dropdownSelect {
  width: 11rem;
}

input {
  border: 1px solid var(--vs-controls-color);
  background-color: rgba(0, 0, 0, 0);
  color: var(--vs-controls-color);
  font-size: var(--vs-font-size);
  line-height: var(--vs-line-height);
  font-family: Open-Sans, sans-serif;
  padding-left: 10px;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
  width: 10rem;
}

</style>