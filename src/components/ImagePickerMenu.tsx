import React from 'react';
import { Alert, ActionSheetIOS, Platform, Pressable, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface ImagePickerMenuProps {
  onSelectPicture: (uri: string) => void
}

export const ImagePickerMenu: React.FC<ImagePickerMenuProps> = ({ 
  onSelectPicture 
  }) => {
  const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled) {
      onSelectPicture(result.assets[0].uri);    
    }
  };

  const openCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return Alert.alert('Permission Denied', 'Camera access is required.');
    
    const result = await ImagePicker.launchCameraAsync({ 
        allowsEditing: true, 
        quality: 0.8,
        aspect: [1,1]
      });
    handleImageResult(result);
  };

  const openLibrary = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert('Permission Denied', 'Media Library access is required.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ 'images' ],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    handleImageResult(result);
  };

  const presentPickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) openCamera();
          if (buttonIndex === 2) openLibrary();
        }
      );
    } else {
      // For Android, create a quick Alert dialog or use a custom BottomSheet component
      Alert.alert('Select Photo', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: openCamera },
        { text: 'Choose from Library', onPress: openLibrary },
      ]);
    }
  };

    return  <Pressable onPress={presentPickerOptions} style={styles.pickPhotoBtn}>
              <Ionicons name="cloud-upload-outline" size={16} color="#92400E" />
              <Text style={styles.pickPhotoBtnText}>Choose New Picture</Text>
            </Pressable>
};

const styles = StyleSheet.create({
  pickPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    paddingVertical: 10,
  },
  pickPhotoBtnText: { fontSize: 12, fontWeight: '700', color: '#92400E' }
});