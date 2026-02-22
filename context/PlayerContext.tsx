import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as Audio from 'expo-audio';
import { useAudio } from '@/hooks/useAudio';

interface Track {
    title: string;
    artist: string;
    artworkUrl: string;
}

interface PlayerContextType {
    nowPlaying: Track | null;
    setNowPlaying: (track: Track) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    isPlaying: boolean;
    togglePlayPause: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
    const { isLoading, isPlaying, play, togglePlayPause } = useAudio();

    useEffect(() => {
        // Configure audio session for background playback
        Audio.setAudioModeAsync({
            shouldPlayInBackground: true,
            playsInSilentMode: true,
            shouldRouteThroughEarpiece: false,
            interruptionMode: 'doNotMix',
        });
    }, []);

    const playTrack = async (track: Track) => {
        setNowPlaying(track);
        await play(track);
    };

    return (
        <PlayerContext.Provider value={{
            nowPlaying,
            setNowPlaying: playTrack,
            isLoading,
            setIsLoading: () => { },
            isPlaying,
            togglePlayPause
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
