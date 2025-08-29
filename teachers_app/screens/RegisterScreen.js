// src/screens/RegisterScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { auth, firestore } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  setDoc,
  doc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // default student
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  // ✅ login bo'lgan userni olish
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Firestore'dan hamma userlarni olish
        const querySnap = await getDocs(collection(firestore, "users"));
        const allUsers = querySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(allUsers);
      } else {
        setCurrentUser(null);
        setUsers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Register qilish
  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Xato", "Email va parolni kiriting");
      return;
    }

    // faqat student email bo‘lishi kerak
    if (!email.endsWith("@student.com")) {
      Alert.alert("Xato", "Faqat @student.com bilan tugaydigan emailga ruxsat beriladi!");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      // Firestore ga yozamiz
      await setDoc(doc(firestore, "users", user.uid), {
        email: email,
        role: role,
        createdAt: new Date(),
      });

      // ⚡ avtomatik login bo‘lib ketmasligi uchun darhol signOut()
    

      Alert.alert("Muvaffaqiyatli", "Foydalanuvchi ro‘yxatdan o‘tdi ✅");
      setEmail("");
      setPassword("");
    } catch (error) {
      Alert.alert("Xato", error.message);
    }
  };

  // ✅ Teacher boshqa userni o‘chira oladi
  const handleDeleteUser = async (userId) => {
    if (!currentUser) return;
    // faqat teacher huquqi bo‘lsa
    const current = users.find((u) => u.id === currentUser.uid);
    if (current?.role !== "teacher") {
      Alert.alert("Xato", "Faqat teacher foydalanuvchini o‘chira oladi");
      return;
    }

    try {
      await deleteDoc(doc(firestore, "users", userId));
      setUsers(users.filter((u) => u.id !== userId));
      Alert.alert("O‘chirildi", "Foydalanuvchi bazadan o‘chirildi ✅");
    } catch (error) {
      Alert.alert("Xato", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Screen</Text>

      <TextInput
        placeholder="Login"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Create account</Text>
      </TouchableOpacity>

      {currentUser && (
        <>
          <Text style={styles.subtitle}>Students list:</Text>
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <Text>
                  {item.email} ({item.role})
                </Text>
                {users.find((u) => u.id === currentUser.uid)?.role ===
                  "teacher" && (
                  <TouchableOpacity onPress={() => handleDeleteUser(item.id)}>
                    <Text style={styles.delete}>❌</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  btn: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  delete: { color: "red", fontSize: 18 },
});
