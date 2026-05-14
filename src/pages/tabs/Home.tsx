import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View, StyleSheet, Image, Dimensions, Text, ScrollView, TouchableOpacity, Alert, Share, Modal } from 'react-native';

import { ReadingProgressCard, VerseOfTheDayCard } from '../../components/HomeComponent';
import DatabaseService from '../../services/DatabaseService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '../../constants/Color';
import ShareModal from '../../components/modals/ShareModal';
import { setDatabaseVersion, setLoading, setToast } from '../../store/slices/deviceSlice';
import UpdateService from '../../services/UpdateService';
import ProgressBar from '../../components/ProgressBar';
import useInternetStatus from '../../hooks/useInternetStatus';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselItem {
    id: number;
    title: string;
    image: any;
    description: string;
}

const Home = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [todayVerse, setTodayVerse] = useState<any>(null);
    const device = useSelector((state: any) => state.device);
    const reader = useSelector((state: any) => state.reader);
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const networkStatus = useInternetStatus()

    const tempCarouselItems: CarouselItem[] = [
        {
            id: 1,
            title: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
            image: require('../../assets/images/0.jpg'),
            description: 'Joshua 1:9'
        },
        {
            id: 2,
            title: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.',
            image: require('../../assets/images/1.jpg'),
            description: '1 Corinthians 13:4-5'
        },
        {
            id: 3,
            title: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
            image: require('../../assets/images/2.jpg'),
            description: 'Philippians 4:6-7'
        }
    ];

    const [carouselItems, setCarouselItems] = useState<CarouselItem[]>(tempCarouselItems);

    useEffect(() => {
        DatabaseService.getInstance().getTodayNotifications().then((result: any) => {
            if (result.length > 0) {
                setTodayVerse(result[0]);
                // console.log('[HOME] getFutureNotifications', result[0]);
            }
        }).catch((error: any) => {
            console.error('[HOME] getFutureNotifications error', error);
        });

        DatabaseService.getInstance().getRandomVerse(3).then((result: any) => {
            if (result.length > 0) {
                const verses: CarouselItem[] = result.map((item: any, index: number) => {
                    return {
                        id: item.id,
                        title: item.text_hd,
                        image: tempCarouselItems[index]?.image || require('../../assets/images/1.jpg'),
                        description: item.book_name + " " + item.chapter + " : " + item.verse
                    };
                });
                setCarouselItems(verses);
            }
        });
    }, []);

    useEffect(() => {
        // console.log('[Home] network', networkStatus.isConnected, networkStatus);
        if (networkStatus.isConnected) {
            checkDatabaseUpdate();
        }
    }, [networkStatus.isConnected]);

    const checkDatabaseUpdate = async () => {
        const db = DatabaseService.getInstance();
        try {
            const dbUpdateInfo = await UpdateService.checkForDatabaseUpdates(device.databaseVersion);
            if (dbUpdateInfo.isAvailable) {
                // dispatch(setLoading(true));
                // console.log('[Splash] Database update available. Starting sync...');
                await db.syncDatabase(dispatch);
                // console.log('[Splash] Database sync completed.');
                // dispatch(setLoading(false));
                dispatch(setDatabaseVersion(dbUpdateInfo.latestBuild + ''));
                dispatch(setToast({ show: true, message: "Database update complete", type: "success", duration: 3000 }))
            } else {
                dispatch(setLoading(false));
            }
        } catch (updateError) {
            // console.log('[Splash] Database update check/sync failed', updateError);
            dispatch(setToast({ show: true, message: "Update failed", type: "error", duration: 3000 }))
        }
    }

    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / screenWidth);
        setActiveIndex(index);
    };

    return (
        <>
            <ScrollView
                style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ height: insets.top }} />
                <View style={styles.carouselWrapper}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={styles.scrollView}
                    >
                        {carouselItems.map((item, index) => (
                            <View key={`carousel-image-${index}`} style={styles.slide}>
                                <Image
                                    source={item.image}
                                    style={styles.carouselImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.carouselContent}>
                                    <Text style={styles.carouselTitle}>{item.title}</Text>
                                    <Text style={styles.carouselDescription}>{item.description}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.dotsContainer}>
                        {carouselItems.map((_, index) => (
                            <View
                                key={`carousel-dot-${index}`}
                                style={[
                                    styles.dot,
                                    index === activeIndex && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <View style={{ height: 150 }} />

                {
                    !device.downloaded && (
                        <View style={styles.downloadProgressContainer}>
                            <ProgressBar progress={device.downloadProgress} color={AppColors.appTextRed} fullsize={true} />
                        </View>
                    )
                }

                <View style={styles.mainContent}>
                    {
                        reader.currentRead.bookName && (
                            <TouchableOpacity style={[styles.currentReadContent, { backgroundColor: device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDark }]}
                                onPress={() => {
                                    navigation.navigate('Reader', { book: reader.currentRead.bookName, chapter: reader.currentRead.chapterNumber, chapterId: reader.currentRead.chapterId, verse: reader.currentRead.verseId });
                                }}>
                                <View style={styles.currentReadVerse}>
                                    <Image source={require('../../assets/images/continue.png')} style={styles.currentReadImage} />
                                    <Text style={[styles.currentReadTitle, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Continue Reading</Text>
                                </View>
                                <View style={styles.currentReadVerse}>
                                    <Text style={[styles.currentReadVerseText, { color: AppColors.primaryDark }]}>{reader.currentRead.bookName + " " + reader.currentRead.chapterNumber}</Text>
                                    <FontAwesome6 name="arrow-right" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} />
                                </View>
                            </TouchableOpacity>
                        )
                    }

                    <View style={styles.homeContainer}>
                        {
                            todayVerse ? (
                                <VerseOfTheDayCard
                                    verse={todayVerse?.text_hd || ''}
                                    reference={todayVerse?.book_name + " " + todayVerse?.chapter + ":" + todayVerse?.verse}
                                    onShare={() => {
                                        setShareModalVisible(true)
                                    }}
                                />
                            ) : (
                                <VerseOfTheDayCard
                                    verse={'No verse of the day available'}
                                    reference={''}
                                    onShare={() => { }}
                                />
                            )
                        }
                        <View style={{ height: 16 }} />
                        <ReadingProgressCard progress={reader.currentRead.progress || 0} />
                    </View>
                </View>
                <Modal
                    transparent
                    visible={shareModalVisible}
                    animationType="fade"
                    statusBarTranslucent={true}>
                    <View style={{ height: insets.top }} />
                    <ShareModal
                        setShareModalVisible={setShareModalVisible}
                        selectedVerse={todayVerse}
                        bookName={todayVerse?.book_name}
                        chapterNumber={todayVerse?.chapter}
                    />
                </Modal>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: screenWidth,
        height: 200,
    },
    carouselImage: {
        width: '100%',
        height: '100%',
    },
    carouselContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        height: 200,
    },
    carouselTitle: {
        color: AppColors.appTextWhite,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    carouselDescription: {
        color: AppColors.appTextWhite,
        fontSize: 14,
        alignSelf: 'flex-end',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        position: 'absolute',
        bottom: 0,
        width: '100%'
    },
    carouselWrapper: {
        height: 200,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    mainContent: {
        marginTop: 16,
        paddingTop: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: AppColors.appTextGrey,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: AppColors.primary,
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    currentReadContainer: {
        flex: 2,
    },
    currentReadImage: {
        width: 40,
        height: 40,
        objectFit: 'cover',
        marginLeft: 15,
        marginVertical: 10,
        marginRight: 10,
        // margin: 20
    },
    currentReadTitle: {
        fontSize: 15,
        // margin: 20,
    },
    currentReadVerseText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 10
    },
    currentReadContent: {
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 5,
        shadowColor: AppColors.appTextBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    currentReadVerse: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15
    },
    homeContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    downloadProgressContainer: {
        position: 'absolute',
        top: 185,
        left: 0,
        right: 0,
    },
});

export default Home; 