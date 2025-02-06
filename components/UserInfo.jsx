import React from 'react'; 
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

const UserInfo = ({ user }) => {
    return (
        <View style={styles.container}>
            <ThemedText type="subtitle">Nom</ThemedText>
            {/* <ThemedText type="default">{user.name}</ThemedText> */}

            <ThemedText type="subtitle">Email</ThemedText>
            <ThemedText type="default">{user.email}</ThemedText>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
});

export default UserInfo;
