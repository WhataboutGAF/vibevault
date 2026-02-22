import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated, Dimensions, PanResponder } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Player() {
    const { nowPlaying, isLoading, isPlaying, togglePlayPause } = usePlayer();
    const [isExpanded, setIsExpanded] = useState(false);

    const slideAnim = useRef(new Animated.Value(0)).current;
    const expandAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isLoading) {
            Animated.spring(slideAnim, {
                toValue: -10,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
            }).start();
        }
    }, [isLoading]);

    useEffect(() => {
        Animated.spring(expandAnim, {
            toValue: isExpanded ? 1 : 0,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
        }).start();
    }, [isExpanded]);

    if (!nowPlaying) return null;

    const fullScreenStyle = {
        height: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [64, SCREEN_HEIGHT],
        }),
        borderRadius: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [12, 0],
        }),
        bottom: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 0],
        }),
        left: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 0],
        }),
        right: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 0],
        }),
    };

    const miniPlayerOpacity = expandAnim.interpolate({
        inputRange: [0, 0.2, 1],
        outputRange: [1, 0, 0],
    });

    const fullPlayerOpacity = expandAnim.interpolate({
        inputRange: [0, 0.8, 1],
        outputRange: [0, 0, 1],
    });

    return (
        <Animated.View style={[styles.wrapper, fullScreenStyle, { transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => !isExpanded && setIsExpanded(true)}
                style={styles.touchable}
            >
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
                    {/* Mini Player */}
                    <Animated.View style={[styles.content, { opacity: miniPlayerOpacity }]}>
                        <Image source={{ uri: nowPlaying.artworkUrl }} style={styles.albumArt} />
                        <View style={styles.textContainer}>
                            <Text style={styles.title} numberOfLines={1}>{isLoading ? 'Loading...' : nowPlaying.title}</Text>
                            <Text style={styles.artist} numberOfLines={1}>{isLoading ? 'VibeVault' : nowPlaying.artist}</Text>
                        </View>
                        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                            <Ionicons name={isLoading ? "refresh" : (isPlaying ? "pause-circle" : "play-circle")} size={40} color="white" />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Full Player */}
                    <Animated.View style={[styles.fullPlayerContent, { opacity: fullPlayerOpacity }]}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setIsExpanded(false)}>
                            <Ionicons name="chevron-down" size={30} color="white" />
                        </TouchableOpacity>

                        <Image source={{ uri: nowPlaying.artworkUrl }} style={styles.fullAlbumArt} />

                        <View style={styles.fullInfo}>
                            <Text style={styles.fullTitle}>{nowPlaying.title}</Text>
                            <Text style={styles.fullArtist}>{nowPlaying.artist}</Text>
                        </View>

                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBar} />
                            <View style={styles.progressTime}>
                                <Text style={styles.timeText}>0:00</Text>
                                <Text style={styles.timeText}>3:45</Text>
                            </View>
                        </View>

                        <View style={styles.controls}>
                            <TouchableOpacity><Ionicons name="shuffle" size={28} color="#888" /></TouchableOpacity>
                            <TouchableOpacity><Ionicons name="play-skip-back" size={36} color="white" /></TouchableOpacity>
                            <TouchableOpacity onPress={togglePlayPause}>
                                <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={80} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity><Ionicons name="play-skip-forward" size={36} color="white" /></TouchableOpacity>
                            <TouchableOpacity><Ionicons name="repeat" size={28} color="#888" /></TouchableOpacity>
                        </View>
                    </Animated.View>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        overflow: 'hidden',
        zIndex: 100,
        flex: 1,
    },
    touchable: {
        flex: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        height: 64,
    },
    albumArt: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    artist: {
        color: '#b3b3b3',
        fontSize: 12,
    },
    playButton: {
        paddingHorizontal: 8,
    },
    fullPlayerContent: {
        flex: 1,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        left: 30,
    },
    fullAlbumArt: {
        width: SCREEN_HEIGHT * 0.4,
        height: SCREEN_HEIGHT * 0.4,
        borderRadius: 20,
        marginBottom: 40,
    },
    fullInfo: {
        width: '100%',
        marginBottom: 30,
    },
    fullTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    fullArtist: {
        color: '#b3b3b3',
        fontSize: 20,
    },
    progressBarContainer: {
        width: '100%',
        marginBottom: 30,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        width: '100%',
    },
    progressTime: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    timeText: {
        color: '#888',
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
});
