
export interface CurrentRead {
    bookName: string;
    bookId: number;
    chapterId: number;
    chapterNumber: number;
    verseId: number;
    verseNumber: number;
    maxChapter: number;
    progress: number;
}

export interface ReaderSetting {
    fontSize: number;
    fontFamily: number;
    theme: number;
}