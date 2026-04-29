// services/DatabaseService.ts
import { Platform } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import DeviceInfo from "react-native-device-info";

import { createUser, getBookDetail, getBooks, getChapters, getVerses } from './ApiService';
import { constants } from '../constants/Data';
import { Dispatch } from '@reduxjs/toolkit';
import { setDownloaded, setDownloadProgress, setStartDownload } from '../store/slices/deviceSlice';

SQLite.enablePromise(true);

const DATABASE_NAME = 'ho_dlo_bible.db';
const TABLE_BOOKS = 'books';
const TABLE_CHAPTERS = 'chapters';
const TABLE_VERSES = 'verses';
const TABLE_SEARCH_HISTORY = 'search_history';
const TABLE_BOOKMARKS = 'bookmarks';
const TABLE_HIGHLIGHTS = 'highlights';
const TABLE_NOTIFICATIONS = 'notifications';

export default class DatabaseService {
    private static instance: DatabaseService;
    private db: SQLite.SQLiteDatabase | null = null;

    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async init(dispatch: Dispatch): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (this.db) return;

            try {
                this.db = await SQLite.openDatabase({
                    name: DATABASE_NAME,
                    location: 'default',
                });
                console.log('[DB] Opened successfully');
                await this.shouldCreateAndSeed().then((data) => {
                    const shouldCreate = data
                    console.log('[DB] shouldCreate', data);
                    if (shouldCreate) {
                        this.createTables().then(() => {
                            console.log('[DB] Tables created');
                            console.log('[DB] Seeding data...');
                            this.seedData(dispatch).then(async () => {
                                console.log('[DB] Data seeded');

                                const deviceId = await DeviceInfo.getUniqueId();
                                const deviceName = await DeviceInfo.getDeviceName();
                                const deviceType = Platform.OS;
                                const result = await createUser(deviceId, deviceName, deviceType);
                                console.log('[DB] create user result', result);
                                // this.seedAudioMilestone23().then(() => {
                                //     console.log('[DB] Audio milestone 23 seeded');
                                // });
                                // this.seedAudioMilestone24().then(() => {
                                //     console.log('[DB] Audio milestone 24 seeded');
                                // });
                                resolve(true);
                            });
                        });
                    } else resolve(true);
                }).catch((error) => {
                    console.log('[DB] shouldCreate error', error);
                });
            } catch (error) {
                console.error('[DB] Failed to open:', error);
                reject(error);
            }
        })
    }

    public async createTables(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            //         const queries = [
            //             `CREATE TABLE IF NOT EXISTS books (
            //     id INTEGER PRIMARY KEY AUTOINCREMENT,
            //     number INTEGER,
            //     name TEXT
            //   )`,
            //             `CREATE TABLE IF NOT EXISTS chapters (
            //     id INTEGER PRIMARY KEY AUTOINCREMENT,
            //     book_id INTEGER,
            //     number INTEGER
            //   )`,
            //             `CREATE TABLE IF NOT EXISTS verses (
            //     id INTEGER PRIMARY KEY AUTOINCREMENT,
            //     chapter_id INTEGER,
            //     verse_number INTEGER,
            //     text TEXT
            //   )`,
            //             `CREATE TABLE IF NOT EXISTS bookmarks (
            //     id INTEGER PRIMARY KEY AUTOINCREMENT,
            //     verse_id INTEGER,
            //     created_at TEXT
            //   )`,
            //             `CREATE TABLE IF NOT EXISTS search_history (
            //     id INTEGER PRIMARY KEY AUTOINCREMENT,
            //     query TEXT,
            //     searched_at TEXT
            //   )`,
            //         ];

            try {
                // await this.db.executeSql(
                //     `CREATE TABLE IF NOT EXISTS ${TABLE_BOOKS} (
                //     id INTEGER PRIMARY KEY AUTOINCREMENT,
                //     number INTEGER,
                //     name TEXT UNIQUE,
                //     count INTEGER,
                //     testament TEXT
                //     );`
                // );
                await this.db.executeSql(
                    `CREATE TABLE IF NOT EXISTS ${TABLE_BOOKS} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    number INTEGER,
                    name TEXT,
                    nameMy TEXT,
                    nameHd TEXT,
                    count INTEGER,
                    testament TEXT
                    );`
                );
                console.log(`Table "${TABLE_BOOKS}" created successfully or already exists.`);

                await this.db.executeSql(
                    `CREATE TABLE IF NOT EXISTS ${TABLE_CHAPTERS} (
                    id INTEGER PRIMARY KEY,
                    book_id INTEGER,
                    number INTEGER,
                    title_hd TEXT,
                    title_en TEXT,
                    title_mm TEXT,
                    audio_path TEXT,
                    is_completed INTEGER DEFAULT 0,
                    completed_at TIMESTAMP,
                    master_chapter_id INTEGER UNIQUE,
                    FOREIGN KEY(book_id) REFERENCES books(id)
                    );`
                );
                console.log(`Table "${TABLE_CHAPTERS}" created successfully or already exists.`);

                await this.db.executeSql(
                    `CREATE TABLE IF NOT EXISTS ${TABLE_VERSES} (
                    id INTEGER PRIMARY KEY,
                    chapter_id INTEGER,
                    number INTEGER,
                    text_hd TEXT,
                    text_en TEXT,
                    text_mm TEXT,
                    audio_from TEXT,
                    audio_to TEXT,
                    master_verse_id INTEGER UNIQUE,
                    subtitle_hd TEXT,
                    subtitle_my TEXT,
                    subtitle_en TEXT,
                    FOREIGN KEY(chapter_id) REFERENCES chapters(id)
                    );`
                );
                console.log(`Table "${TABLE_VERSES}" created successfully or already exists.`);

                await this.db.executeSql(
                    `CREATE TABLE IF NOT EXISTS ${TABLE_SEARCH_HISTORY} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    search_query TEXT,
                    verse_id INTEGER NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(verse_id) REFERENCES verses(id)
                    );`
                );
                console.log(`Table "${TABLE_SEARCH_HISTORY}" created successfully or already exists.`);

                await this.db.executeSql(
                    `CREATE TABLE IF NOT EXISTS ${TABLE_BOOKMARKS} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    verse_id INTEGER NOT NULL UNIQUE,
                    note TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(verse_id) REFERENCES verses(id)
                    );`
                );
                console.log(`Table "${TABLE_BOOKMARKS}" created successfully or already exists.`);

                await this.db.executeSql(
                    `CREATE TABLE IF NOT EXISTS ${TABLE_HIGHLIGHTS} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    verse_id INTEGER NOT NULL UNIQUE,
                    color TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(verse_id) REFERENCES verses(id)
                    );`
                );
                console.log(`Table "${TABLE_HIGHLIGHTS}" created successfully or already exists.`);

                await this.db.executeSql(
                    `CREATE TABLE IF NOT EXISTS ${TABLE_NOTIFICATIONS} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    verse_id INTEGER NOT NULL,
                    active INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    planned_at TIMESTAMP NOT NULL UNIQUE,
                    FOREIGN KEY(verse_id) REFERENCES verses(id)
                    );`
                );
                console.log(`Table "${TABLE_NOTIFICATIONS}" created successfully or already exists.`);
                console.log('[DB] Tables created');
                resolve(true);

            } catch (error) {
                console.error('[DB] Table creation failed:', error);
                reject(error);
            }
        })
    }

    private async shouldCreateAndSeed(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('DB not ready');

            try {
                const [checkTable] = await this.db.executeSql(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='verses'
          `);

                const tableExists = checkTable.rows.length > 0;

                if (!tableExists) {
                    console.log('[DB] Table "verses" does not exist. Will create and seed.');
                    resolve(true);
                }

                const [countResult] = await this.db.executeSql(`SELECT COUNT(*) as count FROM verses`);
                const count = countResult.rows.item(0).count;

                if (count === 0) {
                    console.log('[DB] Table "verses" exists but is empty. Will seed.');
                    resolve(true);
                }

                console.log('[DB] Table "verses" has data. No seeding needed.');
                resolve(false);

            } catch (err) {
                console.error('[DB] Error checking table or data:', err);
                reject(err);
            }
        })
    }

    private async seedData(dispatch: Dispatch): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('DB not ready');

            try {
                const [result] = await this.db.executeSql(`SELECT COUNT(*) as count FROM verses`);
                const count = result.rows.item(0).count;

                if (count > 0) {
                    console.log('[DB] Already seeded');
                    resolve(true);
                    return;
                }

                dispatch(setStartDownload(true));
                dispatch(setDownloadProgress(0));

                console.log('[DB] Fetching book list...');
                const bookAllData = await getBooks();
                console.log(`[DB] Found ${bookAllData.length} books. Starting parallel seed...`);

                let chaptersProcessed = 0;
                const CONCURRENCY_LIMIT = 5; // Download 5 books at a time

                // Process in chunks to avoid overwhelming the server
                for (let i = 0; i < bookAllData.length; i += CONCURRENCY_LIMIT) {
                    const chunk = bookAllData.slice(i, i + CONCURRENCY_LIMIT);

                    await Promise.all(chunk.map(async (book: any) => {
                        const { id: bookId, textEn, textMy, textHd, orderNumber } = book;
                        const testament = book.testament === 'Old' ? 'OT' : 'NT';

                        try {
                            console.log(`[DB] Downloading book: ${textEn} (ID: ${bookId})`);
                            const bookData = await getBookDetail(bookId);
                            const chapterData = bookData.chapters;

                            const batchQueries: any[] = [];
                            batchQueries.push([
                                'INSERT INTO books (id, name, nameMy, nameHd, number, count, testament) VALUES (?, ?, ?, ?, ?, ?, ?)',
                                [bookId, textEn, textMy, textHd, orderNumber, chapterData.length, testament]
                            ]);

                            for (const chapter of chapterData) {
                                const { id: masterChapterId, number, textHd: cTextHd, textEn: cTextEn, textMy: cTextMy, verses } = chapter;

                                batchQueries.push([
                                    `INSERT OR REPLACE INTO chapters (
                                        id, book_id, number, title_hd, title_en, title_mm, master_chapter_id
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                    [masterChapterId, bookId, number, cTextHd, cTextEn, cTextMy, masterChapterId]
                                ]);

                                for (const verse of verses) {
                                    const { id: vId, number: vNum, textHd: vHd, textEn: vEn, textMy: vMy, subtitleHd, subtitleMy, subtitleEn } = verse;
                                    batchQueries.push([
                                        `INSERT OR REPLACE INTO verses (
                                            id, chapter_id, number, text_hd, text_en, text_mm, audio_from, audio_to, master_verse_id,
                                            subtitle_hd, subtitle_my, subtitle_en
                                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                        [vId, masterChapterId, vNum, vHd, vEn, vMy, "", "", vId, subtitleHd, subtitleMy, subtitleEn]
                                    ]);
                                }
                            }

                            await (this.db as any).sqlBatch(batchQueries);
                            chaptersProcessed += chapterData.length;

                            // Update progress
                            const progress = chaptersProcessed / constants.bibleTotalChapters;
                            dispatch(setDownloadProgress(progress > 1 ? 1 : progress));
                            console.log(`[DB] Seeded ${textEn} successfully.`);

                        } catch (bookError) {
                            console.error(`[DB] Failed to seed book ${bookId}:`, bookError);
                            // We don't reject here so other books can continue, 
                            // but you might want more robust retry logic in production.
                        }
                    }));
                }

                console.log('[DB] SEEDING COMPLETED SUCCESSFULLY.');
                dispatch(setDownloaded(true));
                resolve(true);
            } catch (error) {
                console.error('[DB] Seeding Global Failure:', error);
                dispatch(setStartDownload(false));
                reject(error);
            }
        });
    }

    public async getAllData(): Promise<any> {
        const tables = [TABLE_BOOKS, TABLE_CHAPTERS, TABLE_VERSES, TABLE_SEARCH_HISTORY, TABLE_BOOKMARKS, TABLE_NOTIFICATIONS];

        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            const dataByTable: any = {};
            const columnsByTable: any = {};

            for (const table of tables) {
                try {
                    const [schemaRes] = await this.db.executeSql(`PRAGMA table_info(${table});`);
                    const [dataRes] = await this.db.executeSql(`SELECT * FROM ${table};`);

                    const cols = [];
                    for (let i = 0; i < schemaRes.rows.length; i++) {
                        cols.push(schemaRes.rows.item(i).name);
                    }

                    const rows = [];
                    for (let i = 0; i < dataRes.rows.length; i++) {
                        rows.push(dataRes.rows.item(i));
                    }

                    columnsByTable[table] = cols;
                    dataByTable[table] = rows;
                } catch (err) {
                    console.error(`Error loading table ${table}`, err);
                }
            }
            resolve({ rows: dataByTable, columns: columnsByTable });
        });
    }

    public async getVersesByKeyword(searchQuery: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(`
                    SELECT DISTINCT b.name as book, c.number as chapter, c.title_hd as chapter_title,
                           v.number as verse, v.text_hd, v.text_en, v.text_mm, v.id as verse_id
                    FROM ${TABLE_VERSES} v
                    JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
                    JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                    WHERE v.text_hd LIKE ? OR v.text_en LIKE ? OR v.text_mm LIKE ?
                    ORDER BY b.name, c.number, v.number
                    LIMIT 100;
                `, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]);
                // console.log('[DB]results', results.rows.length);
                const verses = [];
                for (let i = 0; i < results.rows.length; i++) {
                    verses.push(results.rows.item(i));
                }
                console.log(`Retrieved ${verses.length} verses for search query: ${searchQuery}`);
                resolve(verses);
            } catch (error) {
                console.error('[DB]Error searching verses:', error);
                reject(error);
            }
        });
    }

    /**
     * Functions for Verses TABLE
     * @function getVersesByBook
     * @function getVersesByChapter
     * @function getVersesById
     * @function getRandomVerse
    */

    public async getVersesByBook(bookName: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            if (!bookName || bookName === undefined) {
                reject('Book name is required.');
            }

            try {
                const result = await this.db.executeSql(
                    `SELECT b.name as book, c.number as chapter, c.title as chapter_title,
                            v.number as verse, v.text_hd, v.text_en, v.text_mm
                    FROM ${TABLE_VERSES} v
                    JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
                    JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                    WHERE b.name = ?
                    ORDER BY c.number, v.number`,
                    [bookName]);
                console.log('[DB]result', result);
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

                resolve([{
                    book: bookName,
                    chapters: Object.values(chapterMap)
                }]);
            } catch (error) {
                console.error('[DB] getVersesByBook error:', error);
                reject(error);
            }
        });
    }

    public async getVersesByChapterId(chapterId: number): Promise<any[]> {
        // console.log('[DB]getVersesByChapter', chapterId);
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            if (!chapterId || chapterId === undefined) {
                reject('Chapter Id is required.');
            }

            try {
                const [results] = await this.db.executeSql(
                    'SELECT * FROM verses WHERE chapter_id = ?',

                    [chapterId]
                );
                // console.log('[DB]results getVersesByChapter', results.rows.length);
                const verses = [];
                for (let i = 0; i < results.rows.length; i++) {
                    verses.push(results.rows.item(i));
                }
                // console.log('[DB]verses getVersesByChapter', verses);
                resolve(verses);
            } catch (error) {
                console.error('[DB] getVersesByChapter error:', error);
                reject(error);
            }
        });
    }

    public async getVersesById(verseId: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(
                    `SELECT 
                    v.id AS verse_id,
                    v.number AS verse_number,
                    v.text_hd,
                    v.text_en,
                    v.text_mm,

                    c.id AS chapter_id,
                    c.number AS chapter_number,
                    c.title_hd,
                    c.title_en,
                    c.title_mm,

                    b.id AS book_id,
                    b.number AS book_number,
                    b.name AS book_name

                    FROM verses v
                    JOIN chapters c ON v.chapter_id = c.id
                    JOIN books b ON c.book_id = b.id
                    WHERE v.id = ?;`,
                    [verseId]
                );
                if (results.rows.length > 0) {
                    resolve(results.rows.item(0));
                }
                resolve(null);
            } catch (error) {
                console.error(`[DB] getVersesById error:`, error);
                reject(error);
            }
        });
    }

    public async getRandomVerse(limit: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                // const [results] = await this.db.executeSql(`SELECT * FROM ${TABLE_VERSES} ORDER BY RANDOM() LIMIT ${limit};`);
                const [results] = await this.db.executeSql(`
                    SELECT 
                    v.id AS verse_id,
                    v.number AS verse_number,
                    v.text_hd,
                    v.text_en,
                    v.text_mm,

                    c.id AS chapter_id,
                    c.number AS chapter_number,
                    c.title_hd,
                    c.title_en,
                    c.title_mm,

                    b.id AS book_id,
                    b.number AS book_number,
                    b.name AS book_name

                    FROM ${TABLE_VERSES} v
                    JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
                    JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                    ORDER BY RANDOM()
                    LIMIT ${limit};`);
                // console.log('[DB]results getRandomVerse', results.rows.length);
                if (results.rows.length > 0) {
                    const randomVerses = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        randomVerses.push(results.rows.item(i));
                    }
                    resolve(randomVerses);
                } else {
                    resolve(null);
                }
            } catch (error) {
                console.error('[DB] getRandomVerse error:', error);
                reject(error);
            }
        });
    }

    /**
     * Functions for Chapters TABLE
     * @function getChapterIdByBookIdAndChapterNumber
     * @function getChaptersByBook
     * @function getChaptersByBookId
     * @function updateChapterCompletedAt
     * @function calcReadingProgress
     * @function getReadingHistory
     * @function getAudioReader
     * @function getChapterMasterId
    */

    public async getChapterIdByBookIdAndChapterNumber(bookId: number, chapterNumber: number): Promise<number | null> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            if (!bookId || bookId === undefined) {
                reject('Book ID is required.');
            }

            if (!chapterNumber || chapterNumber === undefined) {
                reject('Chapter number is required.');
            }

            try {
                const [results] = await this.db.executeSql(
                    `SELECT id FROM ${TABLE_CHAPTERS} WHERE book_id = ? AND number = ?`,
                    [bookId, chapterNumber]
                );

                if (results.rows.length > 0) {
                    resolve(results.rows.item(0).id);
                } else {
                    resolve(null);
                }
            } catch (error) {
                console.error('[DB] getChapterIdByBookIdAndChapterNumber error:', error);
                reject(error);
            }
        });
    }

    public async getChaptersByBook(bookName: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            if (!bookName || bookName === undefined) {
                reject('Book name is required.');
            }

            try {
                const [results] = await this.db.executeSql(
                    `SELECT DISTINCT c.number, c.title_hd
                    FROM ${TABLE_CHAPTERS} c
                    JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                    WHERE b.name = ?
                    ORDER BY c.number`,
                    [bookName]
                );
                const chapters = [];
                for (let i = 0; i < results.rows.length; i++) {
                    chapters.push({
                        chapter: results.rows.item(i).number,
                        title: results.rows.item(i).title
                    });
                }
                // console.log('[DB]results getChaptersByBook', bookName, ' => ', chapters);
                resolve(chapters);
            } catch (error) {
                console.error(`[DB] getChaptersByBook error:`, error);
                reject(error);
            }
        });
    }

    public async getChaptersByBookId(bookId: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(
                    `SELECT * FROM chapters WHERE book_id = ?`,
                    [bookId]
                );
                // console.log('[DB]results', results.rows.length);
                const chap = [];
                for (let i = 0; i < results.rows.length; i++) {
                    chap.push(results.rows.item(i));
                }
                resolve(chap);
            } catch (error) {
                console.error('[DB] getChaptersByBookId error:', error);
                reject(error);
            }
        });
    }

    public async updateChapterCompletedAt(chapterId: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            const completedAt = new Date().toISOString();
            try {
                const results: any = await this.db.executeSql(`UPDATE ${TABLE_CHAPTERS} SET is_completed = 1, completed_at = ? WHERE id = ? AND is_completed = 0`, [completedAt, chapterId]);
                // console.log('[DB] updateChapterCompletedAt results', results);
                resolve(results[0].rowsAffected > 0);
            } catch (error) {
                console.error('[DB] updateChapterCompletedAt error:', error);
                reject(error);
                return;
            }
        });
    }

    public async calcReadingProgress(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            const TOTAL_CHAPTERS = constants.bibleTotalChapters;
            try {
                const [results] = await this.db.executeSql(`SELECT COUNT(*) as completed_chapters FROM ${TABLE_CHAPTERS} WHERE is_completed = 1`);
                const completedChapters = results.rows.item(0).completed_chapters;
                // console.log('Completed Chapters:', completedChapters, '/', TOTAL_CHAPTERS);
                const readingProgress = completedChapters / TOTAL_CHAPTERS;
                const roundedReadingProgress = Math.round(readingProgress * 100) / 100;
                // console.log('Reading Progress:', roundedReadingProgress, '%');
                resolve(roundedReadingProgress);
            } catch (error) {
                console.error('[DB] calcReadingProgress error:', error);
                reject(error);
            }
        });
    }

    public async getReadingHistory(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                // const [results] = await this.db.executeSql(`SELECT * FROM ${TABLE_CHAPTERS} WHERE is_completed = 1 ORDER BY completed_at DESC;`);
                const [results] = await this.db.executeSql(
                    `SELECT chapters.*, books.name as book_name 
                     FROM ${TABLE_CHAPTERS} as chapters
                     JOIN ${TABLE_BOOKS} as books ON chapters.book_id = books.id
                     WHERE chapters.is_completed = 1
                     ORDER BY chapters.completed_at DESC;`
                );
                const readingHistory = [];
                for (let i = 0; i < results.rows.length; i++) {
                    readingHistory.push(results.rows.item(i));
                }
                resolve(readingHistory);
            } catch (error) {
                console.error('[DB] getReadingHistory error:', error);
                reject(error);
            }
        });
    }

    public async getAudioReader(chapterId: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                const [results] = await this.db.executeSql(`SELECT * FROM ${TABLE_CHAPTERS} WHERE master_chapter_id = ?`, [chapterId]);
                resolve(results.rows.item(0));
            } catch (error) {
                console.error('[DB] getAudioReader error:', error);
                reject(error);
            }
        });
    }

    public async updateChapterAudioPath(chapterId: number, audioPath: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                await this.db.executeSql(
                    `UPDATE ${TABLE_CHAPTERS} SET audio_path = ? WHERE master_chapter_id = ?`,
                    [audioPath, chapterId]
                );
                console.log(`[DB] Updated audio_path for chapter ${chapterId} to ${audioPath}`);
                resolve();
            } catch (error) {
                console.error('[DB] updateChapterAudioPath error:', error);
                reject(error);
            }
        });
    }

    public async updateVersesAudioData(audioVerses: any[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                for (const verse of audioVerses) {
                    const { verseId, startMs, endMs } = verse;
                    console.log('[DB] updateVersesAudioData', verseId, startMs, endMs);

                    if (verseId && startMs !== undefined && endMs !== undefined) {
                        await this.db.executeSql(
                            `UPDATE ${TABLE_VERSES} SET audio_from = ?, audio_to = ? WHERE master_verse_id = ?`,
                            [startMs, endMs, verseId]
                        );
                    }
                }
                console.log(`[DB] Updated audio timings for ${audioVerses.length} verses`);
                resolve();
            } catch (error) {
                console.error('[DB] updateVersesAudioData error:', error);
                reject(error);
            }
        });
    }

    public async getChapterMasterId(chapterId: number): Promise<number | null> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                const [results] = await this.db.executeSql(`SELECT master_chapter_id FROM ${TABLE_CHAPTERS} WHERE id = ?`, [chapterId]);
                console.log('[DB] results getChapterMasterId', chapterId, ' => ', results.rows.item(0).master_chapter_id);
                if (results.rows.length > 0) {
                    resolve(results.rows.item(0).master_chapter_id);
                } else {
                    resolve(null);
                }
            } catch (error) {
                console.error('[DB] getChapterMasterId error:', error);
                reject(error);
            }
        });
    }

    /**
     * Functions for Books TABLE
     * @function getAllBooks
     * @function getBooksById
     * @function getBooksByName
     */

    public async getAllBooks(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                const [results] = await this.db.executeSql(`SELECT * FROM ${TABLE_BOOKS};`);
                const books = [];
                for (let i = 0; i < results.rows.length; i++) {
                    books.push(results.rows.item(i));
                }
                resolve(books);
            } catch (error) {
                console.error('[DB] getBooks error:', error);
                reject(error);
            }
        });
    }

    public async getBooksById(bookId: number): Promise<any> {
        // console.log('[DB]getBooksById', bookId);
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(`SELECT * FROM ${TABLE_BOOKS} WHERE id = ?;`, [bookId]);
                const books = [];
                for (let i = 0; i < results.rows.length; i++) {
                    books.push(results.rows.item(i));
                }
                resolve(books);
            } catch (error) {
                console.error('[DB] getBooksById error:', error);
                reject(error);
            }
        });
    }

    public async getBooksByName(bookName: string): Promise<any> {
        console.log('[DB]getBooksByName', bookName);
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                const [results] = await this.db.executeSql(`SELECT * FROM ${TABLE_BOOKS} WHERE name = ?;`, [bookName]);
                console.log('[DB]results getBooksByName', results.rows.length);
                resolve(results.rows.item(0));
            } catch (error) {
                console.error('[DB] getBooksByName error:', error);
                reject(error);
            }
        });
    }

    /**
     * Functions for Search History TABLE
     * @function getSearchHistory
     * @function addSearchHistory
     * @function clearSearchHistoryById
     * @function clearSearchHistoryAll
     */

    public async getSearchHistory(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(`
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
                resolve(verses);
            } catch (error) {
                console.error('[DB] Error getting search history:', error);
                reject(error);
            }
        });
    }

    public async addSearchHistory(searchQuery: string, verseId: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                const [results] = await this.db.executeSql(`INSERT INTO ${TABLE_SEARCH_HISTORY} (search_query, verse_id) VALUES (?, ?);`, [searchQuery, verseId]);
                console.log(`[DB] Search history inserted: ${searchQuery}, ID: ${results.insertId}`);
                resolve(results);
            } catch (error) {
                console.error('[DB] Error inserting search history:', error);
                reject(error);
            }

        });
    }

    public async clearSearchHistoryById(id: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                // this.db.executeSql(`DELETE FROM ${TABLE_SEARCH_HISTORY} WHERE id = ?;`, [id]).then((results: any) => {
                //     resolve(results);
                // });
                const [results] = await this.db.executeSql(`DELETE FROM ${TABLE_SEARCH_HISTORY} WHERE id = ?;`, [id]);
                console.log('[DB] Search history deleted:', results);
                resolve(results);
            } catch (error) {
                console.error('[DB] Error deleting search history:', error);
                reject(error);
            }
        });
    }

    public async clearSearchHistoryAll(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(`DELETE FROM ${TABLE_SEARCH_HISTORY};`);
                resolve(results);
            } catch (error) {
                console.error('[DB]Error clearing search history:', error);
                reject(error);
            }
        });
    }

    /**
     * Functions for Bookmarks TABLE
     * @function getBookmarks
     * @function addBookmark
     * @function clearBookmarkById
     */

    public async getBookmarks(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                const [results] = await this.db.executeSql(`
                    SELECT 
                        bk.id,
                        bk.note,
                        bk.created_at,
                        b.name as book,
                        c.number as chapter,
                        v.number as verse,
                        v.text_hd,
                        v.text_en,
                        v.text_mm,
                        v.id as verse_id
                    FROM ${TABLE_BOOKMARKS} bk
                    JOIN ${TABLE_VERSES} v ON bk.verse_id = v.id
                    JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
                    JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                    ORDER BY bk.created_at DESC;
                `);
                const verses = [];
                for (let i = 0; i < results.rows.length; i++) {
                    verses.push(results.rows.item(i));
                }
                resolve(verses);
            } catch (error) {
                console.error('[DB] Error getting Bookmarks:', error);
                reject(error);
            }
        });
    }

    public async addBookmark(verseId: any, note: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(`INSERT INTO ${TABLE_BOOKMARKS} (verse_id, note) VALUES (?, ?);`, [verseId, note]);
                console.log(`[DB] Bookmark inserted: ${verseId}, ID: ${results.insertId}`);
                resolve(results);
            } catch (error) {
                console.error('[DB] Error inserting Bookmark:', error);
                reject(error);
            }
        });
    }

    public async clearBookmarkById(id: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(`DELETE FROM ${TABLE_BOOKMARKS} WHERE verse_id = ?;`, [id]);
                resolve(results);
            } catch (error) {
                console.error('[DB] Error deleting Bookmark:', error);
                reject(error);
            }
        });
    }

    /**
     * Functions for highlights TABLE
     * @function getHighlights
     * @function addHighlights
     * @function clearHighlightById
     */

    public async getHighlights(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(`
                    SELECT 
                        hl.id,
                        hl.color,
                        hl.created_at,
                        b.name as book,
                        c.number as chapter,
                        v.number as verse,
                        v.text_hd,
                        v.text_en,
                        v.text_mm,
                        v.id as verse_id
                    FROM ${TABLE_HIGHLIGHTS} hl
                    JOIN ${TABLE_VERSES} v ON hl.verse_id = v.id
                    JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
                    JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                    ORDER BY hl.created_at DESC;
                `);
                const verses = [];
                for (let i = 0; i < results.rows.length; i++) {
                    verses.push(results.rows.item(i));
                }
                resolve(verses);
            } catch (error) {
                console.error('[DB] Error getting Highlights:', error);
                reject(error);
            }
        });
    }

    public async addHighlight(verseId: any, color: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(`INSERT INTO ${TABLE_HIGHLIGHTS} (verse_id, color) VALUES (?, ?);`, [verseId, color]);
                console.log(`[DB] Highlight inserted: ${verseId}, ID: ${results.insertId}`);
                resolve(results);
            } catch (error) {
                console.error('[DB] Error inserting Highlight:', error);
                reject(error);
            }
        });
    }

    public async clearHighlightById(id: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');

            try {
                const [results] = await this.db.executeSql(`DELETE FROM ${TABLE_HIGHLIGHTS} WHERE verse_id = ?;`, [id]);
                resolve(results);
            } catch (error) {
                console.error('[DB] Error deleting Highlight:', error);
                reject(error);
            }
        });
    }

    /**
     * Functions for Notifications TABLE
     * @function getNotifications
     * @function addNotification
     * @function clearNotificationById
     * @function clearNotificationAll
     */

    public async getNotifications(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                const [results] = await this.db.executeSql(`
                    SELECT 
                    v.id AS verse_id,
                    v.number AS verse_number,
                    v.text_hd,
                    v.text_en,
                    v.text_mm,

                    c.id AS chapter_id,
                    c.number AS chapter_number,
                    c.title_hd,
                    c.title_en,
                    c.title_mm,

                    b.id AS book_id,
                    b.number AS book_number,
                    b.name AS book_name,

                    n.planned_at AS date

                    FROM ${TABLE_NOTIFICATIONS} n
                    JOIN ${TABLE_VERSES} v ON n.verse_id = v.id
                    JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
                    JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                    ORDER BY n.planned_at DESC;
                `);
                console.log('[DB]results getNotifications', results.rows.length);
                const notifications = [];
                for (let i = 0; i < results.rows.length; i++) {
                    notifications.push(results.rows.item(i));
                }
                resolve(notifications);
            } catch (error) {
                console.error('[DB] Error getting Notifications:', error);
                reject(error);
            }
        });
    }

    public async getFutureNotifications(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                const [results] = await this.db.executeSql(`SELECT * FROM ${TABLE_NOTIFICATIONS} WHERE planned_at > CURRENT_TIMESTAMP;`);
                const notifications = [];
                for (let i = 0; i < results.rows.length; i++) {
                    notifications.push(results.rows.item(i));
                }
                resolve(notifications);
            }
            catch (error) {
                console.error('[DB] Error getting Future Notifications:', error);
                reject(error);
            }
        });
    }

    public async getTodayNotifications(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            const todayDate = new Date();
            todayDate.setHours(6, 0, 0, 0);
            const tomorrowDate = new Date();
            tomorrowDate.setHours(6, 0, 0, 0);
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            try {
                const [results] = await this.db.executeSql(`
                    SELECT 
                    v.id AS verse_id,
                    v.number AS verse_number,
                    v.text_hd,
                    v.text_en,
                    v.text_mm,

                    c.id AS chapter_id,
                    c.number AS chapter_number,
                    c.title_hd,
                    c.title_en,
                    c.title_mm,

                    b.id AS book_id,
                    b.number AS book_number,
                    b.name AS book_name,

                    n.planned_at AS date

                    FROM ${TABLE_NOTIFICATIONS} n
                    JOIN ${TABLE_VERSES} v ON n.verse_id = v.id
                    JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
                    JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                    WHERE planned_at BETWEEN ? AND ?;`, [todayDate.toISOString(), tomorrowDate.toISOString()]);
                const notifications = [];
                for (let i = 0; i < results.rows.length; i++) {
                    notifications.push(results.rows.item(i));
                }
                resolve(notifications);
            }
            catch (error) {
                console.error('[DB] Error getting Past Notifications:', error);
                reject(error);
            }
        });
    }

    public async addNotification(verseId: any, triggerDate: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                try {
                    this.db = await SQLite.openDatabase({
                        name: DATABASE_NAME,
                        location: 'default',
                    });
                } catch (error) {
                    console.error('[DB] Error initializing database:', error);
                    reject(error);
                    return;
                }
            }

            try {
                const [results] = await this.db.executeSql(`INSERT INTO ${TABLE_NOTIFICATIONS} (verse_id, planned_at) VALUES (?, ?);`, [verseId, triggerDate]);
                console.log(`[DB] Notification inserted: ${verseId}, ID: ${results.insertId}`);
                resolve(results);
            } catch (error) {
                console.error('[DB] Error adding Notification:', error);
                reject(error);
            }
        });
    }

    public async addNotificationBundle(verses: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                try {
                    this.db = await SQLite.openDatabase({
                        name: DATABASE_NAME,
                        location: 'default',
                    });
                } catch (error) {
                    console.error('[DB] Error initializing database:', error);
                    reject(error);
                    return;
                }
            }

            try {
                if (verses.length > 0) {
                    const expected = verses.length;
                    let inserted = 0;
                    for (const verse of verses) {
                        const [results] = await this.db.executeSql(`INSERT INTO ${TABLE_NOTIFICATIONS} (verse_id) VALUES (?);`, [verse.id]);
                        console.log(`[DB] Notification inserted: ${verse.id}, ID: ${results.insertId}`);
                        inserted++;
                    }
                    resolve(inserted === expected);
                } else {
                    resolve(false);
                }
            } catch (error) {
                console.error('[DB] Error adding Notification:', error);
                reject(error);
            }
        });
    }

    public async getRandomVerses(count: number): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                try {
                    this.db = await SQLite.openDatabase({
                        name: DATABASE_NAME,
                        location: 'default',
                    });
                } catch (error) {
                    console.error('[DB] Error initializing database:', error);
                    reject(error);
                    return;
                }
            }
            try {
                const [results] = await this.db.executeSql(
                    `SELECT v.*, b.name as book_name, c.number as chapter_number 
                     FROM ${TABLE_VERSES} v
                     JOIN ${TABLE_CHAPTERS} c ON v.chapter_id = c.id
                     JOIN ${TABLE_BOOKS} b ON c.book_id = b.id
                     ORDER BY RANDOM() LIMIT ?`,
                    [count]
                );
                const verses = [];
                for (let i = 0; i < results.rows.length; i++) {
                    verses.push(results.rows.item(i));
                }
                resolve(verses);
            } catch (error) {
                console.error('[DB] getRandomVerses error:', error);
                reject(error);
            }
        });
    }

    public async getFutureNotificationCount(): Promise<number> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                try {
                    this.db = await SQLite.openDatabase({
                        name: DATABASE_NAME,
                        location: 'default',
                    });
                } catch (error) {
                    console.error('[DB] Error initializing database:', error);
                    reject(error);
                    return;
                }
            }
            try {
                const [results] = await this.db.executeSql(
                    `SELECT COUNT(*) as count FROM ${TABLE_NOTIFICATIONS} WHERE planned_at > CURRENT_TIMESTAMP`
                );
                resolve(results.rows.item(0).count || 0);
            } catch (error) {
                console.error('[DB] getFutureNotificationCount error:', error);
                reject(error);
            }
        });
    }

    public async clearNotificationAll(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) throw new Error('Database not initialized');
            try {
                const [results] = await this.db.executeSql(`DELETE FROM ${TABLE_NOTIFICATIONS};`);
                console.log('[DB] Notifications cleared:', results);
                resolve(results);
            } catch (error) {
                console.error('[DB] Error clearing Notifications:', error);
                reject(error);
            }
        });
    }

    // public async seedAudioMilestone23(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         if (!this.db) throw new Error('Database not initialized');
    //         try {
    //             // update chapters table with audio_path and audio_milestone
    //             // const audio23 = ['00:04', '00:12', '00:23', '00:36', '00:47', '00:58'];
    //             const audio23 = [
    //                 { from: '00:00', to: '00:05' }, // Verse 1
    //                 { from: '00:05', to: '00:13' }, // Verse 2
    //                 { from: '00:13', to: '00:24' }, // Verse 3
    //                 { from: '00:24', to: '00:37' }, // Verse 4
    //                 { from: '00:37', to: '00:48' }, // Verse 5
    //                 { from: '00:48', to: '00:58' }  // Verse 6
    //             ];
    //             // Update audio info for Psalm 23
    //             const [psalmChapterId] = await this.db.executeSql(
    //                 `SELECT * FROM chapters WHERE book_id = ? AND number = ?`,
    //                 [19, 23]
    //             );
    //             console.log('[DB] psalmChapterId', psalmChapterId);
    //             if (psalmChapterId.rows.length > 0) {
    //                 const psalmId = psalmChapterId.rows.item(0).id;
    //                 console.log('[DB] psalmBookId', psalmId);
    //                 // Update chapter audio path
    //                 await this.db.executeSql(
    //                     `UPDATE chapters 
    //                      SET audio_path = ? 
    //                      WHERE id = ?`,
    //                     ['psalms2400.mp3', psalmId]
    //                 );
    //                 console.log('[DB] Updated Psalm 23 chapter audio path', psalmId, 23);

    //                 // Get chapter id for Psalm 23
    //                 const [psalmChapter] = await this.db.executeSql(
    //                     `SELECT * FROM verses 
    //                      WHERE chapter_id = ?`,
    //                     [psalmId]
    //                 );
    //                 const audioVerses = [];
    //                 for (let i = 0; i < psalmChapter.rows.length; i++) {
    //                     audioVerses.push(psalmChapter.rows.item(i));
    //                 }
    //                 console.log('[DB] psalmChapter', audioVerses);
    //                 let pindex = 0;
    //                 if (audioVerses.length > 0) {
    //                     for (const verse of audioVerses) {
    //                         if (pindex >= audio23.length) break;
    //                         const { id, number, text_hd, text_en, text_mm } = verse;
    //                         const audio_from = audio23[pindex].from;
    //                         const audio_to = audio23[pindex].to;
    //                         pindex++;
    //                         const res = await this.db.executeSql(
    //                             `UPDATE verses 
    //                              SET audio_from = ?, audio_to = ?
    //                              WHERE id = ?`,
    //                             [audio_from, audio_to, id]
    //                         );
    //                         // console.log('[DB] seed audio', pindex, id, res);
    //                     }
    //                     // console.log('[DB] Updated Psalm 23 verse audio milestones');
    //                 }
    //                 resolve(true);
    //             } else {
    //                 resolve(false);
    //             }
    //         } catch (error) {
    //             console.error('[DB] Error seeding Audio Milestone:', error);
    //             reject(error);
    //         }
    //     });
    // }

    // public async seedAudioMilestone24(): Promise<any> {
    //     return new Promise(async (resolve, reject) => {
    //         if (!this.db) throw new Error('Database not initialized');
    //         try {
    //             // update chapters table with audio_path and audio_milestone
    //             // const audio23 = ['00:04', '00:12', '00:23', '00:36', '00:47', '00:58'];
    //             const audio24 = [
    //                 { from: '00:00', to: '00:11' }, // Verse 1
    //                 { from: '00:11', to: '00:21' }, // Verse 2
    //                 { from: '00:21', to: '00:30' }, // Verse 3
    //                 { from: '00:30', to: '00:38' }, // Verse 4
    //                 { from: '00:38', to: '00:50' }, // Verse 5
    //                 { from: '00:50', to: '00:57' }, // Verse 6
    //                 { from: '00:57', to: '01:07' }, // Verse 7
    //                 { from: '01:07', to: '01:17' }, // Verse 8
    //                 { from: '01:18', to: '01:26' }, // Verse 9
    //                 { from: '01:27', to: '01:33' }  // Verse 10
    //             ];
    //             // Update audio info for Psalm 23
    //             const [psalmChapterId] = await this.db.executeSql(
    //                 `SELECT * FROM chapters WHERE book_id = ? AND number = ?`,
    //                 [19, 24]
    //             );
    //             console.log('[DB] psalmChapterId', psalmChapterId);
    //             if (psalmChapterId.rows.length > 0) {
    //                 const psalmId = psalmChapterId.rows.item(0).id;
    //                 console.log('[DB] psalmBookId', psalmId);
    //                 // Update chapter audio path
    //                 await this.db.executeSql(
    //                     `UPDATE chapters 
    //                      SET audio_path = ? 
    //                      WHERE id = ?`,
    //                     ['psalms2400.mp3', psalmId]
    //                 );
    //                 console.log('[DB] Updated Psalm 24 chapter audio path', psalmId, 24);

    //                 // Get chapter id for Psalm 23
    //                 const [psalmChapter] = await this.db.executeSql(
    //                     `SELECT * FROM verses 
    //                      WHERE chapter_id = ?`,
    //                     [psalmId]
    //                 );
    //                 const audioVerses = [];
    //                 for (let i = 0; i < psalmChapter.rows.length; i++) {
    //                     audioVerses.push(psalmChapter.rows.item(i));
    //                 }
    //                 console.log('[DB] psalmChapter', audioVerses);
    //                 let pindex = 0;
    //                 if (audioVerses.length > 0) {
    //                     for (const verse of audioVerses) {
    //                         if (pindex >= audio24.length) break;
    //                         const { id, number, text_hd, text_en, text_mm } = verse;
    //                         const audio_from = audio24[pindex].from;
    //                         const audio_to = audio24[pindex].to;
    //                         pindex++;
    //                         const res = await this.db.executeSql(
    //                             `UPDATE verses 
    //                              SET audio_from = ?, audio_to = ?
    //                              WHERE id = ?`,
    //                             [audio_from, audio_to, id]
    //                         );
    //                         // console.log('[DB] seed audio', pindex, id, res);
    //                     }
    //                     console.log('[DB] Updated Psalm 24 verse audio milestones');
    //                 }
    //                 resolve(true);
    //             } else {
    //                 resolve(false);
    //             }
    //         } catch (error) {
    //             console.error('[DB] Error seeding Audio Milestone:', error);
    //             reject(error);
    //         }
    //     });
    // }

    public async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
            console.log('[DB] Closed');
        }
    }
}
