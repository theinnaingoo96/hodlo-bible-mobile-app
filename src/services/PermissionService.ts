import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

export interface PermissionResult {
  granted: boolean;
  message?: string;
}

export type PermissionType =
  | 'notifications'
  | 'storage'
  | 'media_images'
  | 'media_audio';

class PermissionService {
  /**
   * Check if a permission is already granted
   */
  async checkPermission(permission: PermissionType): Promise<boolean> {
    try {
      if (permission === 'notifications') {
        const settings = await notifee.getNotificationSettings();
        return (
          settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
          settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
        );
      }

      if (Platform.OS === 'ios') {
        return await this.checkIOSPermission(permission);
      } else {
        return await this.checkAndroidPermission(permission);
      }
    } catch (error) {
      console.error(`Error checking permission ${permission}:`, error);
      return false;
    }
  }

  /**
   * Check iOS permissions
   */
  private async checkIOSPermission(permission: PermissionType): Promise<boolean> {
    switch (permission) {
      case 'storage':
      case 'media_images':
      case 'media_audio':
        return true; 
      default:
        return false;
    }
  }

  /**
   * Check Android permissions
   */
  private async checkAndroidPermission(permission: PermissionType): Promise<boolean> {
    const apiLevel = Platform.OS === 'android' ? (Platform.Version as number) : 0;

    switch (permission) {
      case 'notifications':
        if (apiLevel < 33) {
          return true;
        }
        return await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

      case 'storage':
      case 'media_images':
      case 'media_audio':
        // System photo picker and internal sandboxed storage do not require runtime permissions
        return true;

      default:
        return false;
    }
  }

  /**
   * Request a single permission
   */
  async requestPermission(permission: PermissionType): Promise<PermissionResult> {
    try {
      if (permission === 'notifications') {
        const settings = await notifee.requestPermission();
        const granted =
          settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
          settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
        
        return {
          granted,
          message: granted ? undefined : 'Notification permission was denied. Please enable it in Settings.',
        };
      }

      if (Platform.OS === 'ios') {
        return await this.requestIOSPermission(permission);
      } else {
        return await this.requestAndroidPermission(permission);
      }
    } catch (error: any) {
      console.error(`Error requesting permission ${permission}:`, error);
      return {
        granted: false,
        message: `Failed to request permission: ${error.message}`,
      };
    }
  }

  /**
   * Request iOS permissions
   */
  private async requestIOSPermission(permission: PermissionType): Promise<PermissionResult> {
    switch (permission) {
      case 'storage':
      case 'media_images':
      case 'media_audio':
        return { granted: true };
      default:
        return { granted: false, message: 'Unknown permission type' };
    }
  }

  /**
   * Request Android permissions
   */
  private async requestAndroidPermission(permission: PermissionType): Promise<PermissionResult> {
    const apiLevel = Platform.OS === 'android' ? (Platform.Version as number) : 0;

    switch (permission) {
      case 'notifications': {
        if (apiLevel < 33) {
          return { granted: true }; // Not required for Android < 13
        }

        const isGranted = await this.checkPermission(permission);
        if (isGranted) {
          return { granted: true };
        }

        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs notification permission to send you daily verses and reminders.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          return { granted: true };
        } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          return {
            granted: false,
            message: 'Notification permission was denied. Please enable it in app settings.',
          };
        } else {
          return {
            granted: false,
            message: 'Notification permission was denied.',
          };
        }
      }

      case 'storage':
      case 'media_images':
      case 'media_audio':
        // System photo picker and internal sandboxed storage do not require runtime permissions
        return { granted: true };

      default:
        return { granted: false, message: 'Unknown permission type' };
    }
  }

  /**
   * Request multiple permissions at once
   */
  async requestMultiplePermissions(
    permissions: PermissionType[]
  ): Promise<Record<PermissionType, PermissionResult>> {
    const results: Record<string, PermissionResult> = {};

    for (const permission of permissions) {
      results[permission] = await this.requestPermission(permission);
    }

    return results as Record<PermissionType, PermissionResult>;
  }

  /**
   * Request all essential permissions for the app
   */
  async requestEssentialPermissions(): Promise<Record<PermissionType, PermissionResult>> {
    const permissions: PermissionType[] = [
      'notifications',
    ];

    return await this.requestMultiplePermissions(permissions);
  }

  /**
   * Open app settings if permission was denied permanently
   */
  async openAppSettings(): Promise<void> {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Error opening app settings:', error);
      const platformText = Platform.OS === 'ios'
        ? 'Settings > Ho Dlo Bible'
        : 'Settings > Apps > Ho Dlo Bible';
      Alert.alert(
        'Settings',
        `Please go to ${platformText} and enable the required permissions.`,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Show alert for denied permission with option to open settings
   */
  showPermissionDeniedAlert(
    permission: PermissionType,
    onOpenSettings?: () => void
  ): void {
    const permissionNames: Record<PermissionType, string> = {
      notifications: 'Notification',
      storage: 'Storage',
      media_images: 'Photo',
      media_audio: 'Audio',
    };

    Alert.alert(
      `${permissionNames[permission]} Permission Required`,
      `This app needs ${permissionNames[permission].toLowerCase()} permission to function properly. Please enable it in app settings.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            if (onOpenSettings) {
              onOpenSettings();
            } else {
              this.openAppSettings();
            }
          },
        },
      ]
    );
  }

  /**
   * Check and request permission with user-friendly flow
   */
  async checkAndRequestPermission(
    permission: PermissionType,
    showAlertIfDenied: boolean = true
  ): Promise<boolean> {
    const isGranted = await this.checkPermission(permission);

    if (isGranted) {
      return true;
    }

    const result = await this.requestPermission(permission);

    if (!result.granted && showAlertIfDenied) {
      this.showPermissionDeniedAlert(permission);
    }

    return result.granted;
  }
}

// Export singleton instance
export const permissionService = new PermissionService();
export default permissionService;
