import React, { useState, useEffect, memo, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { usePlayer } from '@/context/PlayerContext';

interface Track {
  title: string;
  artist: string;
  artworkUrl: string;
}

const TrackItem = memo(({ item, onPress }: { item: Track; onPress: (track: Track) => void }) => (
  <TouchableOpacity
    style={styles.resultItem}
    onPress={() => onPress(item)}
  >
    <Image source={{ uri: item.artworkUrl }} style={styles.resultArt} />
    <View style={styles.resultInfo}>
      <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.resultArtist} numberOfLines={1}>{item.artist}</Text>
    </View>
  </TouchableOpacity>
));

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [homeData, setHomeData] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { setNowPlaying } = usePlayer();
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetchHomeHits();
  }, []);

  const fetchHomeHits = async () => {
    setLoading(true);
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=Laura+Branigan&entity=song&limit=15`;
      const response = await fetch(itunesUrl);
      const data = await response.json();
      const mapped = data.results.map((item: any) => ({
        title: item.trackName,
        artist: item.artistName,
        artworkUrl: item.artworkUrl100.replace('100x100', '600x600'),
      }));
      setHomeData(mapped);
    } catch (error) {
      console.error('Home hits fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchMusic = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(text)}&entity=song&limit=20`;
      const itunesResponse = await fetch(itunesUrl);
      const itunesData = await itunesResponse.json();

      let mappedResults: Track[] = itunesData.results.map((item: any) => ({
        title: item.trackName,
        artist: item.artistName,
        artworkUrl: item.artworkUrl100.replace('100x100', '600x600'),
      }));

      if (mappedResults.length === 0) {
        const mbUrl = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(text)}&fmt=json`;
        const mbResponse = await fetch(mbUrl);
        const mbData = await mbResponse.json();

        mappedResults = mbData.recordings.slice(0, 10).map((rec: any) => {
          const artist = rec['artist-credit']?.map((ac: any) => ac.name).join(', ') || 'Unknown Artist';
          const releaseGroupId = rec.releases?.[0]?.['release-group']?.id;
          return {
            title: rec.title,
            artist,
            artworkUrl: releaseGroupId
              ? `https://coverartarchive.org/release-group/${releaseGroupId}/front`
              : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
          };
        });
      }

      setResults(mappedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackPress = useCallback((track: Track) => {
    setNowPlaying(track);
    setQuery('');
    setResults([]);
    setSearchFocused(false);
  }, [setNowPlaying]);

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <View style={styles.header}>
        <Text style={styles.title}>VibeVault</Text>
      </View>

      <Text style={styles.sectionTitle}>Featured: Laura Branigan</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <FlashList
          data={homeData}
          renderItem={({ item }) => <TrackItem item={item} onPress={handleTrackPress} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.scrollContent}
        />
      </View>

      {/* Search Overlay */}
      <View style={[styles.searchOverlay, searchFocused && styles.searchOverlayActive]}>
        <BlurView intensity={80} tint="dark" style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists..."
            placeholderTextColor="#888"
            value={query}
            onChangeText={searchMusic}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => !query && setSearchFocused(false)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </BlurView>

        {searchFocused && (
          <View style={styles.resultsWrapper}>
            <FlashList
              data={results}
              renderItem={({ item }) => <TrackItem item={item} onPress={handleTrackPress} />}
              ListHeaderComponent={loading ? <ActivityIndicator color="white" style={{ marginTop: 20 }} /> : null}
              contentContainerStyle={styles.resultsContent}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  headerArea: {
    marginBottom: 10,
  },
  header: {
    paddingTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 25,
    marginBottom: 15,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 10,
    paddingTop: 50,
  },
  searchOverlayActive: {
    bottom: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  resultsWrapper: {
    flex: 1,
    marginTop: 10,
  },
  resultsContent: {
    paddingBottom: 100,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  resultArt: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  resultInfo: {
    marginLeft: 15,
    flex: 1,
  },
  resultTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultArtist: {
    color: '#888',
    fontSize: 14,
  },
});
