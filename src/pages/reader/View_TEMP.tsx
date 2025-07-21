import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    Dimensions,
    PanResponder,
    Animated,
    CursorValue,
    TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { AppColors } from '../../constants/Color';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

// const { height: sh } = Dimensions.get('window');
// const MIN_HEIGHT = 100;
// const MAX_HEIGHT = sh;

// const DATA = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);

const ReaderView = ({ verses = [], onStartBookmark }: any) => {
    const device = useSelector((state: any) => state.device);
    // const [screenHeight, setScreenHeight] = useState(sh);
    const [maxHeight, setMaxHeight] = useState(0);
    const [minHeight, setMinHeight] = useState(Dimensions.get("window").height / 2);
    const [topHeight, setTopHeight] = useState(0);
    const panY = useRef(new Animated.Value(0)).current;
    const topRef = useRef<ScrollView>(null);
    const bottomRef = useRef<ScrollView>(null);
    const isSyncing = useRef(false);
    const [mode, setMode] = useState<'vertical' | 'horizontal'>('vertical');

    useEffect(() => {
        // console.log('maxHeight', maxHeight);
        // console.log('minHeight', minHeight);
        setMaxHeight(Dimensions.get("window").height);
        setTopHeight(minHeight);
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                console.log('gesture', gesture.dy, minHeight, maxHeight);

                let newHeight = gesture.dy;
                if (newHeight < minHeight) newHeight = minHeight;
                if (newHeight > maxHeight) newHeight = maxHeight;
                setTopHeight(newHeight);
            },
            onPanResponderRelease: () => {
                panY.setValue(0);
            },
        })
    ).current;

    const syncScroll = (y: number, targetRef: React.RefObject<ScrollView | null>) => {
        if (isSyncing.current) return;
        isSyncing.current = true;
        targetRef.current?.scrollTo({ y, animated: false });
        setTimeout(() => {
            isSyncing.current = false;
        }, 10);
    };

    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
        const paddingToBottom = 20; // Adjust as needed
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    const VerseComponent = ({ verse, language }: any) => {
        return (
            <>
                <TouchableOpacity style={styles.verseContainer}
                    activeOpacity={0.5}
                    onLongPress={() => onStartBookmark(verse)}
                    onPress={() => { }}
                >
                    <Text style={styles.verseNumber}>{verse.number}</Text>
                    <Text style={styles.verseText}>{verse['text_' + language]}</Text>

                </TouchableOpacity>
                {
                    language === 'hd' && (
                        <View style={{ height: 3 }} />
                    )
                }
            </>
        );
    };

    return (
        <View style={styles.container} onLayout={(e) => {
            console.log('e', e.nativeEvent.layout.height);
            setMaxHeight(e.nativeEvent.layout.height);
            setTopHeight(e.nativeEvent.layout.height / 2);
        }}>
            {
                device.language === 'hd' ? (

                    <ScrollView
                        ref={topRef}
                        style={{ height: topHeight }}
                    >
                        {verses.map((item: any, index: number) => (
                            <VerseComponent key={`main-${index}`} verse={item} language={'hd'} />
                        ))}
                    </ScrollView>
                ) : (
                    <>
                        <ScrollView
                            ref={topRef}
                            style={{ height: topHeight }}
                            onScroll={(e) => {
                                const y = e.nativeEvent.contentOffset.y;
                                // if (y > 30) {
                                syncScroll(y * 1.1, bottomRef);
                                // } else {
                                //     syncScroll(y + 100, bottomRef);
                                // }
                            }}
                            scrollEventThrottle={16}
                            onMomentumScrollEnd={(e) => {
                                // if (isCloseToBottom(e.nativeEvent)) {
                                //     console.log('onMomentumScrollEnd', e.nativeEvent.contentOffset.y);
                                //     syncScroll(e.nativeEvent.contentOffset.y, bottomRef);
                                // }
                            }}
                        >
                            {verses.map((item: any, index: number) => (
                                <VerseComponent key={`top-${index}`} verse={item} language="hd" />
                            ))}
                        </ScrollView>

                        <Animated.View
                            style={styles.divider}
                            {...panResponder.panHandlers}
                        >
                            {/* <FontAwesome6 name="ellipsis" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} /> */}
                            <View style={styles.dragHandle} />
                        </Animated.View>

                        <ScrollView
                            ref={bottomRef}
                            style={{ flex: 1 }}
                            scrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                        >
                            {verses.map((item: any, index: number) => (
                                <VerseComponent key={`bottom-${index}`} verse={item} language={device.language} />
                            ))}
                        </ScrollView>
                    </>
                )
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    divider: {
        height: 20,
        backgroundColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'row-resize' as CursorValue,
    },
    dragHandle: {
        width: '30%',
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
    },
    verseContainer: {
        // height: 60,
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 8,
        // borderBottomWidth: 1,
        // borderColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    verseNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: AppColors.primaryTint,
        marginTop: 2,
    },
    verseText: {
        fontSize: 16,
        color: AppColors.appTextBlack,
        lineHeight: 27,
    }
});

export default ReaderView;    