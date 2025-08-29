import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');
const isTablet = width > 600;

export default function TeacherChatScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [chatType, setChatType] = useState('group'); // 'group' yoki 'private'

  useEffect(() => {
    const fetchGroups = async () => {
      const snapshot = await getDocs(collection(db, 'groups'));
      const groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsData);
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, `groups/${selectedGroup.id}/students`));
      const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsData);
    };
    fetchStudents();
  }, [selectedGroup]);

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity style={[styles.groupCard, isTablet && styles.groupCardTablet]} onPress={() => setSelectedGroup(item)}>
      <Text style={[styles.groupName, isTablet && styles.groupNameTablet]}>{item.name}</Text>
      <MaterialCommunityIcons name="chevron-right" size={isTablet ? 28 : 24} color="#555" />
    </TouchableOpacity>
  );

  const renderStudentItem = ({ item }) => (
    <View style={[styles.studentItem, isTablet && styles.studentItemTablet]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.online ? '#4CAF50' : 'gray' },
            isTablet && { width: 16, height: 16, borderRadius: 8 },
          ]}
        />
        <Text style={[styles.studentName, isTablet && styles.studentNameTablet]}>{item.name}</Text>
      </View>
      <TouchableOpacity onPress={() => alert('O‘chirish')}>
        <MaterialCommunityIcons name="delete" size={isTablet ? 22 : 20} color="#ff3333" />
      </TouchableOpacity>
    </View>
  );

  if (selectedGroup) {
    return (
      <View style={[styles.container, isTablet && { padding: 24 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedGroup(null)}>
            <MaterialCommunityIcons name="arrow-left" size={isTablet ? 28 : 24} color="#000" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isTablet && { fontSize: 22 }]}>{selectedGroup.name}</Text>
        </View>

        <View style={styles.chatToggle}>
          <TouchableOpacity
            style={[styles.chatButton, chatType === 'group' && styles.chatButtonActive, isTablet && { paddingHorizontal: 30 }]}
            onPress={() => setChatType('group')}
          >
            <Text style={[styles.chatButtonText, chatType === 'group' && styles.chatButtonTextActive, isTablet && { fontSize: 18 }]}>
              Guruh Chat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chatButton, chatType === 'private' && styles.chatButtonActive, isTablet && { paddingHorizontal: 30 }]}
            onPress={() => setChatType('private')}
          >
            <Text style={[styles.chatButtonText, chatType === 'private' && styles.chatButtonTextActive, isTablet && { fontSize: 18 }]}>
              Shaxsiy Chat
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderStudentItem}
          style={{ marginTop: 10 }}
        />

        <TouchableOpacity style={[styles.addStudentButton, isTablet && { padding: 18, borderRadius: 30 }]}>
          <MaterialCommunityIcons name="account-plus" size={isTablet ? 24 : 20} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 10, fontSize: isTablet ? 18 : 14 }}>O'quvchi Qo'shish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isTablet && { padding: 24 }]}>
      <Text style={[styles.title, isTablet && { fontSize: 28 }]}>Guruhlar</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
      />

      <View style={[styles.addGroupContainer, isTablet && { marginTop: 30 }]}>
        <TextInput
          placeholder="Yangi guruh nomi"
          value={newGroupName}
          onChangeText={setNewGroupName}
          style={[styles.input, isTablet && { fontSize: 18, padding: 14 }]}
        />
        <TouchableOpacity
          style={[styles.addButton, isTablet && { padding: 14 }]}
          onPress={() => alert('Guruh qo‘shish')}
        >
          <MaterialCommunityIcons name="plus" size={isTablet ? 24 : 20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F7F7F7' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  groupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  groupCardTablet: { padding: 24 },
  groupName: { fontSize: 16, fontWeight: '600' },
  groupNameTablet: { fontSize: 20 },
  addGroupContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#0D47A1',
    padding: 12,
    borderRadius: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 10 },
  chatToggle: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  chatButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginHorizontal: 5,
  },
  chatButtonActive: { backgroundColor: '#0D47A1' },
  chatButtonText: { color: '#555', fontWeight: '500' },
  chatButtonTextActive: { color: '#fff' },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  studentItemTablet: { padding: 18 },
  studentName: { marginLeft: 10, fontSize: 16 },
  studentNameTablet: { fontSize: 18 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  addStudentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#0D47A1',
    borderRadius: 25,
    marginTop: 20,
  },
});
