import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';

const PlaylistItem = memo(({ name }: { name: string }) => (
    <View style={styles.playlistItem}>
        <View style={styles.playlistArt} />
        <View style={styles.playlistInfo}>
            <Text style={styles.playlistName}>{name}</Text>
            <Text style={styles.playlistMeta}>Playlist • VibeVault</Text>
        </View>
    </View>
));

export default function LibraryScreen() {
    const playlists = ['Liked Songs', 'Study Lo-fi', 'Workout Energy', 'Sunday Jazz'];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Library</Text>
                <Ionicons name="add" size={28} color="white" />
            </View>
            <View style={styles.listWrapper}>
                <FlashList
                    data={playlists}
                    renderItem={({ item }) => <PlaylistItem name={item} />}
                    contentContainerStyle={styles.scrollContent}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    listWrapper: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 150,
    },
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    playlistArt: {
        width: 60,
        height: 60,
        backgroundColor: '#333',
        borderRadius: 12,
    },
    playlistInfo: {
        marginLeft: 15,
    },
    playlistName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    playlistMeta: {
        color: '#888',
        fontSize: 14,
        marginTop: 4,
    },
});
