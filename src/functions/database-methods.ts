import Database from '@tauri-apps/plugin-sql'

/**
 * Loads the main.db SQLite database stored in appdata/roaming
 * and returns the loaded database
 */
export async function loadMainDatabase(): Promise<Database> {
    return await Database.load("sqlite:main.db")
}

/**
 * Adds an author with the specified name to the given database
 * @param db opened SQLite database with an authors table
 * @param name the name of the author to be inserted
 */
export function addAuthor(db: Database, name: string): void {
    db.execute("INSERT INTO authors (name) VALUES (?)", [name])
}

/**
 * Gets the name of a provided author by ID in provided database
 * @param db opened SQLite database with an authors table
 * @param id the ID (primary key) of desired author
 */
export async function getAuthorNameByID(db: Database, id: number): Promise<string> {
    const selectedArray: { name: string }[] = await db.select("SELECT name FROM authors WHERE id = ?", [id])
    return selectedArray[0].name //Since the above returns an array with one object, we take that object's name
}