import PushNotification from 'react-native-push-notification';
import DatabaseService from './DatabaseService';

export const scheduleDailyNotificationold = () => {
    // Cancel all to avoid duplicates
    // PushNotification.cancelAllLocalNotifications();

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(6);
    scheduledTime.setMinutes(0);
    scheduledTime.setSeconds(0);

    // If 6 AM has already passed today, schedule for tomorrow
    if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // PushNotification.localNotificationSchedule({
    //     channelId: 'ho-dlo-channel',
    //     title: 'Good Morning!',
    //     message: 'Here’s your daily 6 AM notification ☀️',
    //     date: scheduledTime,
    //     // date: new Date(Date.now() + 60 * 1000), // First after 1 min (for test)
    //     repeatType: 'day', // Repeat every day
    // });

    console.log(`[Scheduled] Daily notification for: ${scheduledTime}`);
};

const getNext6AM = (i: number) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(6, 0, 0, 0); // Set to 6:00:00 AM
    return date;
};

export const scheduleNotification = (randomVerses: any) => {
    // Cancel all to avoid duplicates
    // PushNotification.cancelAllLocalNotifications();

    let startOffset = 0;

    // Check if today's 6AM has passed
    const now = new Date();
    const today6AM = new Date();
    today6AM.setHours(6, 0, 0, 0);

    if (now >= today6AM) {
        startOffset = 1; // Start from tomorrow
    }

    for (let i = 0; i < 7; i++) {
        const dayOffset = i + startOffset;
        const verse = randomVerses[i];
        const triggerDate = getNext6AM(dayOffset);
        const notificationTitle = verse.book_name + ' ' + verse.chapter_number + ':' + verse.verse_number;
        PushNotification.localNotificationSchedule({
            channelId: 'ho-dlo-channel',
            title: notificationTitle,
            message: verse.text_hd,
            date: triggerDate,
            allowWhileIdle: false,
        });
        console.log('triggerDate', triggerDate.toISOString());
        DatabaseService.getInstance().addNotification(verse.verse_id, triggerDate.toISOString());
        // console.log(`[Scheduled] ${i + 1} Verse: ${verse}`);
        console.log(`[Scheduled] ${i + 1} Date: ${triggerDate}`);
        console.log(`[Scheduled] ${i + 1} Title: ${notificationTitle}`);
        console.log(`[Scheduled] ${i + 1} Message: ${verse.text_hd}`);
    }
}
