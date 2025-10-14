import Database from '@tauri-apps/plugin-sql'

interface Author {
    name: string
    nationality: string
}


/**
 * Loads the main.db SQLite database stored in appdata/roaming,
 * creates one if it doesn't exit already
 * @returns the loaded database object
 */
export async function loadMainDatabase(): Promise<Database> {
    const db = await Database.load("sqlite:main.db")
    await db.execute(`CREATE TABLE IF NOT EXISTS authors
                      (
                          id          INTEGER PRIMARY KEY AUTOINCREMENT,
                          name        TEXT NOT NULL,
                          nationality TEXT NOT NULL
                      )
    `)
    await db.execute(`CREATE TABLE IF NOT EXISTS works
                      (
                          id        INTEGER PRIMARY KEY AUTOINCREMENT,
                          name      TEXT    NOT NULL,
                          genre     TEXT    NOT NULL,
                          author_id INTEGER NOT NULL,
                          FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE
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
 * Adds an author object specified to the given database's authors table
 * @param db the database to insert into
 * @param author the author object to be inserted
 */
export async function addAuthor(db: Database, author: Author): Promise<void> {
    await db.execute(`INSERT INTO authors (name, nationality)
                      VALUES ("${author.name}", "${author.nationality}")`)
}