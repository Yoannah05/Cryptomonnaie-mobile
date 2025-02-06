import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const MyButton = ({ title, onPress, disable }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} disabled={disable}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff', // Blue background color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8, // Rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff', // White text color
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyButton;