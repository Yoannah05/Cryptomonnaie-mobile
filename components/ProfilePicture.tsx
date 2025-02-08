import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Image, ImageSourcePropType } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/app/services/cloudinaryService';
import MyButton from './MyButton';

interface ProfilePictureProps {
  currentPhotoUrl: string | null;
  onPhotoUpdate: (newPhotoUrl: string) => void;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ currentPhotoUrl, onPhotoUpdate, setIsUploading }) => {
  const defaultImage = require('@/assets/images/default-image.png');
  const [image, setImage] = useState<ImageSourcePropType>(currentPhotoUrl ? { uri: currentPhotoUrl } : defaultImage);

  useEffect(() => {
    setImage(currentPhotoUrl ? { uri: currentPhotoUrl } : defaultImage);
  }, [currentPhotoUrl]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert('Permission required', 'We need access to your camera and photos to upload a profile picture.');
      return false;
    }
    return true;
  };

  const handleImagePicked = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setImage({ uri: selectedImage });
      try {
        setIsUploading(true);
        const uploadedImageUrl = await uploadImage(result.assets[0]);
        onPhotoUpdate(uploadedImageUrl);
      } catch (error) {
        console.error('Upload failed:', error);
        Alert.alert('Upload failed', 'Failed to upload the image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    await handleImagePicked(result);
  };

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    await handleImagePicked(result);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageContainer} onPress={pickImageFromGallery}>
        <Image
          source={image}
          style={styles.image}
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
      </TouchableOpacity>

      <View style={styles.buttonsContainer}>
        <MyButton
          title="Choose from Gallery"
          onPress={pickImageFromGallery}
          disable={false}
        />
        <MyButton
          title="Take Photo"
          onPress={takePhotoWithCamera}
          disable={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    width: '80%',
  },
});

export default ProfilePicture;