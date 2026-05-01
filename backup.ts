
// const result: any = await this.db.executeSql(
//     `INSERT INTO chapters (
//         book_id, number, title_hd, title_en, title_mm, master_chapter_id
//     )
//     VALUES (?, ?, ?, ?, ?, ?)
//     ON CONFLICT(master_chapter_id)
//     DO UPDATE SET
//         title_hd = excluded.title_hd,
//         title_en = excluded.title_en,
//         title_mm = excluded.title_mm`,
//     [bookId, number, textHd, textEn, textMy, id]
// );
// await this.db.executeSql(
//     `INSERT INTO verses (
//         chapter_id, number, text_hd, text_en, text_mm, audio_from, audio_to, master_verse_id
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//     ON CONFLICT(master_verse_id)
//     DO UPDATE SET
//         text_hd = excluded.text_hd,
//         text_en = excluded.text_en,
//         text_mm = excluded.text_mm,
//         audio_from = excluded.audio_from,
//         audio_to = excluded.audio_to`,
//     [chapterId, number, textHd, textEn, textMy, "", "", id]
// );

/////////////////////////////////23Apr2026/////////////////////////////////////////

// for (const book of bookData) {
//     const { id, textEn, textMy, textHd, orderNumber } = book;
//     const testament = book.testament == 'Old' ? 'OT' : 'NT';
//     const chapterCount = 0;
//     await this.db.executeSql('INSERT INTO books (id, name, nameMy, nameHd, number, count, testament) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, textEn, textMy, textHd, orderNumber, chapterCount, testament]);
//     console.log('[DB]inserted book', id);

//     const bookId = id;
//     const chapterData = await getChapters(id);
//     chapterCountForProgress += chapterData.length;

//     for (const chapter of chapterData) {
//         const { id, bookId, number, textHd, textEn, textMy } = chapter;
//         await this.db.executeSql(
//             `INSERT OR REPLACE INTO chapters (
//                                 book_id, number, title_hd, title_en, title_mm, master_chapter_id
//                             ) VALUES (?, ?, ?, ?, ?, ?)`,
//             [bookId, number, textHd, textEn, textMy, id]
//         )
//         console.log('[DB]inserted chapter', id);

//         const chapterId = id;
//         const verseData = await getVerses(id);
//         for (const verse of verseData) {
//             const { id, number, textHd, textEn, textMy } = verse;
//             await this.db.executeSql(
//                 `INSERT OR REPLACE INTO verses (
//                                     chapter_id, 
//                                     number, 
//                                     text_hd, 
//                                     text_en, 
//                                     text_mm, 
//                                     audio_from, 
//                                     audio_to, 
//                                     master_verse_id
//                                 )
//                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//                 [chapterId, number, textHd, textEn, textMy, "", "", id]
//             );
//             // console.log('[DB]inserted verse', id);
//         }
//     }
//     await this.db.executeSql(
//         `UPDATE books SET count = ? WHERE id = ?`,
//         [chapterData.length, bookId]
//     )
//     dispatch(setDownloadProgress(chapterCountForProgress / constants.bibleTotalChapters));
// }

//////////////////////////////////////////////////////////////////////////
