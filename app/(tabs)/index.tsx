import { useEffect, useState } from "react";
import { Alert, Button, Platform, SafeAreaView, StatusBar, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNotification } from "@/context/NotificationContext";
import DOMCoolCode from "@/components/DOMCoolCode";

export default function HomeScreen() {
  const { notification, expoPushToken, error } = useNotification();

  const [dummyState, setDummyState] = useState(0);
  const [sendNotifToken, setSendNotifToken] = useState("")

  if (error) {
    return <ThemedText>Error: {error.message}</ThemedText>;
  }

  const sendNotification = async (title: string, body: string) => {
    if (!sendNotifToken) {
      Alert.alert("Notification token is not available");
      return;
    }

    try {
      const response = await fetch("http://192.168.1.174:3000/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          body: body,
          token: sendNotifToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      Alert.alert("Notification request sent successfully");
    } catch (error : any) {
      Alert.alert("Error sending notification request", error.message);
    }
  };
  return (
    <>
      <StatusBar barStyle={"light-content"} translucent={true} backgroundColor={"black"}/>
      <ThemedView
        style={{
          flex: 1,
          paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 10,
          backgroundColor: "black",
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ThemedText type="subtitle" style={{ color: "red" }}>
            Your token:
          </ThemedText>
          <ThemedText>{expoPushToken}</ThemedText>
          <ThemedText type="subtitle">Latest notification:</ThemedText>
          <ThemedText>{notification?.request.content.title}</ThemedText>
          <ThemedText>
            {JSON.stringify(notification?.request.content.data, null, 2)}
          </ThemedText>

          <TextInput
            style={{
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginVertical: 10,
              paddingHorizontal: 10,
            }}
            placeholder="Enter notification token"
            value={sendNotifToken}
            onChangeText={setSendNotifToken}
          />

          <Button
            onPress={() => sendNotification("Test Title", "Test Body")}
            title="Send Notification"
          />
        </SafeAreaView>
      </ThemedView>
    </>
  );
}
