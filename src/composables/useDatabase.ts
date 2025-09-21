import Database from "@tauri-apps/plugin-sql";


export async function openDatabase() {
    const db = await Database.load('sqlite:test.db')
    return db
}

export async function getAuthors() {
    const db = await openDatabase()
    const {rows} = await db.select('SELECT name FROM authors WHERE id = 1', [])
    return rows
}