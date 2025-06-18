export interface BibleVerse {
    id?: number;
    book: string;
    chapter: number;
    verse: number;
    text_hd: string
    text_en: string;
    text_mm: string;
    bookmark: boolean;
    bookmarkedAt?: string;
    bookmarkedColor?: string;
}