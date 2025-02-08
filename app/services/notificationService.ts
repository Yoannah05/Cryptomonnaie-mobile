import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getDatabase, ref, get, set } from "firebase/database";
import { app } from '@/config/firebase'; // Import your Firebase config

export interface PushNotificationState {
    expoPushToken?: Notifications.ExpoPushToken;
    notification?: Notifications.Notification;
    campaigns: any[]; // Add campaigns to the state
}

const createCampaign = async (title: string, message: string) => {
    const db = getDatabase(app);
    const campaignId = `campaign_${new Date().getTime()}`;
    await set(ref(db, "campaigns/" + campaignId), {
        title,
        message,
        dateCreated: new Date().toISOString(),
    });
};

export const usePushNotifications = (): PushNotificationState => {
    const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | undefined>();
    const [campaigns, setCampaigns] = useState<any[]>([]); // Store the campaigns

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

    // Fetch campaigns from Firebase
    const fetchCampaigns = async () => {
        const db = getDatabase(app);
        const campaignsRef = ref(db, "campaigns"); // Assuming you're storing campaigns in 'campaigns' node
        const snapshot = await get(campaignsRef);
        if (snapshot.exists()) {
            setCampaigns(Object.values(snapshot.val()));
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
        registerForPushNotificationsAsync().then((token) => {
            setExpoPushToken(token);
        });

        // Listen for incoming notifications
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification);
            setNotification(notification);
            setCampaigns((prev) => [notification, ...prev]); // Add the new notification to the campaigns list
        });

        // Listen for user interaction with notifications
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification tapped:", response);
        });

        // Fetch campaigns from Firebase
        fetchCampaigns();

        return () => {
            // Clean up listeners
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return {
        expoPushToken,
        notification,
        campaigns, // Return campaigns
    };
};

// Export the createCampaign function for external use
export { createCampaign };