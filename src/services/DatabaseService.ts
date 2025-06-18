import SQLite from 'react-native-sqlite-storage';
import { BibleVerse } from '../models/BibleVerse';
import { bibleVerses } from '../assets/seeder/data';

// Enable promise based SQLite transactions
SQLite.enablePromise(true);

const DATABASE_NAME = 'ho_dlo_bible.db';
const TABLE_BOOKS = 'books';
const TABLE_CHAPTERS = 'chapters';
const TABLE_VERSES = 'verses';
const TABLE_SEARCH_HISTORY = 'search_history';
const TABLE_BOOKMARKS = 'bookmarks';

let db: SQLite.SQLiteDatabase;

export const openDatabase = async () => {
    if (db) {
        console.log('Database already open.');
        return db;
    }
    console.log('Opening database...');
    try {
        db = await SQLite.openDatabase({
            name: DATABASE_NAME,
            location: 'default',
        });
        console.log('Database OPENED:', DATABASE_NAME);
        return db;
        // try {
        //     const [results] = await db.executeSql(`SELECT COUNT(*) as count FROM ${TABLE_VERSES}`);
        //     if (results.rows.item(0).count > 0) {
        //         console.log('Verses table already has data. Skipping seed.');
        //         return;
        //     }
        // } catch (error) {
        //     console.error('Failed to check verses table:', error);
        //     const res = await createTables()
        //     console.log('Tables created successfully:', res);
        //     return db;
        // }
    } catch (error) {
        console.error('Failed to open database:', error);
        throw error;
    }
};

export const createTables = async () => {
    console.log('Creating tables...');
    if (!db) {
        await openDatabase();
    }
    try {
        console.log('Creating tables1...');
        // db.transaction(async tx => {
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS ${TABLE_BOOKS} (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT UNIQUE
            );
          `);
        console.log(`Table "${TABLE_BOOKS}" created successfully or already exists.`);
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS ${TABLE_CHAPTERS} (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              book_id INTEGER,
              number INTEGER,
              title TEXT,
              FOREIGN KEY(book_id) REFERENCES books(id)
            );
          `);
        console.log(`Table "${TABLE_CHAPTERS}" created successfully or already exists.`);
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS ${TABLE_VERSES} (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              chapter_id INTEGER,
              number INTEGER,
              text_hd TEXT,
              text_en TEXT,
              text_mm TEXT,
              FOREIGN KEY(chapter_id) REFERENCES chapters(id)
            );
          `);
        console.log(`Table "${TABLE_VERSES}" created successfully or already exists.`);
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS ${TABLE_SEARCH_HISTORY} (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              search_query TEXT,
              verse_id INTEGER NOT NULL UNIQUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(verse_id) REFERENCES verses(id)
            );
          `);
        console.log(`Table "${TABLE_SEARCH_HISTORY}" created successfully or already exists.`);
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS ${TABLE_BOOKMARKS} (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              verse_id INTEGER NOT NULL UNIQUE,
              color TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY(verse_id) REFERENCES verses(id)
            );
          `);
        console.log(`Table "${TABLE_BOOKMARKS}" created successfully or already exists.`);
        db.close();
        return true;
    } catch (error) {
        console.error('Error creating tables:', error);
        return false;
    }

};

/**
 * Checks if the database is initialized and tables are created.
 * Essentially, it tries to open the database which includes table creation.
 * @returns {Promise<boolean>} True if database is ready, false otherwise.
 */
export const checkDbExistAndInitialize = async () => {
    try {
        await openDatabase(); // This will open or create DB and tables
        return true;
    } catch (error) {
        console.error('Database initialization check failed:', error);
        return false;
    }
};

// --- Seeder Function ---

/**
 * Seeds the database with some initial sample verses if the table is empty.
 */


export const seedDatabase = (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Seeding database...');
            const database = await SQLite.openDatabase({
                name: DATABASE_NAME,
                location: 'default',
            });
            console.log('Seeding database2...');
            // Check if table is empty before seeding
            console.log('Seeding database31...');
            const count = await database.executeSql(`SELECT * FROM ${TABLE_VERSES}`)
            // console.log('Seeding database41...', count[0].rows.item);
            if (count[0].rows.length > 0) {
                console.log('Verses table already has data. Skipping seed.');
                resolve(true);
            } else {

                console.log('Seeding database4...');

                const bookMap = new Map();
                const chapterMap = new Map();

                console.log('Seeding database1...');
                const verseData = bibleVerses;
                console.log('verseData', verseData.length);
                // await db.transaction(async (tx) => {
                for (const row of verseData) {
                    const { book, chapter, chapter_title, verse, text_hd, text_en, text_mm } = row;
                    if (!bookMap.has(book)) {
                        const res = await database.executeSql('INSERT OR IGNORE INTO books (name) VALUES (?)', [book]);
                        const book_id = res[0].insertId || (await database.executeSql('SELECT id FROM books WHERE name = ?', [book]))[0].rows.item(0).id;
                        bookMap.set(book, book_id);
                        console.log('inserted book', book_id);
                    }

                    const bookId = bookMap.get(book);
                    const chapterKey = `${bookId}_${chapter}`;

                    if (!chapterMap.has(chapterKey)) {
                        const res = await database.executeSql(
                            'INSERT INTO chapters (book_id, number, title) VALUES (?, ?, ?)',
                            [bookId, chapter, chapter_title]
                        );
                        chapterMap.set(chapterKey, res[0].insertId);
                        console.log('inserted chapter', res[0].insertId);
                    }

                    const chapter_id = chapterMap.get(chapterKey);
                    await database.executeSql(
                        `INSERT INTO verses (chapter_id, number, text_hd, text_en, text_mm)
                     VALUES (?, ?, ?, ?, ?)`,
                        [chapter_id, verse, text_hd, text_en, text_mm]
                    );
                    console.log('inserted verse', chapter_id);

                    // const query = `INSERT INTO ${TABLE_VERSES} (book, chapter, verse, text_hd, text_en, text_mm) VALUES (?, ?, ?, ?, ?, ?);`;
                    // await tx.executeSql(query, [verse.book, verse.chapter, verse.verse, verse.text_hd, verse.text_en, verse.text_mm]);
                }
                // });


                console.log('Database seeded successfully with sample verses.');
                database.close();
                resolve(true);
            }
        } catch (error) {
            console.error('Error seeding database:', error);
            reject(error);
        }
    });
};


export const seedDatabase2 = (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Seeding database...');
            const database = await SQLite.openDatabase({
                name: DATABASE_NAME,
                location: 'default',
            });
            console.log('Seeding database2...');
            // Check if table is empty before seeding
            console.log('Seeding database31...');
            const tableExist = await database.executeSql(`SELECT name FROM sqlite_master WHERE type='table' AND name='${TABLE_VERSES}';`)
            console.log('tableExist', tableExist);
            const count = await database.executeSql(`SELECT * FROM ${TABLE_VERSES}`)
            console.log('Seeding database41...', count[0].rows.item);
            if (count[0].rows.length > 0) {
                console.log('Verses table already has data. Skipping seed.');
                resolve(true);
            } else {

                console.log('Seeding database4...');

                const bookMap = new Map();
                const chapterMap = new Map();

                console.log('Seeding database1...');

                const verseData = bibleVerses;
                console.log('verseData', verseData.length);
                // await db.transaction(async (tx) => {
                for (const row of verseData) {
                    const { book, chapter, chapter_title, verse, text_hd, text_en, text_mm } = row;
                    if (!bookMap.has(book)) {
                        const res = await database.executeSql('INSERT OR IGNORE INTO books (name) VALUES (?)', [book]);
                        const book_id = res[0].insertId || (await database.executeSql('SELECT id FROM books WHERE name = ?', [book]))[0].rows.item(0).id;
                        bookMap.set(book, book_id);
                        console.log('inserted book', book_id);
                    }

                    const bookId = bookMap.get(book);
                    const chapterKey = `${bookId}_${chapter}`;

                    if (!chapterMap.has(chapterKey)) {
                        const res = await database.executeSql(
                            'INSERT INTO chapters (book_id, number, title) VALUES (?, ?, ?)',
                            [bookId, chapter, chapter_title]
                        );
                        chapterMap.set(chapterKey, res[0].insertId);
                        console.log('inserted chapter', res[0].insertId);
                    }

                    const chapter_id = chapterMap.get(chapterKey);
                    await database.executeSql(
                        `INSERT INTO verses (chapter_id, number, text_hd, text_en, text_mm)
                     VALUES (?, ?, ?, ?, ?)`,
                        [chapter_id, verse, text_hd, text_en, text_mm]
                    );
                    console.log('inserted verse', chapter_id);

                }

                console.log('Database seeded successfully with sample verses.');
                database.close();
                resolve(true);
            }
        } catch (error) {
            console.error('Error seeding database:', error);
            reject(error);
        }
    });
};

// --- Insert Function ---

export const insertVerse = async ({ book, chapter, verse, text_hd = '', text_en = '', text_mm = '' }: BibleVerse) => {
    if (!db) {
        await openDatabase();
    }
    if (!book || chapter === undefined || verse === undefined) {
        throw new Error('Book, chapter, and verse are required to insert a verse.');
    }
    try {
        const [results] = await db.executeSql(
            `INSERT INTO ${TABLE_VERSES} (book, chapter, verse, text_hd, text_en, text_mm) VALUES (?, ?, ?, ?, ?, ?);`,
            [book, chapter, verse, text_hd, text_en, text_mm]
        );
        console.log(`Verse inserted: ${book} ${chapter}:${verse}, ID: ${results.insertId}`);
        return results;
    } catch (error) {
        console.error('Error inserting verse:', error);
        throw error;
    }
};

export const insertSearchHistory = async ({ search_query, verse_id }: any) => {
    console.log('insertSearchHistory', search_query, verse_id);
    const database = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
    });
    try {
        const [results] = await database.executeSql(`INSERT INTO ${TABLE_SEARCH_HISTORY} (search_query, verse_id) VALUES (?, ?);`, [search_query, verse_id]);
        console.log(`Search history inserted: ${search_query}, ID: ${results.insertId}`);
        await database.close();
        return results;
    } catch (error) {
        console.error('Error inserting search history:', error);
        await database.close();
        throw error;
    }
};


// --- Select Functions ---

export const getVersesByBook = async (bookName: string) => {
    const database = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
    });

    const result = await database.executeSql(`
      SELECT b.name as book, c.number as chapter, c.title as chapter_title,
             v.number as verse, v.text_hd, v.text_en, v.text_mm
      FROM ${TABLE_VERSES} v
      JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
      JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
      WHERE b.name = ?
      ORDER BY c.number, v.number
    `, [bookName]);
    console.log('result', result);
    const rows = result[0].rows;
    const chapterMap: any = {};

    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        if (!chapterMap[row.chapter]) {
            chapterMap[row.chapter] = {
                chapter: row.chapter,
                chapter_title: row.chapter_title,
                verses: []
            };
        }

        chapterMap[row.chapter].verses.push({
            verse: row.verse,
            text_hd: row.text_hd,
            text_en: row.text_en,
            text_mm: row.text_mm
        });
    }

    await database.close();

    return [{
        book: bookName,
        chapters: Object.values(chapterMap)
    }];
};

export const getAllVerses = async () => {
    if (!db) {
        await openDatabase();
    }
    try {
        const [results] = await db.executeSql(`SELECT * FROM ${TABLE_VERSES} ORDER BY book, chapter, verse;`);
        const verses = [];
        for (let i = 0; i < results.rows.length; i++) {
            verses.push(results.rows.item(i));
        }
        console.log(`Retrieved ${verses.length} verses.`);
        return verses;
    } catch (error) {
        console.error('Error getting all verses:', error);
        throw error;
    }
};

/**
 * Retrieves verses for a specific book and chapter.
 * @param {string} bookName - The name of the book.
 * @param {number} chapterNumber - The chapter number.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of verse objects.
 */
export const getVersesByBookAndChapter = async (bookName: string, chapterNumber: number) => {
    if (!db) {
        await openDatabase();
    }
    if (!bookName || chapterNumber === undefined) {
        throw new Error('Book name and chapter number are required.');
    }
    try {
        const [results] = await db.executeSql(
            `SELECT * FROM ${TABLE_VERSES} WHERE book = ? AND chapter = ? ORDER BY verse;`,
            [bookName, chapterNumber]
        );
        const verses = [];
        for (let i = 0; i < results.rows.length; i++) {
            verses.push(results.rows.item(i));
        }
        console.log(`Retrieved ${verses.length} verses for ${bookName} chapter ${chapterNumber}.`);
        return verses;
    } catch (error) {
        console.error(`Error getting verses for ${bookName} ${chapterNumber}:`, error);
        throw error;
    }
};

/**
 * Retrieves a specific verse by book, chapter, and verse number.
 * @param {string} bookName
 * @param {number} chapterNumber
 * @param {number} verseNumber
 * @returns {Promise<object|null>} A promise that resolves with the verse object or null if not found.
 */
export const getSpecificVerse = async (bookName: string, chapterNumber: number, verseNumber: number) => {
    if (!db) {
        await openDatabase();
    }
    if (!bookName || chapterNumber === undefined || verseNumber === undefined) {
        throw new Error('Book name, chapter number, and verse number are required.');
    }
    try {
        const [results] = await db.executeSql(
            `SELECT * FROM ${TABLE_VERSES} WHERE book = ? AND chapter = ? AND verse = ?;`,
            [bookName, chapterNumber, verseNumber]
        );
        if (results.rows.length > 0) {
            return results.rows.item(0);
        }
        return null;
    } catch (error) {
        console.error(`Error getting verse ${bookName} ${chapterNumber}:${verseNumber}:`, error);
        throw error;
    }
};

export const getChaptersByBook = async (bookName: string) => {
    console.log('Getting chapters for book:', bookName);
    const database = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
    });

    try {
        const results = await database.executeSql(`
            SELECT DISTINCT c.number, c.title
            FROM ${TABLE_CHAPTERS} c
            JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
            WHERE b.name = ?
            ORDER BY c.number
        `, [bookName]);

        const chapters = [];
        for (let i = 0; i < results[0].rows.length; i++) {
            chapters.push({
                chapter: results[0].rows.item(i).number,
                title: results[0].rows.item(i).title
            });
        }
        await database.close();
        return chapters;
    } catch (error) {
        console.error('Error getting chapters:', error);
        await database.close();
        throw error;
    }
};

export const searchVerses = async (searchQuery: string) => {
    return new Promise(async (resolve, reject) => {
        const database = await SQLite.openDatabase({
            name: DATABASE_NAME,
            location: 'default',
        });
        try {
            const [results] = await database.executeSql(`
                SELECT DISTINCT b.name as book, c.number as chapter, c.title as chapter_title,
                       v.number as verse, v.text_hd, v.text_en, v.text_mm, v.id as verse_id
                FROM ${TABLE_VERSES} v
                JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
                JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                WHERE v.text_hd LIKE ? OR v.text_en LIKE ? OR v.text_mm LIKE ?
                ORDER BY b.name, c.number, v.number
                LIMIT 100;
            `, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]);

            const verses = [];
            for (let i = 0; i < results.rows.length; i++) {
                verses.push(results.rows.item(i));
            }
            console.log(`Retrieved ${verses.length} verses for search query: ${searchQuery}`);
            await database.close();
            resolve(verses);
        } catch (error) {
            console.error('Error searching verses:', error);
            await database.close();
            reject(error);
        }
    });
};

export const getSearchHistory = async () => {
    return new Promise(async (resolve, reject) => {
        const database = await SQLite.openDatabase({
            name: DATABASE_NAME,
            location: 'default',
        });
        try {
            const [results] = await database.executeSql(`
                SELECT 
                    sh.id,
                    sh.search_query,
                    sh.created_at,
                    b.name as book,
                    c.number as chapter,
                    v.number as verse,
                    v.text_hd,
                    v.text_en,
                    v.text_mm,
                    v.id as verse_id
                FROM ${TABLE_SEARCH_HISTORY} sh
                JOIN ${TABLE_VERSES} v ON sh.verse_id = v.id
                JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
                JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                ORDER BY sh.created_at DESC;
            `);
            const verses = [];
            for (let i = 0; i < results.rows.length; i++) {
                verses.push(results.rows.item(i));
            }
            await database.close();
            resolve(verses);
        } catch (error) {
            console.error('Error getting search history:', error);
            await database.close();
            reject(error);
        }
    });
};

// --- Clear Function ---

export const clearSearchHistory = () => {
    return new Promise(async (resolve, reject) => {
        const database = await SQLite.openDatabase({
            name: DATABASE_NAME,
            location: 'default',
        });
        try {
            const [results] = await database.executeSql(`DELETE FROM ${TABLE_SEARCH_HISTORY};`);
            await database.close();
            resolve(results);
        } catch (error) {
            console.error('Error clearing search history:', error);
            await database.close();
            reject(error);
        }
    });
};

export const deleteSearchHistoryById = async (id: number) => {
    console.log('deleteSearchHistoryById', id);
    return new Promise(async (resolve, reject) => {
        const database = await SQLite.openDatabase({
            name: DATABASE_NAME,
            location: 'default',
        });
        try {
            console.log('deleteSearchHistoryById2', id);
            database.executeSql(`DELETE FROM ${TABLE_SEARCH_HISTORY} WHERE id = ?;`, [id]).then((results: any) => {
                console.log('deleteSearchHistoryById3', results);
                database.close();
                resolve(results);
            });
        } catch (error) {
            console.error('Error deleting search history:', error);
            await database.close();
            reject(error);
        }
    });
};

export const clearAllVerses = async () => {
    if (!db) {
        await openDatabase();
    }
    try {
        const [results] = await db.executeSql(`DELETE FROM ${TABLE_VERSES};`);
        // Optionally, reset the autoincrement sequence for SQLite
        // await db.executeSql(`DELETE FROM sqlite_sequence WHERE name='${TABLE_VERSES}';`);
        console.log('All verses cleared from the database.');
        return results;
    } catch (error) {
        console.error('Error clearing verses:', error);
        throw error;
    }
};

/**
 * Closes the database connection.
 * It's important to close the database when it's no longer needed,
 * for example, when the app is about to close or in a cleanup effect.
 */
// export const closeDatabase = async () => {
//   if (db) {
//     console.log('Closing database...');
//     try {
//       await db.close();
//       console.log('Database CLOSED');
//       db = null; // Reset the db variable
//     } catch (error) {
//       console.error('Failed to close database:', error);
//       throw error;
//     }
//   } else {
//     console.log('Database was not open.');
//   }
// };

// Example of how to use the service (typically in your React Native components):
/*
import * as DatabaseService from './DatabaseService';

// In an async function or useEffect:
const initializeAndUseDb = async () => {
  try {
    const isDbReady = await DatabaseService.checkDbExistAndInitialize();
    if (isDbReady) {
      await DatabaseService.seedDatabase(); // Seeds only if empty

      await DatabaseService.insertVerse({
        book: 'Psalms',
        chapter: 23,
        verse: 1,
        text_en: 'The LORD is my shepherd, I shall not want.',
        text_hd: 'מִזְמוֹר לְדָוִד יְהוָה רֹעִי לֹא אֶחְסָר',
      });

      const allVerses = await DatabaseService.getAllVerses();
      console.log('All verses:', allVerses);

      const exodus1Verses = await DatabaseService.getVersesByBookAndChapter('Exodus', 1); // Assuming Exodus 1 was seeded
      console.log('Exodus Chapter 1:', exodus1Verses);

      // await DatabaseService.clearAllVerses();
      // await DatabaseService.closeDatabase(); // Close when app unmounts or done
    }
  } catch (error) {
    console.error("DB operations failed:", error);
  }
};

// initializeAndUseDb();
*/
