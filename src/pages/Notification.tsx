import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SoundPlayer from 'react-native-sound-player';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Alert, TouchableOpacity } from 'react-native';

import NormalHeader from '../components/NormalHeader';
import DatabaseService from '../services/DataService';
import { AppColors } from '../constants/Color';

const Notification = () => {

  const device = useSelector((state: any) => state.device);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    // const hd = require('../assets/seeder/19.json')
    // const en = require('../assets/seeder/psalms.json')
    // hd.map((item: any) => {
    //     item.text_en = en.find((enItem: any) => Number(enItem.chapter_id) === item.chapter_id && Number(enItem.verse_number) === item.verse_number)?.text_en
    //     item.chapter_en = en.find((enItem: any) => Number(enItem.chapter_id) === item.chapter_id)?.chapter_en
    //     item.chapter_id = Number(item.chapter_id)
    //     item.verse_number = Number(item.verse_number)
    // })
    // const hd = require('../assets/seeder/19_f.json')
    // hd.map((item: any, index: number) => {
    //     item.id = index + 1214
    // })
    // console.log('hd', JSON.stringify(hd))

    DatabaseService.getInstance().getNotifications().then((result: any) => {
      if (result) {
        const notiList = result.map((item: any) => {
          return {
            ...item,
            date: item.date.split('T')[0]
          }
        }).filter((item: any) => new Date(item.date) <= new Date());
        setNotifications(notiList);
      }
    });
    // getBooks().then((data) => {
    //   console.log(data)
    // })
    // DatabaseService.getInstance().calcReadingProgress().then((result: any) => {
    //   console.log('[Notification] Reading Progress:', result);
    // })
    // const onFinished = () => setIsPlaying(false);
    // const onFinishedLoading = ({ duration }: { duration: number }) => {
    //     setDuration(duration);
    // };

    // SoundPlayer.onFinishedPlaying(onFinished);
    // SoundPlayer.onFinishedLoading(onFinishedLoading as any);

    // const interval = setInterval(async () => {
    //     try {
    //         const info = await SoundPlayer.getInfo();
    //         setCurrentTime(info.currentTime);
    //     } catch (e) {
    //         // ignore before loaded
    //     }
    // }, 500);

    // return () => {
    //     clearInterval(interval);
    //     SoundPlayer.unmount();
    // };
  }, []);

  // const sound = new Sound(require('../assets/audio/Psalm-00101.m4a'), (error) => {
  //     if (error) {
  //       console.log('Failed to load the sound', error);
  //     }
  //   });

  const play = async () => {
    try {

      SoundPlayer.playSoundFile("psalm00101", "m4a")
      // SoundPlayer.playAsset(require('../assets/audio/psalm00101.m4a'));
      console.log('playing song')
      const info = await SoundPlayer.getInfo() // Also, you need to await this because it is async
      console.log('getInfo', info)
      //   setIsPlaying(true);
      // sound.play();
      setIsPlaying(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const pause = () => {
    try {
      SoundPlayer.pause();
      // sound.pause();
      setIsPlaying(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const resume = () => {
    try {
      SoundPlayer.resume();
      setIsPlaying(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const stop = () => {
    try {
      SoundPlayer.stop();
      setIsPlaying(false);
      setCurrentTime(0);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const formatTime = (sec: number) => {
    if (!sec) return '0:00';
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    const m = Math.floor(sec / 60);
    return `${m}:${s}`;
  };

  const renderItem = ({ item }: { item: any }) => {
    return <View style={[styles.itemContainer, { backgroundColor: device.theme ? '#fff' : '#000' }]}>
      <Text style={[styles.itemText, { color: device.theme ? '#000' : '#fff' }]}>{item.text_hd}</Text>
      <View style={styles.referenceContainer}>
        <Text style={[styles.datetimeText, { color: device.theme ? '#000' : '#fff' }]}>{item.date}</Text>
        <Text style={[styles.referenceText, { color: device.theme ? '#000' : '#fff' }]}>{item.book_name + " " + item.chapter_number + ":" + item.verse_number}</Text>
      </View>
    </View>;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
      <NormalHeader title="Notification" backButton={true} />
      {/* <View style={styles.contentContainer}>
      <TouchableOpacity onPress={play}>
        <Text>Play</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={pause}>
        <Text>Pause</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={resume}>
        <Text>Resume</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={stop}>
        <Text>Stop</Text>
      </TouchableOpacity>
      <Text>{currentTime}</Text>
      <Text>{duration}</Text>
       */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item, index) => "notification-" + index.toString()}
        ListEmptyComponent={<Text style={{ color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }}>Not found</Text>}
        showsVerticalScrollIndicator={false}
        style={styles.listContainer}
        contentContainerStyle={[{ paddingHorizontal: 16, paddingVertical: 8 }]}
      />
      {/* </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'column',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    paddingVertical: 16,
    // backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    // marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  itemText: {
    fontSize: 16,
    // fontWeight: 'bold',
  },
  referenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  datetimeText: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 12,
    color: "#666",
    textAlign: "right"
  },
  referenceText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    color: "#000",
    textAlign: "right"
  },
});

export default Notification;