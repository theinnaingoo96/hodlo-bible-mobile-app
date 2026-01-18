import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import PushNotification from 'react-native-push-notification';
import DeviceInfo from 'react-native-device-info';

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
      case 'notifications':
        // iOS notifications are checked via PushNotification
        return new Promise((resolve) => {
          try {
            PushNotification.checkPermissions((permissions: { alert?: boolean; badge?: boolean; sound?: boolean }) => {
              resolve(permissions.alert === true || permissions.badge === true || permissions.sound === true);
            });
          } catch (error) {
            console.error('Error checking iOS notification permissions:', error);
            resolve(false);
          }
        });

      case 'storage':
      case 'media_images':
      case 'media_audio':
        // iOS media permissions are typically granted automatically when accessing media
        // For bundled assets, no permission is needed
        // For user's photo library, permission is requested automatically by the system
        return true; // Assume granted for app-bundled media

      default:
        return false;
    }
  }

  /**
   * Check Android permissions
   */
  private async checkAndroidPermission(permission: PermissionType): Promise<boolean> {
    const androidVersion = DeviceInfo.getSystemVersion();
    const apiLevel = parseInt(androidVersion.split('.')[0]) || 0;

    switch (permission) {
      case 'notifications':
        if (apiLevel >= 33) {
          return await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
        }
        return true; // Not required for Android < 13

      case 'storage':
        if (apiLevel >= 33) {
          // Android 13+ uses granular media permissions
          return (
            await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            ) &&
            await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
            )
          );
        } else {
          return await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
        }

      case 'media_images':
        if (apiLevel >= 33) {
          return await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
        } else {
          return await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
        }

      case 'media_audio':
        if (apiLevel >= 33) {
          return await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
          );
        } else {
          return await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
        }

      default:
        return false;
    }
  }

  /**
   * Request a single permission
   */
  async requestPermission(permission: PermissionType): Promise<PermissionResult> {
    try {
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
      case 'notifications':
        return new Promise((resolve) => {
          try {
            PushNotification.requestPermissions(['alert', 'badge', 'sound']).then((permissions: { alert?: boolean; badge?: boolean; sound?: boolean }) => {
              const granted = permissions.alert === true || permissions.badge === true || permissions.sound === true;
              resolve({
                granted,
                message: granted ? undefined : 'Notification permission was denied. Please enable it in Settings.',
              });
            }).catch((error) => {
              console.error('Error requesting iOS notification permissions:', error);
              resolve({
                granted: false,
                message: 'Failed to request notification permission.',
              });
            });
          } catch (error) {
            console.error('Error requesting iOS notification permissions:', error);
            resolve({
              granted: false,
              message: 'Failed to request notification permission.',
            });
          }
        });

      case 'storage':
      case 'media_images':
      case 'media_audio':
        // iOS media permissions are requested automatically by the system when accessing media
        // For app-bundled assets, no permission is needed
        return { granted: true };

      default:
        return { granted: false, message: 'Unknown permission type' };
    }
  }

  /**
   * Request Android permissions
   */
  private async requestAndroidPermission(permission: PermissionType): Promise<PermissionResult> {
    const androidVersion = DeviceInfo.getSystemVersion();
    const apiLevel = parseInt(androidVersion.split('.')[0]) || 0;

    let permissionString: (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS];
    let title: string;
    let message: string;

    switch (permission) {
      case 'notifications':
        if (apiLevel < 33) {
          return { granted: true }; // Not required for Android < 13
        }
        permissionString = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
        title = 'Notification Permission';
        message = 'This app needs notification permission to send you daily verses and reminders.';
        break;

      case 'storage':
        if (apiLevel >= 33) {
          // Request both media permissions for Android 13+
          const imagesResult = await this.requestPermission('media_images');
          const audioResult = await this.requestPermission('media_audio');
          return {
            granted: imagesResult.granted && audioResult.granted,
            message: imagesResult.granted && audioResult.granted 
              ? undefined 
              : 'Storage permissions are required to access media files.'
          };
        } else {
          permissionString = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
          title = 'Storage Permission';
          message = 'This app needs storage permission to access audio files and download content.';
        }
        break;

      case 'media_images':
        if (apiLevel >= 33) {
          permissionString = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
          title = 'Photo Permission';
          message = 'This app needs access to your photos to display images.';
        } else {
          permissionString = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
          title = 'Storage Permission';
          message = 'This app needs storage permission to access images.';
        }
        break;

      case 'media_audio':
        if (apiLevel >= 33) {
          permissionString = PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO;
          title = 'Audio Permission';
          message = 'This app needs access to audio files to play Bible audio.';
        } else {
          permissionString = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
          title = 'Storage Permission';
          message = 'This app needs storage permission to access audio files.';
        }
        break;

      default:
        return { granted: false, message: 'Unknown permission type' };
    }

    // Check if already granted
    const isGranted = await this.checkPermission(permission);
    if (isGranted) {
      return { granted: true };
    }

    // Request permission
    const result = await PermissionsAndroid.request(permissionString, {
      title,
      message,
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return { granted: true };
    } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return {
        granted: false,
        message: `${title} was denied. Please enable it in app settings.`,
      };
    } else {
      return {
        granted: false,
        message: `${title} was denied.`,
      };
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
      'media_audio', // For audio playback
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
