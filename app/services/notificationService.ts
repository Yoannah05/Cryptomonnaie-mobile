import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getDatabase, ref, get, set } from "firebase/database";
import { app } from '@/config/firebase'; // Import your Firebase config
import { onAuthStateChanged } from "firebase/auth"; // Import Firebase Authentication
import { auth } from '@/config/firebase'; // Import your Firebase auth instance

export interface PushNotificationState {
    expoPushToken?: Notifications.ExpoPushToken;
    notification?: Notifications.Notification;
    notifications: any[]; // Store notifications here
}

const createNotification = async (userId: string, message: string) => {
    const db = getDatabase(app);
    const notificationId = `notification_${new Date().getTime()}`;
    await set(ref(db, `users/${userId}/notifications/${notificationId}`), {
        message,
        timestamp: new Date().getTime(),
    });
};

export const usePushNotifications = (): PushNotificationState => {
    const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | undefined>();
    const [notifications, setNotifications] = useState<any[]>([]); // Store notifications
    const [userId, setUserId] = useState<string | null>(null); // Store the user ID

    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    // Request notification permissions and get the Expo push token
    const requestNotificationPermissions = async () => {
        const { status } = await Notifications.requestPermissionsAsync();

        if (status !== "granted") {
            alert("Permission to receive notifications was denied");
            return null;
        }
        const token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas.projectId,
        });
        console.log("Expo Push Token:", token);
        return token;
    };

    // Set up the notification channel for Android
    const setNotificationChannel = async () => {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }
    };

    // Fetch notifications from Firebase for the current user
    const fetchNotifications = async (userId: string) => {
        const db = getDatabase(app);
        const notificationsRef = ref(db, `users/${userId}/notifications`); // Fetch notifications for the user
        const snapshot = await get(notificationsRef);
        if (snapshot.exists()) {
            setNotifications(Object.values(snapshot.val())); // Set notifications in state
        }
    };

    // Register for push notifications and set up listeners
    const registerForPushNotificationsAsync = async () => {
        let token;
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== "granted") {
                alert("Failed to get push token for push notification");
                return;
            }

            token = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas.projectId,
            });
        } else {
            alert("Must be using a physical device for Push notifications");
        }

        await setNotificationChannel();
        return token;
    };

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log(user);
                setUserId(user.uid); // Store user ID when user is authenticated

                // Fetch notifications for the authenticated user
                fetchNotifications(user.uid);

                // Request push notification permissions and register for token
                const token = await registerForPushNotificationsAsync();
                setExpoPushToken(token);
            } else {
                setUserId(null); // Clear userId when no user is authenticated
            }
        });

        // Listen for incoming notifications
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification);
            setNotification(notification);
            setNotifications((prev) => [notification, ...prev]); // Add the new notification to the notifications list
        });

        // Listen for user interaction with notifications
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification tapped:", response);
        });

        return () => {
            // Clean up listeners
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
            // Clean up auth state listener
            unsubscribeAuth();
        };
    }, []); // Empty dependency array to run this effect only once on mount

    return {
        expoPushToken,
        notification,
        notifications, // Return notifications
    };
};

// Export the createNotification function for external use
export { createNotification };
