import Database from '@tauri-apps/plugin-sql'

/**
 * Loads the main.db SQLite database stored in appdata/roaming,
 * creates one if it doesn't exist already
 * @returns the loaded database object
 */

const validNationalities: String[] = ["American", "German"]

export async function loadMainDatabase(): Promise<Database> {
    const db = await Database.load("sqlite:main.db")
    await db.execute(`PRAGMA foreign_keys = ON`);
    await db.execute(`CREATE TABLE IF NOT EXISTS authors
                      (
                          id          INTEGER PRIMARY KEY AUTOINCREMENT,
                          name        TEXT NOT NULL,
                          nationality TEXT NOT NULL,
                          birth_year  INTEGER
                      )
    `)
    await db.execute(`CREATE TABLE IF NOT EXISTS works
                      (
                          id             INTEGER PRIMARY KEY AUTOINCREMENT,
                          title          TEXT    NOT NULL,
                          genre          TEXT    NOT NULL,
                          language       TEXT    NOT NULL,
                          year_published INTEGER,
                          author_id      INTEGER NOT NULL,
                          FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE
                      )
    `)
    await db.execute(`CREATE TABLE IF NOT EXISTS authors_questions
                      (
                          id         INTEGER PRIMARY KEY AUTOINCREMENT,
                          difficulty TEXT    NOT NULL,
                          content    TEXT    NOT NULL,
                          audio_path TEXT    NOT NULL,
                          author_id  INTEGER NOT NULL,
                          FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE
                      )
    `)
    await db.execute(`CREATE TABLE IF NOT EXISTS works_questions
                      (
                          id         INTEGER PRIMARY KEY AUTOINCREMENT,
                          difficulty TEXT    NOT NULL,
                          content    TEXT    NOT NULL,
                          audio_path TEXT    NOT NULL,
                          work_id    INTEGER NOT NULL,
                          FOREIGN KEY (work_id) REFERENCES works (id) ON DELETE CASCADE
                      )
    `)
    return db
}

/**
 * Gets the name of a provided author by ID in provided database
 * @param db opened SQLite database with an authors table
 * @param id the ID (primary key) of desired author
 * @returns name of the author
 */
export async function getAuthorNameByID(db: Database, id: number): Promise<string> {
    const selectedArray: { name: string }[] = await db.select("SELECT name FROM authors WHERE id = ?", [id])
    return selectedArray[0].name //Since the above returns an array with one object, we take that object's name
}

/**
 * Returns an array of objects from a given database name
 * @param db database to open
 * @param name name of the table within the database
 * @returns an array of object within the table
 */
export async function getTableByName(db: Database, name: string): Promise<{}[]> {
    return await db.select(`SELECT *
                            FROM "${name}"`)
}

/**
 * Inserts an author with given parameters into authors table
 * @param db database to insert into
 * @param name the author's full name
 * @param nationality the author's nationality
 * @param birthYear author's year of birth if applicable (negative is BCE)
 */
export async function addAuthor(db: Database, name: String, nationality: String, birthYear: number): Promise<void> {
    if (!validNationalities.includes(nationality)) {
        throw new Error("Invalid nationality \"" + name + "\" provided when trying to add author")
    } else if (isNaN(Number(birthYear))) {
        throw new Error("Invalid birth year \"" + birthYear + "\" provided when trying to add author")
    } else {
        await db.execute(`INSERT INTO authors (name, nationality, birth_year)
                          VALUES ("${name}", "${nationality}", "${birthYear}")`)
    }

}

export async function updateAuthor(db: Database, id: number, fieldToChange: String, newValue: String | number): Promise<void> {
    await db.execute(`UPDATE authors
                      SET "${fieldToChange}" = "${newValue}"
                      WHERE id = "${id}"`)
}