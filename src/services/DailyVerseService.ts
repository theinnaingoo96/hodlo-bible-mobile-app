import PushNotification from 'react-native-push-notification';
import DatabaseService from './DatabaseService';
import { store } from '../store/store';

class DailyVerseService {
    private static instance: DailyVerseService;
    private readonly NOTIFICATION_TIME = 6; // 6 AM

    private constructor() { }

    public static getInstance(): DailyVerseService {
        if (!DailyVerseService.instance) {
            DailyVerseService.instance = new DailyVerseService();
        }
        return DailyVerseService.instance;
    }

    public async checkAndScheduleNotifications(): Promise<void> {
        try {
            const db = DatabaseService.getInstance();
            const futureCount = await db.getFutureNotificationCount();

            console.log(`[Notification Service] Current future queue: ${futureCount} days`);

            if (futureCount < 3) {
                console.log('[Notification Service] Queue low. Scheduling more verses...');
                const randomVerses = await db.getRandomVerses(7);
                if (randomVerses && randomVerses.length > 0) {
                    await this.scheduleNewBatch(randomVerses, futureCount);
                }
            }
        } catch (error) {
            console.error('[Notification Service] Error in checkAndScheduleNotifications:', error);
        }
    }

    private async scheduleNewBatch(verses: any[], existingCount: number): Promise<void> {
        const state = store.getState();
        const language = state.device.language || 'hd';

        let startOffset = existingCount;

        const now = new Date();
        if (now.getHours() >= this.NOTIFICATION_TIME) {
            if (startOffset === 0) startOffset = 1;
        }

        for (let i = 0; i < verses.length; i++) {
            const dayOffset = i + startOffset;
            const verse = verses[i];
            const triggerDate = this.getScheduledDate(dayOffset);

            const title = `${verse.book_name} ${verse.chapter_number}:${verse.verse_number}`;
            let message = verse.text_hd;

            if (language === 'mm' && verse.text_mm) message = verse.text_mm;
            if (language === 'en' && verse.text_en) message = verse.text_en;

            PushNotification.localNotificationSchedule({
                channelId: 'ho-dlo-channel',
                title: title,
                message: message,
                date: triggerDate,
                allowWhileIdle: true,
                ignoreInForeground: false,
                smallIcon: 'ic_notification',
            });
            await DatabaseService.getInstance().addNotification(verse.id, triggerDate.toISOString());

            console.log(`[Notification Service] Scheduled day ${dayOffset}: ${title} at ${triggerDate.toISOString()}`);
        }
    }

    private getScheduledDate(daysFromNow: number): Date {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        date.setHours(this.NOTIFICATION_TIME, 0, 0, 0);
        return date;
    }

    public async clearAll(): Promise<void> {
        PushNotification.cancelAllLocalNotifications();
        await DatabaseService.getInstance().clearNotificationAll();
        console.log('[Notification Service] All notifications cleared');
    }
}

export default DailyVerseService.getInstance();
