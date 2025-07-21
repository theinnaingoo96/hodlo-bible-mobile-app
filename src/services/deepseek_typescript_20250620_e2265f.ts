// services/dailyVerseScheduler.ts
// import { AppState, Platform } from 'react-native';
// import PushNotification from 'react-native-push-notification';
// import notifee from '@notifee/react-native';
// import { getRandomVerse, saveVerseToNotifications } from './DatabaseService';
// import { Verse } from '../types/verses';

// class DailyVerseScheduler {
//   private channelId = 'daily-verse-channel';
//   private notificationId = 'daily-verse-notification';

//   constructor() {
//     this.setupNotificationChannel();
//     this.setupNotificationListeners();
//     AppState.addEventListener('change', this.handleAppStateChange);
//   }

//   private setupNotificationChannel = async () => {
//     if (Platform.OS === 'android') {
//       await notifee.createChannel({
//         id: this.channelId,
//         name: 'Daily Verse Notifications',
//         sound: 'default',
//         importance: 4, // High importance
//       });
//     }
//   };

//   private setupNotificationListeners = () => {
//     PushNotification.configure({
//       onNotification: (notification: any) => {
//         if (notification.userInteraction) {
//           this.handleNotificationTap(notification);
//         }
//       },
//     });
//   };

//   private handleAppStateChange = (state: string) => {
//     if (state === 'active') {
//       this.checkForScheduledVerse();
//     }
//   };

//   public scheduleDailyVerse = async () => {
//     // Cancel any existing notifications
//     PushNotification.cancelLocalNotifications({ id: this.notificationId });

//     // Schedule for next midnight
//     const nextMidnight = this.getNextMidnight();
    
//     PushNotification.localNotificationSchedule({
//       id: this.notificationId,
//       channelId: this.channelId,
//       title: 'Your Daily Verse',
//       message: 'Tap to view your verse of the day',
//       date: nextMidnight,
//       repeatType: 'day',
//       allowWhileIdle: true,
//       userInfo: { type: 'daily-verse' },
//     });

//     console.log('Daily verse scheduled for', nextMidnight.toLocaleString());
//   };

//   private getNextMidnight = (): Date => {
//     const now = new Date();
//     const nextMidnight = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate() + 1,
//       0, 0, 0
//     );
//     return nextMidnight;
//   };

//   public triggerDailyVerseTask = async () => {
//     try {
//       // 1. Fetch random verse
//       const randomVerse: any = await getRandomVerse();
      
//       // 2. Save to notifications table
//       await saveVerseToNotifications(randomVerse);
      
//       // 3. Show in-app notification
//       this.displayInAppNotification(randomVerse);
      
//       console.log('Daily verse processed:', randomVerse.content);
//     } catch (error) {
//       console.error('Daily verse task failed:', error);
//     }
//   };

//   private displayInAppNotification = (verse: Verse) => {
//     // This would typically use context/state management to trigger UI
//     // For demonstration, we'll emit an event that components can listen to
//     // const event = new CustomEvent('daily-verse', { detail: verse });
//     // window.dispatchEvent(event);
    
//     // For immediate display while app is active
//     if (AppState.currentState === 'active') {
//       notifee.displayNotification({
//         title: 'Verse of the Day',
//         body: verse.content,
//         android: { channelId: this.channelId },
//         ios: { sound: 'default' },
//       });
//     }
//   };

//   private handleNotificationTap = (notification: any) => {
//     if (notification.userInfo.type === 'daily-verse') {
//       this.checkForScheduledVerse();
//     }
//   };

//   public checkForScheduledVerse = async () => {
//     // Check if we have a verse for today
//     const today = new Date().toISOString().split('T')[0];
//     const hasVerseToday = await this.checkVerseExistsForDate(today);
    
//     if (!hasVerseToday) {
//       this.triggerDailyVerseTask();
//     }
//   };

//   private checkVerseExistsForDate = async (date: string): Promise<boolean> => {
//     // Implement your database check here
//     // Example: return database.query('SELECT...')
//     return false;
//   };
// }

// export default new DailyVerseScheduler();