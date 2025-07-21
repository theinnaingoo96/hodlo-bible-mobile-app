import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { StyleSheet, View, Dimensions, PanResponder, Animated, CursorValue, TouchableOpacity, Text, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

import TermsIcon from '../../components/icons/setting/UpdateIcon';
import CustomAlert from '../../components/CustomAlert';
import { AppColors } from '../../constants/Color';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface SplitReaderViewProps {
    verses: any[];
    onStartBookmark: (verse: any) => void;
    onNextChapter: () => void;
    onPreviousChapter: () => void;
}

const SplitReaderView: React.FC<SplitReaderViewProps> = ({ verses, onStartBookmark, onNextChapter, onPreviousChapter }) => {
    const device = useSelector((state: any) => state.device);
    const deviceHeight = Dimensions.get('window').height;
    const deviceWidth = Dimensions.get('window').width;

    const [offset, setOffset] = useState(0);
    const [topHeight, setTopHeight] = useState(40);
    const [bottomHeight, setBottomHeight] = useState(40);
    const [leftWidth, setLeftWidth] = useState(40);
    const [rightWidth, setRightWidth] = useState(40);
    const [isDividerClicked, setIsDividerClicked] = useState(false);
    const [isViewChangeAlertVisible, setIsViewChangeAlertVisible] = useState(false);
    const [dividerMode, setDividerMode] = useState('horizontal'); // horizontal or vertical
    const [localVerses, setLocalVerses] = useState<any[]>([]);
    const topRef = useRef<ScrollView>(null);
    const bottomRef = useRef<ScrollView>(null);
    const leftRef = useRef<ScrollView>(null);
    const rightRef = useRef<ScrollView>(null);
    const isSyncing = useRef(false);

    const topHeights = useRef({ content: 1, layout: 1 });
    const bottomHeights = useRef({ content: 1, layout: 1 });
    const leftHeights = useRef({ content: 1, layout: 1 });
    const rightHeights = useRef({ content: 1, layout: 1 });
    // const leftWidths = useRef({ content: 1, layout: 1 });
    // const rightWidths = useRef({ content: 1, layout: 1 });

    const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity
    const translateY = useRef(new Animated.Value(20)).current; // Position
    const hideTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        showFAB();
        setTopHeight(deviceHeight / 2);
        setBottomHeight(deviceHeight / 2);
        setLeftWidth(deviceWidth / 2);
        setRightWidth(deviceWidth / 2);
    }, []);

    useEffect(() => {
        console.log('verses from View', verses);
        setLocalVerses(verses);
    }, [verses]);

    const verticalPanResponder = useRef(
        PanResponder.create({
            //   onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderGrant: (e, gestureState) => {
                setOffset(e.nativeEvent.pageY);
                setIsDividerClicked(true);
            },

            onPanResponderMove: (e, gestureState) => {
                const newBottomHeight =
                    gestureState.moveY > deviceHeight - 40
                        ? 40
                        : deviceHeight - gestureState.moveY;
                setBottomHeight(newBottomHeight);
                setOffset(e.nativeEvent.pageY);
            },

            onPanResponderRelease: (e, gestureState) => {
                setOffset(e.nativeEvent.pageY);
                setIsDividerClicked(false);
            },
        })
    ).current;

    const horizontalPanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderGrant: (e, gestureState) => {
                setOffset(e.nativeEvent.pageX);
                setIsDividerClicked(true);
            },

            onPanResponderMove: (e, gestureState) => {
                const newLeftWidth =
                    gestureState.moveX > deviceWidth - 40
                        ? 40
                        : deviceWidth - gestureState.moveX;
                setLeftWidth(newLeftWidth);
                setOffset(e.nativeEvent.pageX);
            },

            onPanResponderRelease: (e, gestureState) => {
                setOffset(e.nativeEvent.pageX);
                setIsDividerClicked(false);
            },
        })
    ).current;

    const handleViewChange = () => {
        console.log('handleViewChange');
        setDividerMode(dividerMode == "horizontal" ? "vertical" : "horizontal");
        setIsViewChangeAlertVisible(false);
    }

    const getScrollRatio = (scrollY: number, from: any, to: any) => {
        const fromScrollable = from.content - from.layout;
        const toScrollable = to.content - to.layout;
        if (fromScrollable <= 0 || toScrollable <= 0) return 0;
        return (scrollY / fromScrollable) * toScrollable;
    };

    const onTopScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        // console.log('onTopScroll', e);
        if (isSyncing.current) return;
        const scrollY = e.nativeEvent.contentOffset.y;
        const syncedY = getScrollRatio(scrollY, topHeights.current, bottomHeights.current);

        isSyncing.current = true;
        bottomRef.current?.scrollTo({ y: syncedY, animated: false });
        setTimeout(() => (isSyncing.current = false), 10);
    }

    const onBottomScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        // console.log('onBottomScroll', e);
        if (isSyncing.current) return;
        const scrollY = e.nativeEvent.contentOffset.y;
        const syncedY = getScrollRatio(scrollY, bottomHeights.current, topHeights.current);

        isSyncing.current = true;
        topRef.current?.scrollTo({ y: syncedY, animated: false });
        setTimeout(() => (isSyncing.current = false), 10);
    }

    const onLeftScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        // console.log('onLeftScroll', e);
        if (isSyncing.current) return;
        const scrollY = e.nativeEvent.contentOffset.y;
        const syncedY = getScrollRatio(scrollY, leftHeights.current, rightHeights.current);

        isSyncing.current = true;
        rightRef.current?.scrollTo({ y: syncedY, animated: false });
        setTimeout(() => (isSyncing.current = false), 10);
    }
    const onRightScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        // console.log('onRightScroll', e);
        if (isSyncing.current) return;
        const scrollY = e.nativeEvent.contentOffset.y;
        const syncedY = getScrollRatio(scrollY, rightHeights.current, leftHeights.current);

        isSyncing.current = true;
        leftRef.current?.scrollTo({ y: syncedY, animated: false });
        setTimeout(() => (isSyncing.current = false), 10);
    }

    const showFAB = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const hideFAB = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 20,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // const handleScroll = () => {
    //     hideFAB();
    //     if (hideTimer.current) clearTimeout(hideTimer.current);
    //     hideTimer.current = setTimeout(() => {
    //         showFAB();
    //     }, 300);
    // };

    const VerseComponent = ({ verse, language }: any) => {
        return (
            <>
                <TouchableOpacity style={styles.verseContainer}
                    activeOpacity={0.5}
                    onLongPress={() => onStartBookmark(verse)}
                    onPress={() => { }}
                >
                    <Text style={[styles.verseNumber,]}>{verse.number}</Text>
                    <Text style={[styles.verseText, {
                        color: device.theme ? AppColors.appTextBlack : AppColors.lightGrey,
                        backgroundColor: verse.bookmark ? verse.bookmark_color : 'transparent'
                    }]}>{verse['text_' + language]}</Text>
                </TouchableOpacity>
                {
                    language === 'hd' && (
                        <View style={{ height: 3 }} />
                    )
                }
            </>
        );
    };

    const swipeGesture = Gesture.Pan()
        .onEnd((event) => {
            if (event.translationX > 0) {
                console.log('Swiped right!');
            } else if (event.translationX < 0) {
                console.log('Swiped left!');
            }
            if (event.translationY > 0) {
                console.log('Swiped down!');
            } else if (event.translationY < 0) {
                console.log('Swiped up!');
            }
        });

    return (
        <View style={[styles.content, { flexDirection: dividerMode === "horizontal" ? "column" : "row" }]}>
            {
                device.language !== 'en' && device.language !== 'mm' ? (
                    <ScrollView
                        onScrollBeginDrag={hideFAB}
                        onMomentumScrollEnd={showFAB}
                        style={{ height: topHeight }}
                    >
                        {verses.map((item: any, index: number) => (
                            <VerseComponent key={`single-view-${index}`} verse={item} language={'hd'} />
                        ))}
                    </ScrollView>
                ) : (

                    dividerMode === "horizontal" ? (
                        <>
                            <Animated.View
                                style={[
                                    { minHeight: 40, flex: 1 },
                                    { height: topHeight },
                                ]}
                            >
                                <ScrollView
                                    ref={topRef}
                                    style={{ flex: 1 }}
                                    scrollEnabled={true}
                                    onScroll={onTopScroll}
                                    onScrollBeginDrag={hideFAB}
                                    onMomentumScrollEnd={showFAB}
                                    showsVerticalScrollIndicator={false}
                                    onContentSizeChange={(w, h) => (topHeights.current.content = h)}
                                    onLayout={(e) => (topHeights.current.layout = e.nativeEvent.layout.height)}
                                >
                                    {verses.map((item: any, index: number) => (
                                        <VerseComponent key={`top-${index}`} verse={item} language={'hd'} />
                                    ))}
                                </ScrollView>
                            </Animated.View>
                            <View
                                style={{
                                    height: 12,
                                    backgroundColor: '#aaa',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                // style={[
                                //     styles.divider,
                                //     isDividerClicked
                                //         ? { backgroundColor: '#666' }
                                //         : { backgroundColor: '#e2e2e2' },
                                // ]}
                                {...verticalPanResponder.panHandlers}
                            >
                                <TouchableOpacity style={styles.ellipsisButton} onPress={() => {
                                    console.log('onPress');
                                    setIsViewChangeAlertVisible(true);
                                }} >
                                    <View style={styles.dragHandle} />
                                </TouchableOpacity>
                            </View>
                            <Animated.View
                                style={[
                                    { minHeight: 40 },
                                    { height: bottomHeight },
                                ]}
                            >
                                <ScrollView
                                    ref={bottomRef}
                                    style={{ flex: 1 }}
                                    scrollEnabled={true}
                                    onScroll={onBottomScroll}
                                    onScrollBeginDrag={hideFAB}
                                    onMomentumScrollEnd={showFAB}
                                    showsVerticalScrollIndicator={false}
                                    onContentSizeChange={(w, h) => (bottomHeights.current.content = h)}
                                    onLayout={(e) => (bottomHeights.current.layout = e.nativeEvent.layout.height)}
                                >
                                    {verses.map((item: any, index: number) => (
                                        <VerseComponent key={`bottom-${index}`} verse={item} language={device.language} />
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        </>
                    ) : (
                        <>
                            <Animated.View
                                style={[
                                    { minWidth: 40, flex: 1 },
                                    { width: leftWidth },
                                ]}
                            >
                                <ScrollView
                                    ref={leftRef}
                                    style={{ flex: 1 }}
                                    scrollEnabled={true}
                                    onScroll={onLeftScroll}
                                    onScrollBeginDrag={hideFAB}
                                    onMomentumScrollEnd={showFAB}
                                    showsVerticalScrollIndicator={false}
                                    onContentSizeChange={(w, h) => (leftHeights.current.content = h)}
                                    onLayout={(e) => (leftHeights.current.layout = e.nativeEvent.layout.height)}
                                >
                                    {verses.map((item: any, index: number) => (
                                        <VerseComponent key={`left-${index}`} verse={item} language={'hd'} />
                                    ))}
                                </ScrollView>
                            </Animated.View>
                            <View
                                style={[
                                    styles.dividerVertical,
                                    isDividerClicked
                                        ? { backgroundColor: '#666' }
                                        : { backgroundColor: '#e2e2e2' },
                                ]}
                                {...horizontalPanResponder.panHandlers}
                            >
                                <TouchableOpacity style={styles.ellipsisButtonVertical} onPress={() => {
                                    setIsViewChangeAlertVisible(true);
                                }} >
                                    {/* <View style={styles.dragHandleVertical} /> */}
                                    <TermsIcon />
                                </TouchableOpacity>
                            </View>
                            <Animated.View
                                style={[
                                    { minWidth: 40 },
                                    { width: rightWidth },
                                ]}
                            >
                                <ScrollView
                                    ref={rightRef}
                                    style={{ flex: 1 }}
                                    scrollEnabled={true}
                                    onScroll={onRightScroll}
                                    onScrollBeginDrag={hideFAB}
                                    onMomentumScrollEnd={showFAB}
                                    showsVerticalScrollIndicator={false}
                                    onContentSizeChange={(w, h) => (rightHeights.current.content = h)}
                                    onLayout={(e) => (rightHeights.current.layout = e.nativeEvent.layout.height)}
                                >
                                    {verses.map((item: any, index: number) => (
                                        <VerseComponent key={`right-${index}`} verse={item} language={device.language} />
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        </>
                    )
                )
            }
            <Animated.View
                style={[
                    styles.fabContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY }],
                    },
                ]}
            >
                <TouchableOpacity style={[styles.fabLeft, { backgroundColor: device.theme ? AppColors.primaryDark : AppColors.appTextWhite }]}
                    onPress={onPreviousChapter}
                >
                    <FontAwesome6 name="angle-left" iconStyle="solid" color={device.theme ? AppColors.appTextWhite : AppColors.primaryDark} size={15} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.fabLeft, { backgroundColor: device.theme ? AppColors.primaryDark : AppColors.appTextWhite }]}
                    onPress={onNextChapter}
                >
                    <FontAwesome6 name="angle-right" iconStyle="solid" color={device.theme ? AppColors.appTextWhite : AppColors.primaryDark} size={15} />
                </TouchableOpacity>
            </Animated.View>
            <CustomAlert
                visible={isViewChangeAlertVisible}
                title="Change Split View"
                message={"Are you sure you want change view to " + (dividerMode == "horizontal" ? "vertical?" : "horizontal?")}
                onClose={() => setIsViewChangeAlertVisible(false)}
                onConfirm={handleViewChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    divider: {
        height: 12,
        width: '100%',
        backgroundColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'row-resize' as CursorValue,
    },
    dividerVertical: {
        height: '100%',
        width: 12,
        backgroundColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'row-resize' as CursorValue,
    },
    dragHandle: {
        width: '50%',
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
    },
    ellipsisButton: {
        width: '20%',
        height: 10,
        justifyContent: 'center',
        alignItems: 'center',
        verticalAlign: 'middle',
    },
    ellipsisButtonVertical: {
        width: 30,
        height: 30,
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: '-50%' }],
        justifyContent: 'center',
        alignItems: 'center',
        verticalAlign: 'middle',
        backgroundColor: AppColors.lightGrey,
        borderRadius: '50%'
    },
    dragHandleVertical: {
        width: 4,
        height: '50%',
        backgroundColor: '#444',
        borderRadius: 2,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    fabLeft: {
        borderRadius: 30,
        elevation: 4,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabRight: {
        backgroundColor: '#ff3b30',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 30,
        elevation: 4,
    },
    fabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default SplitReaderView;
