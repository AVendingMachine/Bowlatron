import Database from '@tauri-apps/plugin-sql'

const validNationalities: String[] = ["American", "German"]

interface Author {
    name: String
    nationality: String
    birthYear: number
}

/**
 * Loads the main.db SQLite database stored in appdata/roaming,
 * creates one if it doesn't exist already
 * @returns the loaded database object
 */
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
 * Returns the name field of an entry with the given id in a table
 * @param db database containing table
 * @param table table with field
 * @param id the id field of the entry
 */
export async function getNameByID(db: Database, table: string, id: number): Promise<string> {
    return db.select(`SELECT name
                      FROM "${table}"
                      WHERE id = "${id}"`)
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
 * Inserts a specific author into the given database
 * @param db the opened database
 * @param author the author object to be added
 */
export async function addAuthor(db: Database, author: Author): Promise<void> {

    if (!validNationalities.includes(author.nationality)) {
        throw new Error("Invalid nationality \"" + author.nationality + "\" provided when trying to add author")
    } else if (isNaN(Number(author.birthYear))) {
        throw new Error("Invalid birth year \"" + author.birthYear + "\" provided when trying to add author")
    } else {
        await db.execute(`INSERT INTO authors (name, nationality, birth_year)
                          VALUES ("${author.name}", "${author.nationality}", "${author.birthYear}")`)
    }

}

/**
 * Checks if a given table exists in given database
 * @param db database to check
 * @param table table name, case-sensitive
 */
async function isValidTable(db: Database, table: String): Promise<boolean> {
    try {
        await db.select(`SELECT *
                         FROM "${table}"`)
        return true;
    } catch (error: any) {
        return false;
    }
}

/**
 * Checks if a given table has a given column
 * @param db database containing table
 * @param table table to check
 * @param field the name of the column
 */
async function isValidField(db: Database, table: String, field: String): Promise<boolean> {
    try {
        await db.select(`SELECT "${field}"
                         FROM "${table}"`)
        return true;
    } catch (error: any) {
        return false;
    }
}

/**
 * Updates a field on a given row of a given table of a database by ID
 * @param db the database to use
 * @param tableName the name of the table (authors, works, authors_questions, works_questions)
 * @param id the id (primary key) of the row
 * @param fieldToChange the field to be changed
 * @param newValue the value to insert into the field
 */
export async function updateEntryByID(db: Database, tableName: String, id: number, fieldToChange: String, newValue: String | number): Promise<void> {
    if (!(await isValidTable(db, tableName))) {
        throw new Error("Cannot find table \"" + tableName + "\" in the database")
    } else if (await isValidField(db, tableName, fieldToChange)) {
        throw new Error("Cannot find field name \"" + fieldToChange + "\" in the database")
    } else {
        await db.execute(`UPDATE "${tableName}"
                          SET "${fieldToChange}" = "${newValue}"
                          WHERE id = "${id}"`)
    }

}

/**
 * Deletes a row given its id field in the given table
 * @param db database containing table
 * @param tableName name of table
 * @param id id of row in table
 */
export async function deleteEntryByID(db: Database, tableName: String, id: number): Promise<void> {
    await db.execute(`DELETE
                      FROM "${tableName}"
                      WHERE id = "${id}"`)
}