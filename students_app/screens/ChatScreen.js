// ChatScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { db, auth, storage } from '../../firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Video } from 'expo-av';
import CustomHeader from '../../components/CustomHeader';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [membersCount, setMembersCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const flatListRef = useRef(null);
  const currentUserId = auth.currentUser.uid;

  // Real-time messages
  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  // Real-time members & online count
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
      setMembersCount(snapshot.size);
      const online = snapshot.docs.filter(doc => doc.data().isOnline).length;
      setOnlineCount(online);
    });
    return () => unsubscribe();
  }, []);

  // Upload media
  const uploadMedia = async (uri, type) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `${type}s/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  // Send message (text/media/file)
  const sendMessage = async (content, type = 'text', name = null) => {
    const userDoc = await getDoc(doc(db, 'users', currentUserId));
    const userData = userDoc.data();

    if (editingId) {
      await updateDoc(doc(db, 'chats', editingId), {
        text: content,
        type,
        name,
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'chats'), {
        text: content,
        senderId: currentUserId,
        senderName: userData.displayName || 'Anon',
        avatar: userData.avatar || null,
        type,
        name: name || null,
        timestamp: serverTimestamp(),
      });
    }
    setInputText('');
  };

  // Pick image/video
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const type = asset.type === 'video' ? 'video' : 'image';
      const url = await uploadMedia(asset.uri, type);
      sendMessage(url, type);
    }
  };

  // Pick file
  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      const url = await uploadMedia(file.uri, 'file');
      sendMessage(url, 'file', file.name);
    }
  };

  // Delete message
  const handleDelete = id => {
    Alert.alert('O‘chirish', 'Xabarni o‘chirilsinmi?', [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Ha',
        style: 'destructive',
        onPress: async () => await deleteDoc(doc(db, 'chats', id)),
      },
    ]);
  };

  // Edit message
  const handleEdit = msg => {
    setInputText(msg.text);
    setEditingId(msg.id);
  };

  // Render message
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUserId;
    const container = isCurrentUser ? styles.myContainer : styles.otherContainer;
    const style = isCurrentUser ? styles.myMessage : styles.otherMessage;

    return (
      <View style={container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
          {item.avatar && <Image source={{ uri: item.avatar }} style={styles.avatarSmall} />}
          <Text style={styles.senderName}>{isCurrentUser ? 'Siz' : item.senderName}</Text>
        </View>

        <View style={style}>
          {item.type === 'text' && <Text>{item.text}</Text>}
          {item.type === 'image' && (
            <TouchableOpacity onPress={() => { setModalImage(item.text); setModalVisible(true); }}>
              <Image source={{ uri: item.text }} style={styles.imagePreview} />
            </TouchableOpacity>
          )}
          {item.type === 'video' && (
            <Video source={{ uri: item.text }} style={styles.videoPreview} useNativeControls resizeMode="contain" />
          )}
          {item.type === 'file' && (
            <TouchableOpacity onPress={() => Linking.openURL(item.text).catch(() => alert('Faylni ochib bo‘lmadi'))}>
              <Text style={styles.fileLink}>📎 {item.name || 'Fayl'}</Text>
            </TouchableOpacity>
          )}

          {isCurrentUser && (
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <MaterialCommunityIcons name="pencil" size={18} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 10 }}>
                <MaterialCommunityIcons name="delete" size={18} color="#ff3333" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Custom Header + real-time members/online */}
      <CustomHeader groupName="BOOSTER IELTS" members={membersCount} online={onlineCount} />
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>BOOSTER IELTS</Text>
        <Text style={styles.members}>{`A’zolar: ${membersCount}, Onlayn: ${onlineCount}`}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={handlePickImage}>
          <MaterialCommunityIcons name="image" size={24} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePickFile} style={{ marginLeft: 10 }}>
          <MaterialCommunityIcons name="paperclip" size={24} color="#555" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Xabar yozing..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={() => sendMessage(inputText)} style={styles.sendButton}>
          <MaterialCommunityIcons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalContainer} onPress={() => setModalVisible(false)}>
          <Image source={{ uri: modalImage }} style={styles.fullImage} />
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  input: { flex: 1, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', marginHorizontal: 10, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 10 : 5, color: '#000' },
  sendButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 20, justifyContent: 'center' },
  myContainer: { alignItems: 'flex-end', marginBottom: 10 },
  otherContainer: { alignItems: 'flex-start', marginBottom: 10 },
  myMessage: { backgroundColor: '#DCF8C6', padding: 10, borderRadius: 10, maxWidth: '80%' },
  otherMessage: { backgroundColor: '#eee', padding: 10, borderRadius: 10, maxWidth: '80%' },
  senderName: { fontSize: 12, fontWeight: '600', marginLeft: 5, color: '#555' },
  avatarSmall: { width: 24, height: 24, borderRadius: 12 },
  imagePreview: { width: 150, height: 150, borderRadius: 8, marginTop: 5 },
  videoPreview: { width: 200, height: 150, borderRadius: 8, marginTop: 5 },
  fileLink: { color: '#1E90FF', textDecorationLine: 'underline', marginTop: 5 },
  modalContainer: { backgroundColor: 'rgba(0,0,0,0.9)', flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
  groupInfo: { padding: 10, backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderColor: '#ddd' },
  groupName: { fontWeight: '600', fontSize: 16 },
  members: { fontSize: 12, color: '#555', marginTop: 2 },
});
