import { Platform, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { getLatestVersion } from './ApiService';

const STORE_URLS = {
    android: 'https://play.google.com/store/apps/details?id=com.gathengpu.dlo',
    ios: 'https://apps.apple.com/app/id6476569111', // Placeholder or real ID if found
};

export interface UpdateInfo {
    isAvailable: boolean;
    latestVersion?: string;
    latestBuild?: string | number;
    storeUrl?: string;
}

const UpdateService = {
    checkForUpdates: async (): Promise<UpdateInfo> => {
        try {
            const platform = Platform.OS === 'android' ? 'Android' : 'iOS';
            const currentBuild = DeviceInfo.getBuildNumber();

            const latestAppVersion = await getLatestVersion(platform);
            console.log('latestAppVersion', latestAppVersion.code, currentBuild);
            const isAvailable = latestAppVersion.code > currentBuild;
            const storeUrl = Platform.OS === 'android' ? STORE_URLS.android : STORE_URLS.ios;

            return {
                isAvailable,
                latestVersion: latestAppVersion.version,
                latestBuild: latestAppVersion.code,
                storeUrl: latestAppVersion.url || storeUrl,
            };
        } catch (error) {
            console.error('[UpdateService] Error checking for updates:', error);
            throw error;
        }
    },

    openStore: async (url?: string) => {
        const storeUrl = url || (Platform.OS === 'android' ? STORE_URLS.android : STORE_URLS.ios);
        try {
            const supported = await Linking.canOpenURL(storeUrl);
            if (supported) {
                await Linking.openURL(storeUrl);
            } else {
                console.warn('[UpdateService] Cannot open URL:', storeUrl);
            }
        } catch (error) {
            console.error('[UpdateService] Error opening store:', error);
        }
    },

    checkForDatabaseUpdates: async (currentVersion: string): Promise<UpdateInfo> => {
        try {
            const latestDBVersion = await getLatestVersion('Database');
            if (currentVersion === '') return { isAvailable: true, latestBuild: latestDBVersion.code };
            console.log('latestDBVersion', latestDBVersion.code, currentVersion);
            const isAvailable = latestDBVersion.code > parseInt(currentVersion, 10);
            console.log('isAvailable', isAvailable);
            return {
                isAvailable,
                latestBuild: latestDBVersion.code,
            };
        } catch (error) {
            console.error('[UpdateService] Error checking for database updates:', error);
            throw error;
        }
    }
};

export default UpdateService;
