import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View, StyleSheet, Image, Dimensions, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';

import { ReadingProgressCard, VerseOfTheDayCard } from '../../components/HomeComponent';
import DatabaseService from '../../services/DataService';
import { AppColors } from '../../constants/Color';

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
    // const [currentRead, setCurrentRead] = useState(reader.currentRead);

    useEffect(() => {
        // const db = DatabaseService.getInstance();
        // db.getVersesById(100).then((data) => {
        //     console.log('data', data);
        // });
        // db.getBooksById(2).then((b: any) => {
        //     console.log('book from getBooksById', b);
        // })
        DatabaseService.getInstance().getTodayNotifications().then((result: any) => {
            // console.log('getFutureNotifications', result);
            if (result.length > 0) {
                setTodayVerse(result[0]);
            }
        });
        DatabaseService.getInstance().seedAudioMilestone23().then((result: any) => {
            // console.log('seedAudioMilestone23', result)
        })

        DatabaseService.getInstance().seedAudioMilestone24().then((result: any) => {
            // console.log('seedAudioMilestone24', result)
        })
        // console.log('[HOME]reader', reader.currentRead);
    }, []);

    const carouselItems: CarouselItem[] = [
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

    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / screenWidth);
        setActiveIndex(index);
    };

    const handleShare = async () => {
        try {
            const result = await Share.share({
                title: 'Daily Verse',
                message:
                    `${todayVerse?.text_hd || ''} \n\n ${todayVerse?.book_name + " " + todayVerse?.chapter_number + ":" + todayVerse?.verse_number}`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error: any) {
            Alert.alert(error.message);
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {carouselItems.map((item) => (
                    <View key={item.id} style={styles.slide}>
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
                        key={index}
                        style={[
                            styles.dot,
                            index === activeIndex && styles.activeDot
                        ]}
                    />
                ))}
            </View>
            <View></View>
            <View style={styles.currentReadContainer}>
                {
                    reader.currentRead.bookName && (
                        <TouchableOpacity style={[styles.currentReadContent, { backgroundColor: device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDark }]}
                            onPress={() => {
                                //console.log('reader.currentRead', reader.currentRead);
                                navigation.navigate('Reader', { book: reader.currentRead.bookName, chapter: reader.currentRead.chapterNumber, chapterId: reader.currentRead.chapterId, verse: reader.currentRead.verseId });
                            }}>
                            <View style={styles.currentReadVerse}>
                                <Image source={require('../../assets/images/continue.png')} style={styles.currentReadImage} />
                                <Text style={[styles.currentReadTitle, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Continue Reading</Text>
                            </View>
                            <View style={styles.currentReadVerse}>
                                <Text style={[styles.currentReadVerseText, { color: AppColors.primaryDark }]}>{reader.currentRead.bookName + " " + reader.currentRead.chapterNumber + ":" + reader.currentRead.verseNumber}</Text>
                                <FontAwesome6 name="arrow-right" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} />
                            </View>
                        </TouchableOpacity>
                    )
                }
                {/* <View style={[styles.currentReadContent, { backgroundColor: device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDark }]}>
                    <View style={styles.currentReadVerse}>
                        <Image source={require('../../assets/images/continue.png')} style={styles.currentReadImage} />
                        <Text style={[styles.currentReadTitle, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Continue Reading</Text>
                    </View>
                    <View style={styles.currentReadVerse}>
                        <Text style={[styles.currentReadVerseText, { color: AppColors.primaryDark }]}>{reader.currentRead.bookName + " " + reader.currentRead.chapterNumber + ":" + reader.currentRead.verseNumber}</Text>
                        <FontAwesome6 name="arrow-right" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} />
                    </View>
                </View> */}
                <View style={styles.homeContainer}>
                    <VerseOfTheDayCard
                        verse={todayVerse?.text_hd || ''}
                        reference={todayVerse?.book_name + " " + todayVerse?.chapter_number + ":" + todayVerse?.verse_number}
                        onShare={handleShare}
                    />
                    <View style={{ height: 16 }} />
                    <ReadingProgressCard progress={reader.currentRead.progress || 0} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
        // backgroundColor: AppColors.appBackgroundGrey,
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
        top: 165,
        width: '100%'
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
        // backgroundColor: '#dac2c2',

        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
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
        // position: 'absolute',
        // top: -50,
        // left: 0,
        // right: 0,
        // zIndex: 1000,
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
    }
});

export default Home; 