import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, Text, ScrollView } from 'react-native';
import { AppColors } from '../../constants/Color';
import { useSelector } from 'react-redux';
import DatabaseService from '../../services/DataService';
import { setToast } from '../../store/slices/deviceSlice';
import { store } from '../../store/store';
import { constants } from '../../constants/Data';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselItem {
    id: number;
    title: string;
    image: any;
    description: string;
}

const Home = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const device = useSelector((state: any) => state.device);

    useEffect(() => {
        const db = DatabaseService.getInstance();
        db.getVersesById(100).then((data) => {
            console.log('data', data);
        });
        db.getBooksById(2).then((b: any) => {
            console.log('book from getBooksById', b);
        })
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        width: '100%',
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
});

export default Home; 