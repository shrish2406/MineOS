import { useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

interface CameraCaptureProps {
  photoUri: string | null;
  onPhotoCaptured: (uri: string) => void;
  onPhotoRemoved: () => void;
  label?: string;
}

export default function CameraCapture({
  photoUri,
  onPhotoCaptured,
  onPhotoRemoved,
  label = 'Photo Evidence',
}: CameraCaptureProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        return;
      }
    }
    setCameraReady(false);
    setModalVisible(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady) {
      return;
    }

    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) {
      onPhotoCaptured(photo.uri);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <View style={styles.previewActions}>
            <Pressable style={styles.retakeButton} onPress={openCamera}>
              <Ionicons name="camera-outline" size={18} color={colors.navy} />
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
            <Pressable style={styles.removeButton} onPress={onPhotoRemoved}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.captureButton} onPress={openCamera}>
          <Ionicons name="camera" size={28} color={colors.navy} />
          <Text style={styles.captureText}>Capture Photo</Text>
        </Pressable>
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onCameraReady={() => setCameraReady(true)}
          />
          <View style={styles.modalControls}>
            <Pressable style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.white} />
            </Pressable>
            <Pressable
              style={[styles.shutterButton, !cameraReady && styles.shutterDisabled]}
              onPress={handleCapture}
              disabled={!cameraReady}
            >
              <View style={styles.shutterInner} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 20,
    backgroundColor: colors.background,
  },
  captureText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
  },
  previewContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  retakeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  camera: {
    flex: 1,
  },
  modalControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 48,
    paddingTop: 20,
    backgroundColor: 'rgba(11, 25, 44, 0.6)',
  },
  modalClose: {
    position: 'absolute',
    left: 24,
    bottom: 56,
    padding: 8,
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
  },
});
