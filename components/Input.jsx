import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const Input = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  style = {}, // Default to an empty object if no style is provided
  keyboardType = 'default', // Default keyboardType is 'default'
}) => {
  return (
    <TextInput
      style={[styles.input, style]}  // Apply default style and custom style if provided
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}  // Apply the passed keyboardType or default to 'default'
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
});

export default Input;
