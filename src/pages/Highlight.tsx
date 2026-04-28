import { useSelector } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DatabaseService from '../services/DatabaseService';
import CustomAlert from '../components/CustomAlert';
import { AppColors } from '../constants/Color';
import NormalHeader from '../components/NormalHeader';
import SmoothSwipeRow from '../components/SmoothSwipeRow';
import { StatusBar } from 'react-native';

const Highlight = () => {
  const device = useSelector((state: any) => state.device);
  const isFocused = useIsFocused();
  const [highlights, setHighlights] = useState([]);
  const navigation = useNavigation();
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null);
  const rowRefs = useRef(new Map());
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getHighlight();
  }, [isAlertVisible]);

  const getHighlight = () => {
    DatabaseService.getInstance()
      .getHighlights()
      .then((result: any) => {
        // console.log(result);
        setHighlights(result.map((item: any) => ({ ...item, visible: false })));
        // Alert.alert('result')
      });
  };

  const hideMenu = (item: any) => {
    const temp: any = highlights.map((highlight: any) => ({
      ...highlight,
      visible: highlight.id === item.id ? false : highlight.visible,
    }));
    setHighlights(temp);
  };

  const showMenu = (item: any) => {
    // console.log('showMenu', item);
    const temp: any = highlights.map((highlight: any) => ({
      ...highlight,
      visible: highlight.id === item.id ? true : highlight.visible,
    }));
    setHighlights(temp);
  };

  const deleteHighlight = (item: any) => {
    setIsAlertVisible(true);
    setSelectedHighlight(item);
  };

  const handleDeleteHighlightPress = (item: any) => {
    setIsAlertVisible(true);
  };

  const handleDeleteHighlight = (item: any) => {
    // console.log('handleDeleteHighlight');
    DatabaseService.getInstance()
      .clearHighlightById(item.id)
      .then((result: any) => {
        setIsAlertVisible(false);
        getHighlight();
        // console.log('result', result);
      });
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <SmoothSwipeRow
        ref={ref => { rowRefs.current.set(item.id, ref as any); }}
        item={item}
        onOpen={openedId => rowRefs.current.forEach((ref, id) => id !== openedId && ref?.close())}
        onDelete={() => handleDeleteHighlightPress(item)}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: device.theme
            ? AppColors.appBackgroundGrey
            : AppColors.appBackgroundDarkTint,
        },
      ]}>
      <StatusBar
        backgroundColor={device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDark}
        barStyle={device.theme ? "dark-content" : "light-content"}
        translucent={true}
      />
      <NormalHeader title="Highlight" backButton={true} />
      <View style={{ height: 16 }} />
      <FlatList
        data={highlights}
        renderItem={renderItem}
        keyExtractor={item => 'highlight-' + item.id.toString()}
        ListEmptyComponent={
          <Text
            style={{
              color: device.theme
                ? AppColors.appTextBlack
                : AppColors.appTextWhite,
            }}>
            No Highlights found
          </Text>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        style={styles.listContainer}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
      <CustomAlert
        visible={isAlertVisible}
        title="Delete Highlight"
        message="Are you sure you want to delete this highlight?"
        onClose={() => setIsAlertVisible(false)}
        onConfirm={() => handleDeleteHighlight(selectedHighlight)}
      />
      {/*
      <Modal
        transparent
        visible={shareModalVisible}
        animationType="fade"
        navigationBarTranslucent={true}>
        <ShareModal
          setShareModalVisible={setShareModalVisible}
          selectedVerse={shareBookmark}
          bookName={shareBookmark?.book}
          chapterNumber={shareBookmark?.chapter}
        />
      </Modal> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  listContainer: {
    width: '100%',
    flex: 1,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
    width: '100%',
    marginBottom: 16,
    paddingLeft: 16,
  },
  verseItem: {
    width: '100%',
    paddingVertical: 16,
    // paddingLeft: 16,
    borderRadius: 10,
    marginBottom: 16,
    flexDirection: 'column',
    shadowColor: AppColors.appTextBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verseTextContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  verseLocation: {
    fontSize: 14,
    color: AppColors.appTextBlack,
    marginBottom: 4,
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  verseText: {
    fontSize: 16,
    color: AppColors.appTextBlack,
    marginBottom: 4,
    textAlign: 'left',
    flex: 1,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  optionsButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'pink'
  },
});

export default Highlight;
