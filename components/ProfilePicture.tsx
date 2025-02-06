import React, { useState, useEffect } from 'react'; // Add useEffect
import { View, StyleSheet, TouchableOpacity, Alert, Image, ImageSourcePropType } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/app/services/cloudinaryService'; // Import the Cloudinary service

interface ProfilePictureProps {
  currentPhotoUrl: string | null; // The current photo URL (can be null if no photo)
  onPhotoUpdate: (newPhotoUrl: string) => void; // Function to update the photo URL in the parent component
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>; // State setter for uploading state
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ currentPhotoUrl, onPhotoUpdate, setIsUploading }) => {
  // Set the default image if currentPhotoUrl is null
  const defaultImage = require('@/assets/images/default-image.png'); // Local default image
  const [image, setImage] = useState<ImageSourcePropType>(currentPhotoUrl ? { uri: currentPhotoUrl } : defaultImage);

  // Update the image state when currentPhotoUrl changes
  useEffect(() => {
    setImage(currentPhotoUrl ? { uri: currentPhotoUrl } : defaultImage);
  }, [currentPhotoUrl]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setImage({ uri: selectedImage }); // Update the image state with the new URI
      try {
        setIsUploading(true);
        const uploadedImageUrl = await uploadImage(result.assets[0]);
        onPhotoUpdate(uploadedImageUrl); // Pass the new image URL to the parent
      } catch (error) {
        Alert.alert('Upload failed', 'Failed to upload the image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        <Image
          source={image} // Use the image state directly
          style={styles.image}
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)} // Log image load errors
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
  },
  imageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
});

export default ProfilePicture;