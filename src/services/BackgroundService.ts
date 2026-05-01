// //services/BackgroundService.ts
// import BackgroundService from 'react-native-background-actions';

// const sleep = (time: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), time));

// // Task to run in background
// const veryIntensiveTask = async (taskData: any) => {
//     while (BackgroundService.isRunning()) {
//         console.log('⏰ Background task is running', new Date().toLocaleString());

//         // Perform your logic here (API calls, local storage sync, etc.)

//         await sleep(10 * 1000); // 10 seconds
//     }
// };

// const options = {
//     taskName: 'HourlyTask',
//     taskTitle: 'Background Task Running',
//     taskDesc: 'Running every 1 hour...',
//     taskIcon: {
//         name: 'ic_launcher',
//         type: 'mipmap',
//     },
//     color: '#ff00ff',
//     linkingURI: 'yourapp://home', // optional
//     parameters: {
//         delay: 1000,
//     },
// };

// export default class BackgroundTaskService {
//     static async init() {
//         const isRunning = await BackgroundService.isRunning();
//         console.log(`Background task is ${isRunning ? 'already running' : 'not running'}`);

//         if (!isRunning) {
//             await BackgroundService.start(veryIntensiveTask, options);
//         }
//     }

//     static async stop() {
//         if (await BackgroundService.isRunning()) {
//             await BackgroundService.stop();
//             console.log('Background task stopped');
//         }
//     }

//     static async isRunning(): Promise<boolean> {
//         return await BackgroundService.isRunning();
//     }
// }