import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import permissionService, { PermissionType, PermissionResult } from '../services/PermissionService';

export interface UsePermissionsReturn {
  // Permission states
  notifications: boolean;
  storage: boolean;
  mediaImages: boolean;
  mediaAudio: boolean;

  // Check methods
  checkPermission: (permission: PermissionType) => Promise<boolean>;
  checkAllPermissions: () => Promise<void>;

  // Request methods
  requestPermission: (permission: PermissionType) => Promise<PermissionResult>;
  requestEssentialPermissions: () => Promise<Record<PermissionType, PermissionResult>>;

  // Utility methods
  openAppSettings: () => Promise<void>;
  showPermissionDeniedAlert: (permission: PermissionType) => void;
}

export function usePermissions(): UsePermissionsReturn {
  const [notifications, setNotifications] = useState(false);
  const [storage, setStorage] = useState(false);
  const [mediaImages, setMediaImages] = useState(false);
  const [mediaAudio, setMediaAudio] = useState(false);

  // Check all permissions on mount
  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkPermission = useCallback(async (permission: PermissionType): Promise<boolean> => {
    const granted = await permissionService.checkPermission(permission);
    
    // Update state based on permission type
    switch (permission) {
      case 'notifications':
        setNotifications(granted);
        break;
      case 'storage':
        setStorage(granted);
        break;
      case 'media_images':
        setMediaImages(granted);
        break;
      case 'media_audio':
        setMediaAudio(granted);
        break;
    }
    
    return granted;
  }, []);

  const checkAllPermissions = useCallback(async () => {
    const [
      notificationsGranted,
      storageGranted,
      mediaImagesGranted,
      mediaAudioGranted,
    ] = await Promise.all([
      permissionService.checkPermission('notifications'),
      permissionService.checkPermission('storage'),
      permissionService.checkPermission('media_images'),
      permissionService.checkPermission('media_audio'),
    ]);

    setNotifications(notificationsGranted);
    setStorage(storageGranted);
    setMediaImages(mediaImagesGranted);
    setMediaAudio(mediaAudioGranted);
  }, []);

  const requestPermission = useCallback(async (permission: PermissionType): Promise<PermissionResult> => {
    const result = await permissionService.requestPermission(permission);
    
    // Update state after request
    if (result.granted) {
      await checkPermission(permission);
    }
    
    return result;
  }, [checkPermission]);

  const requestEssentialPermissions = useCallback(async (): Promise<Record<PermissionType, PermissionResult>> => {
    const results = await permissionService.requestEssentialPermissions();
    
    // Update all permission states after request
    await checkAllPermissions();
    
    return results;
  }, [checkAllPermissions]);

  const openAppSettings = useCallback(async () => {
    await permissionService.openAppSettings();
  }, []);

  const showPermissionDeniedAlert = useCallback((permission: PermissionType) => {
    permissionService.showPermissionDeniedAlert(permission, openAppSettings);
  }, [openAppSettings]);

  return {
    // States
    notifications,
    storage,
    mediaImages,
    mediaAudio,

    // Methods
    checkPermission,
    checkAllPermissions,
    requestPermission,
    requestEssentialPermissions,
    openAppSettings,
    showPermissionDeniedAlert,
  };
}

