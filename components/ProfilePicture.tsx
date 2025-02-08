import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Image, Modal, Text } from 'react-native';
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
  const [image, setImage] = useState(currentPhotoUrl ? { uri: currentPhotoUrl } : defaultImage);
  const [modalVisible, setModalVisible] = useState(false);

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
      <TouchableOpacity style={styles.imageContainer} onPress={() => setModalVisible(true)}>
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

      {/* Modal to view image in full screen */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)} />
          <View style={styles.modalImageContainer}>
            <Image source={image} style={styles.modalImage} />
          </View>
        </View>
      </Modal>
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalImageContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
});

export default ProfilePicture;
