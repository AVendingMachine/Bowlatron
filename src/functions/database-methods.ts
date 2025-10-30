import Database from '@tauri-apps/plugin-sql'

export const validNationalities: String[] = ["American", "German"]
export const validLanguages: string[] = ["English", "Spanish", "Italian"]
export const validGenres: string[] = ["Poetry", "Long-Fiction"]
export const difficulties: string[] = ["Easy", "Medium", "Hard"]

interface Author {
    name: String
    nationality: String
    birthYear: number
}

interface Work {
    title: string
    genre: string
    language: string
    yearPublished: number
    author: string
}

interface AuthorQuestion {
    questionContent: string
    difficulty: string
    authorName: string
}

interface WorkQuestion {
    questionContent: string
    difficulty: string
    workName: string
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
                          weight     INTEGER NOT NULL,
                          difficulty TEXT    NOT NULL,
                          content    TEXT    NOT NULL,
                          audio_path TEXT,
                          author_id  INTEGER NOT NULL,
                          FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE
                      )
    `)
    await db.execute(`CREATE TABLE IF NOT EXISTS works_questions
                      (
                          id         INTEGER PRIMARY KEY AUTOINCREMENT,
                          weight     INTEGER NOT NULL,
                          difficulty TEXT    NOT NULL,
                          content    TEXT    NOT NULL,
                          audio_path TEXT,
                          work_id    INTEGER NOT NULL,
                          FOREIGN KEY (work_id) REFERENCES works (id) ON DELETE CASCADE
                      )
    `)
    return db
}

/**
 * Returns the id of an entry where it is a field containing the specified value. eg. an author has a certain name
 * @param db the database to search in
 * @param table the table to search in
 * @param field the field to check
 * @param value the value to check the field for
 * @returns the id of the entry
 */
export async function getIDByFieldValue(db: Database, table: string, field: string, value: any): Promise<number> {
    const selectedObject: [{ id: number }] = await db.select(`SELECT *
                                                              FROM "${table}"
                                                              WHERE "${field}" = "${value}"
                                                              LIMIT 1`)
    return selectedObject[0].id;
}

/**
 * Checks if a given table has an entry with a value for the specified field
 * @param db database to check
 * @param table table to check
 * @param field the field to check
 * @param value the value to look for in field
 */
async function entryExists(db: Database, table: string, field: string, value: any): Promise<boolean> {
    const selectedObject: [{}] = await db.select(`SELECT *
                                                  FROM "${table}"
                                                  WHERE "${field}" = "${value}" `);
    return selectedObject.length > 0;
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
 * Adds the specified work to the "works" table
 * @param db database to open
 * @param work work to add
 */
export async function addWork(db: Database, work: Work): Promise<void> {
    const authorExists: boolean = await entryExists(db, 'authors', 'name', work.author)
    if (!validLanguages.includes(work.language)) {
        throw new Error("Invalid language \"" + work.language + "\" provided when trying to add work")
    } else if (isNaN(Number(work.yearPublished))) {
        throw new Error("Invalid year \"" + work.yearPublished + "\" published for work")
    } else if (!validGenres.includes(work.genre)) {
        throw new Error("Invalid genres \"" + work.genre + "\" provided when trying to add work")
    } else if (!(authorExists)) {
        throw new Error("Author \"" + work.author + "\" doesn't exist")
    } else {
        const authorID = await getIDByFieldValue(db, 'authors', 'name', work.author)
        await db.execute(`INSERT INTO works (title, genre, language, year_published, author_id)
                          VALUES ("${work.title}", "${work.genre}", "${work.language}", "${work.yearPublished}",
                                  "${authorID}")`)
    }
}

/**
 * Adds the specified question to the authors questions table
 * @param db the database containing the table
 * @param authorQuestion the question to add
 */
export async function addAuthorQuestion(db: Database, authorQuestion: AuthorQuestion): Promise<void> {
    const authorExists: boolean = await entryExists(db, 'authors', 'name', authorQuestion.authorName)
    if (!authorExists) {
        throw new Error("Could not find author with name \"" + authorQuestion.authorName + "\"")
    } else if (!difficulties.includes(authorQuestion.difficulty)) {
        throw new Error("Invalid difficulty\"" + authorQuestion.difficulty + "\" please use Easy, Medium or Hard")
    } else {
        const authorID = await getIDByFieldValue(db, 'authors', 'name', authorQuestion.authorName)
        await db.execute(`INSERT INTO authors_questions (weight, difficulty, content, audio_path, author_id)
                          VALUES (0, "${authorQuestion.difficulty}", "${authorQuestion.questionContent}", NULL,
                                  "${authorID}")`)
    }
}

/**
 * Attempts to add the specified work question to the works table
 * @param db the database to insert into
 * @param workQuestion the question to add
 */
export async function addWorkQuestion(db: Database, workQuestion: WorkQuestion): Promise<void> {
    const workExists: boolean = await entryExists(db, 'works', 'title', workQuestion.workName)
    if (!workExists) {
        throw new Error("Could not find work with name \"" + workQuestion.workName + "\"")
    } else if (!difficulties.includes(workQuestion.difficulty)) {
        throw new Error("Invalid difficulty\"" + workQuestion.difficulty + "\" please use Easy, Medium or Hard")
    } else {
        const workID = await getIDByFieldValue(db, 'works', 'title', workQuestion.workName)
        console.log("WorkID: " + workID)
        await db.execute(`INSERT INTO works_questions (weight, difficulty, content, audio_path, work_id)
                          VALUES (0, "${workQuestion.difficulty}", "${workQuestion.questionContent}", NULL,
                                  "${workID}")`)
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
 * Checks if a given table has a given field
 * @param db database containing table
 * @param table table to check
 * @param field the field to check for
 */
async function isValidField(db: Database, table: String, field: String): Promise<boolean> {
    const dbSchema: { name: any }[] = await db.select(`PRAGMA table_info("${table}")`)
    for (let i = 0; i < dbSchema.length; i++) {
        if (dbSchema[i].name === field) {
            return true
        }
    }
    return false
}

/**
 * Checks if the given table has an element with that ID
 * @param db database containing table
 * @param table table to be checked
 * @param id the id of the row
 */
async function isValidID(db: Database, table: String, id: number): Promise<boolean> {
    const a: [] = await db.select(`SELECT *
                                   FROM "${table}"
                                   WHERE id = "${id}"`)
    return a.length > 0

}

/**
 * Updates a field on a given row of a given table of a database by ID
 * @param db the database to use
 * @param tableName the name of the table (authors, works, authors_questions, works_questions)
 * @param id the id (primary key) of the row
 * @param fieldToChange the field to be changed
 * @param newValue the value to insert into the field
 */
export async function updateEntryByID(db: Database, tableName: String, id: number, fieldToChange: string, newValue: String | number): Promise<void> {
    if (!(await isValidTable(db, tableName))) {
        throw new Error("Cannot find table \"" + tableName + "\" in the database")
    } else if (!(await isValidField(db, tableName, fieldToChange))) {
        throw new Error("Cannot find field \"" + fieldToChange + "\" in the database")
    } else if (!(await isValidID(db, tableName, id))) {
        throw new Error("Cannot find element with id \"" + id + "\" in the database")
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
    if (!(await isValidID(db, tableName, id))) {
        throw new Error("No entry exists with id \"" + id + "\" in the table")
    }
    await db.execute(`DELETE
                      FROM "${tableName}"
                      WHERE id = "${id}"`)
}