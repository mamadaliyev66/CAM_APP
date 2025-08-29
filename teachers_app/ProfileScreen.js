import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));
const RFValue = (fontSize) => {
  const standardScreenHeight = 680;
  const heightPercent = (fontSize * 100) / standardScreenHeight;
  const newSize = (heightPercent * SCREEN_HEIGHT) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export default function ProfileScreen({ navigation }) {
  const theme = useTheme();
  const [name, setName] = useState('Abror Rahmatullayev');
  const [birthDate, setBirthDate] = useState('26.09.1999');
  const [editMode, setEditMode] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const groupName = 'Group #1';

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Rasmga kirish uchun ruxsat berish kerak.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images, // FAOL: faqat rasm
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleGoBack = () => navigation.goBack();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          paddingHorizontal: SCREEN_WIDTH * 0.05,
          paddingTop: SCREEN_HEIGHT * 0.02,
          paddingBottom: SCREEN_HEIGHT * 0.05,
        }}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <TouchableOpacity onPress={pickImageFromGallery}>
            <Image
              source={avatarUri ? { uri: avatarUri } : require('../assets/writing_books.jpg')}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>{name}</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.group, { color: theme.colors.onSurfaceVariant }]}>{groupName}</Text>
            <Text style={[styles.birth, { color: theme.colors.onSurfaceVariant }]}>{birthDate}</Text>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          onPress={() => setEditMode(!editMode)}
          style={[styles.button, { backgroundColor: theme.colors.secondaryContainer }]}
        >
          <Text style={[styles.buttonText, { color: theme.colors.onSecondaryContainer }]}>Tahrirlash</Text>
          <MaterialCommunityIcons name="pencil" size={RFValue(18)} color={theme.colors.onSecondaryContainer} />
        </TouchableOpacity>

        {/* Edit Form */}
        {editMode && (
          <View style={styles.editForm}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="To'liq ism"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              style={[
                styles.input,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, color: theme.colors.onSurface },
              ]}
            />
            <TextInput
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="Tug'ilgan sana"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              style={[
                styles.input,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, color: theme.colors.onSurface },
              ]}
            />
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[
            styles.button,
            styles.logoutBtn,
            { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error, borderWidth: normalize(1) },
          ]}
        >
          <Text style={[styles.buttonText, { color: theme.colors.onErrorContainer }]}>Chiqish</Text>
          <MaterialCommunityIcons name="logout" size={RFValue(18)} color={theme.colors.onErrorContainer} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: normalize(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.1,
    shadowRadius: normalize(4),
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
  },
  profileCard: {
    width: '100%',
    marginVertical: SCREEN_HEIGHT * 0.02,
    padding: SCREEN_WIDTH * 0.05,
    borderWidth: normalize(1),
    borderRadius: normalize(16),
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.1,
    shadowRadius: normalize(4),
  },
  avatar: {
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    borderRadius: SCREEN_WIDTH * 0.15,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  name: {
    fontSize: RFValue(18),
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  group: {
    fontSize: RFValue(14),
  },
  birth: {
    fontSize: RFValue(14),
  },
  button: {
    marginTop: SCREEN_HEIGHT * 0.02,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    borderRadius: normalize(12),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: normalize(1) },
    shadowOpacity: 0.1,
    shadowRadius: normalize(2),
  },
  logoutBtn: {
    marginTop: SCREEN_HEIGHT * 0.015,
  },
  buttonText: {
    fontWeight: '500',
    fontSize: RFValue(16),
  },
  editForm: {
    marginTop: SCREEN_HEIGHT * 0.015,
    width: '100%',
  },
  input: {
    borderWidth: normalize(1),
    paddingVertical: SCREEN_HEIGHT * 0.012,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    borderRadius: normalize(8),
    marginTop: SCREEN_HEIGHT * 0.015,
    fontSize: RFValue(16),
  },
});


