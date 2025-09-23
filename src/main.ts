import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import './assets/main.css'
//createApp(App).mount("#app"); no fucking clue what this was for
createApp(App).use(router).mount('#app')


import Database from '@tauri-apps/plugin-sql'

const db = await Database.load("sqlite:main.db")

db.execute("CREATE TABLE IF NOT EXISTS authors (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "name TEXT NOT NULL" +
    ")")

export function addAuthor(name: string) {
    db.execute("INSERT INTO authors (name) VALUES (?)", [name])
}

//db.execute("INSERT INTO authors (name) VALUES ('graggle')")
const author = await db.select("SELECT * FROM authors")
console.log(author)
