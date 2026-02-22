import { useState, useRef, useEffect, useCallback } from 'react';
import * as Audio from 'expo-audio';

interface Track {
    title: string;
    artist: string;
    artworkUrl: string;
}

export function useAudio() {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef<Audio.AudioPlayer | null>(null);

    useEffect(() => {
        return () => {
            if (playerRef.current) {
                // In expo-audio, we should release the player if created manually
                // If it's from createAudioPlayer, we might need to find the remove method
            }
        };
    }, []);

    const fetchStreamUrl = async (track: Track) => {
        const PROXY = "https://corsproxy.io/?";
        const SEARCH_URL = "https://pipedapi.kavin.rocks/search";
        const STREAMS_URL = "https://pipedapi.kavin.rocks/streams/";

        try {
            const searchQuery = encodeURIComponent(`${track.title} ${track.artist}`);
            // 1. Search for the track through the proxy
            const searchResponse = await fetch(`${PROXY}${encodeURIComponent(`${SEARCH_URL}?q=${searchQuery}&filter=music_songs`)}`);
            const searchData = await searchResponse.json();

            if (!searchData.items || searchData.items.length === 0) {
                throw new Error('No stream found');
            }

            const videoId = searchData.items[0].url.split('v=')[1];
            // 2. Fetch stream data through the proxy
            const streamResponse = await fetch(`${PROXY}${encodeURIComponent(STREAMS_URL + videoId)}`);
            const streamData = await streamResponse.json();

            // 3. Find the best audio stream (M4A is prioritized)
            const audioStream = streamData.audioStreams.find((s: any) => s.format === 'M4A' || s.mimeType?.includes('audio/mp4')) || streamData.audioStreams[0];
            return audioStream.url;
        } catch (error) {
            console.error('Failed to fetch stream URL:', error);
            return null;
        }
    };

    const play = useCallback(async (track: Track) => {
        setIsLoading(true);
        try {
            if (playerRef.current) {
                playerRef.current.pause();
            }

            const streamUrl = await fetchStreamUrl(track);
            if (!streamUrl) throw new Error('Stream URL not found');

            // According to expo-audio 2026 standard (and types checked)
            const player = Audio.createAudioPlayer(streamUrl);
            playerRef.current = player;

            player.play();
            setIsPlaying(true);
        } catch (error) {
            console.error('Playback error:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const togglePlayPause = useCallback(async () => {
        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pause();
            setIsPlaying(false);
        } else {
            playerRef.current.play();
            setIsPlaying(true);
        }
    }, [isPlaying]);

    return {
        isLoading,
        isPlaying,
        play,
        togglePlayPause,
    };
}
