import React, { useState, memo, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { usePlayer } from '@/context/PlayerContext';

interface Track {
    id: string;
    title: string;
    artist: string;
    artworkUrl: string;
}

const TrackItem = memo(({ item, onPress }: { item: Track; onPress: (track: Track) => void }) => (
    <TouchableOpacity
        style={styles.resultCard}
        onPress={() => onPress(item)}
    >
        <Image source={{ uri: item.artworkUrl }} style={styles.resultArt} />
        <View style={styles.resultInfo}>
            <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.resultArtist} numberOfLines={1}>{item.artist}</Text>
        </View>
    </TouchableOpacity>
));

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const { setNowPlaying } = usePlayer();

    const searchMusic = async (text: string) => {
        setQuery(text);
        if (text.length < 3) return;

        setLoading(true);
        try {
            const response = await fetch(`https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(text)}&fmt=json`);
            const data = await response.json();

            const mappedResults: Track[] = data.recordings.map((rec: any) => {
                const artist = rec['artist-credit']?.map((ac: any) => ac.name).join(', ') || 'Unknown Artist';
                const releaseGroupId = rec.releases?.[0]?.['release-group']?.id;

                return {
                    id: rec.id,
                    title: rec.title,
                    artist,
                    artworkUrl: releaseGroupId
                        ? `https://coverartarchive.org/release-group/${releaseGroupId}/front`
                        : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop',
                };
            });

            setResults(mappedResults);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = useCallback((track: Track) => {
        setNowPlaying(track);
    }, [setNowPlaying]);

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Search songs, artists..."
                    placeholderTextColor="#888"
                    style={styles.searchInput}
                    value={query}
                    onChangeText={searchMusic}
                />
            </View>
            <View style={styles.listWrapper}>
                <FlashList
                    data={results}
                    renderItem={({ item }) => <TrackItem item={item} onPress={handlePress} />}
                    ListHeaderComponent={loading ? <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} /> : null}
                    ListEmptyComponent={!loading && query.length >= 3 ? <Text style={styles.noResults}>No tracks found</Text> : null}
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
    searchContainer: {
        padding: 20,
        paddingTop: 60,
    },
    searchInput: {
        backgroundColor: '#fff',
        height: 45,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    listWrapper: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 150,
    },
    resultCard: {
        flexDirection: 'row',
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    resultArt: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    resultInfo: {
        flex: 1,
        marginLeft: 12,
    },
    resultTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    resultArtist: {
        color: '#b3b3b3',
        fontSize: 14,
        marginTop: 2,
    },
    noResults: {
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    }
});
