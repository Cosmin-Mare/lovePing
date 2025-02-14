import { useEffect, useState } from "react";
import { Alert, Button, Platform, SafeAreaView, StatusBar, TextInput, View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNotification } from "@/context/NotificationContext";
import DOMCoolCode from "@/components/DOMCoolCode";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from "@/constants/Colors";

export default function HomeScreen() {
  const { notification, expoPushToken, error } = useNotification();

  const [dummyState, setDummyState] = useState(0);
  const [notificationBody, setNotificationBody] = useState("");
  const [name, setName] = useState("");
  const [storedUserName, setStoredUserName] = useState<string | null>(null);
  const [storedExpoPushToken, setStoredExpoPushToken] = useState<string | null>(null);
  const [searchUserName, setSearchUserName] = useState("");
  const [searchedUserToken, setSearchedUserToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  if (error) {
    return <ThemedText>Error: {error.message}</ThemedText>;
  }

  // Fetch stored user data on component mount
  useEffect(() => {
    const fetchStoredData = async () => {
      const userName = await AsyncStorage.getItem('userName');
      const expoToken = await AsyncStorage.getItem('expoPushToken');
      const storedSearchedUserToken = await AsyncStorage.getItem('searchedUserToken');
      setStoredUserName(userName);
      setName(userName == null ? "" : userName);
      setStoredExpoPushToken(expoToken);
      setSearchedUserToken(storedSearchedUserToken);

      // Skip steps based on stored data
      if (userName) {
        setCurrentStep(2); // Skip to step 2 if a name is stored
      }
      if (storedSearchedUserToken) {
        setCurrentStep(3); // Skip to step 3 if a token is stored
      }
    };

    fetchStoredData();
  }, []);

  const sendNotification = async () => {
    const tokenToUse = searchedUserToken || storedExpoPushToken;
    if (!tokenToUse) {
      Alert.alert("Notification token is not available");
      return;
    }

    try {
      const response = await fetch("https://lovepingexpress-production.up.railway.app/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: name,
          body: notificationBody,
          token: tokenToUse,
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

  const saveUser = async () => {
    if (!name || !expoPushToken) {
      Alert.alert("Name and notification token are required");
      return;
    }

    try {
      const response = await fetch("https://lovepingexpress-production.up.railway.app/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          notifToken: expoPushToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save user");
      }

      await AsyncStorage.setItem('userName', name);

      setStoredUserName(name);
      Alert.alert("User saved successfully");
      setCurrentStep(2); // Move to the next step
    } catch (error: any) {
      Alert.alert("Error saving user", error.message);
    }
  };

  const searchUser = async () => {
    if (!searchUserName) {
      Alert.alert("Please enter a username to search");
      return;
    }

    try {
      const response = await fetch(`https://lovepingexpress-production.up.railway.app/get-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: searchUserName }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setSearchedUserToken(data.notifToken);
      setStoredExpoPushToken(data.notifToken);
      await AsyncStorage.setItem('searchedUserToken', data.notifToken);

      Alert.alert("User found and token stored");
      setCurrentStep(3); // Move to the next step
    } catch (error: any) {
      Alert.alert("Error fetching user", error.message);
    }
  };

  const sendMessage = async (message: string) => {
    const tokenToUse = searchedUserToken || storedExpoPushToken;
    if (!tokenToUse) {
      Alert.alert("Notification token is not available");
      return;
    }

    try {
      const response = await fetch("https://lovepingexpress-production.up.railway.app/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: name,
          body: message,
          token: tokenToUse,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      Alert.alert("Notification request sent successfully");
    } catch (error: any) {
      Alert.alert("Error sending notification request", error.message);
    }
  };

  const resetData = async () => {
    // Clear local storage
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('expoPushToken');
    await AsyncStorage.removeItem('searchedUserToken');
    
    // Reset state variables
    setStoredUserName(null);
    setStoredExpoPushToken(null);
    setName("");
    setSearchUserName("");
    setSearchedUserToken(null);
    setCurrentStep(1); // Reset to the first step
  };

  return (
    <>
      <StatusBar barStyle={"light-content"} translucent={true} backgroundColor={"black"}/>
      <ThemedView
        style={{
          flex: 1,
          paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 10,
          backgroundColor: Colors.light.beige,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* <ThemedText type="subtitle" style={{ color: Colors.light.red }}>
            Your token:
          </ThemedText>
          <ThemedText>{expoPushToken}</ThemedText> */}
          {/* <ThemedText type="subtitle">Latest notification:</ThemedText>
          <ThemedText>{notification?.request.content.title}</ThemedText>
          <ThemedText>
            {JSON.stringify(notification?.request.content.data, null, 2)}
          </ThemedText> */}
          {/* <ThemedText type="subtitle">Your name:</ThemedText>
          <ThemedText>{storedUserName}</ThemedText> */}

          {currentStep === 1 && (
            <>
              <View style={{display: 'flex', 
                alignItems: "center", justifyContent: "center", 
                marginTop: "30%", position: "absolute", width: "100%"}}>
                <Text style={{fontSize: 60, fontWeight: "700", color:Colors.light.red}}>Love Ping</Text>
              </View>
              <View style={{ display: "flex", height: "100%", justifyContent: 'center', paddingHorizontal: "20%" }}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                />
                <TouchableOpacity onPress={saveUser} style={{ backgroundColor: Colors.light.red, padding: 10, borderRadius: 15 }}>
                  <ThemedText style={{ color: 'white', textAlign: 'center', fontWeight: "700" }}>Enter</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}

          {currentStep === 2 && (
            <>
            {/* <View style={{display: 'flex', 
              alignItems: "center", justifyContent: "center", 
              marginTop: "30%", position: "absolute", width: "100%"}}>
              <Text style={{fontSize: 60, fontWeight: "700", color:Colors.light.red}}>Love Ping</Text>
            </View> */}
            <View style={{ display: "flex", height: "100%", justifyContent: 'center', paddingHorizontal: "20%" }}>
              <TextInput
                style={styles.input}
                placeholder="Enter their name😊"
                value={searchUserName}
                onChangeText={setSearchUserName}
              />
              <TouchableOpacity onPress={searchUser} style={{ backgroundColor: Colors.light.red, padding: 10, borderRadius: 15 }}>
                <ThemedText style={{ color: 'white', textAlign: 'center', fontWeight: "700" }}>Connect❤️</ThemedText>
              </TouchableOpacity>
            </View>
          </>
          )}

          {currentStep === 3 && (
            <>
            {/* <View style={{display: 'flex', 
              alignItems: "center", justifyContent: "center", 
              marginTop: "30%", position: "absolute", width: "100%"}}>
              <Text style={{fontSize: 60, fontWeight: "700", color:Colors.light.red}}>Love Ping</Text>
            </View> */}
            <View style={{ display: "flex", height: "100%", justifyContent: 'center', paddingHorizontal: "20%", alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => sendMessage("I love you")} style={styles.circularButton}>
                  <ThemedText style={styles.buttonText}>❤️</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => sendMessage("I want to kiss you")} style={styles.circularButton}>
                  <ThemedText style={styles.buttonText}>😘</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableOpacity onPress={() => sendMessage("I want to hug you")} style={styles.circularButton}>
                  <ThemedText style={styles.buttonText}>🤗</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => sendMessage("😏")} style={styles.circularButton}>
                  <ThemedText style={styles.buttonText}>😏</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={resetData} style={{ backgroundColor: Colors.light.red, padding: 10, borderRadius: 15, position: 'absolute', bottom: 20 }}>
              <ThemedText style={{ color: 'white', textAlign: 'center', fontWeight: "700" }}>Reset</ThemedText>
            </TouchableOpacity>
          </>
          )}
        </SafeAreaView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: Colors.light.red,
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.light.beige,
  },
  circularButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.red,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    fontSize: 48,
    lineHeight: 60,
  },
});