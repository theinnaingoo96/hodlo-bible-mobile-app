import React, {useEffect, useState} from 'react';
import {SectionList, View, Text, StyleSheet, SafeAreaView} from 'react-native';
import moment from 'moment';

import DatabaseService from '../services/DataService';
import {AppColors} from '../constants/Color';
import NormalHeader from '../components/NormalHeader';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const ReadingHistory = () => {
  const [sections, setSections] = useState<any[]>([]);
  const device = useSelector((state: any) => state.device);
  const navigation = useNavigation();

  useEffect(() => {
    DatabaseService.getInstance()
      .getReadingHistory()
      .then((result: any) => {
        console.log('result', result);
        if (result.length > 0) {
        setSections(groupHistoryByDate(result));
        }
      });
  }, []);

  const groupHistoryByDate = (rawData: any) => {
    const groups = rawData.reduce((sections: any, item: any) => {
      const date = moment(item.completed_at).calendar(null, {
        sameDay: '[Today]',
        lastDay: '[Yesterday]',
        lastWeek: 'MMMM D, YYYY',
        sameElse: 'MMMM D, YYYY',
      });

      if (!sections[date]) {
        sections[date] = [];
      }
      sections[date].push(item);
      return sections;
    }, {});

    // Convert to SectionList format: [{ title: 'Today', data: [...] }]
    return Object.keys(groups).map(date => ({
      title: date,
      data: groups[date],
    }));
  };

  const renderItem = ({
    item,
    index,
    section,
  }: {
    item: any;
    index: number;
    section: any;
  }) => {
    const isLast = index === section.data.length - 1;

    return (
      <View style={styles.itemWrapper}>
        <View style={styles.timelineContainer}>
          <View style={styles.dot} />
          {!isLast && <View style={styles.verticalLine} />}
        </View>

        <View style={styles.contentCard}>
          <View>
            <Text style={styles.bookTitle}>
              {item.book_name} {item.chapter}
            </Text>
            <Text style={styles.timestamp}>
              Completed at {new Date(item.completed_at).toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.checkCircle}>
            <Text style={{color: 'white', fontSize: 10}}>✓</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: device.theme
            ? AppColors.appBackgroundGrey
            : AppColors.appBackgroundDarkTint,
        },
      ]}>
      <NormalHeader title="Reading History" backButton={true} />
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => 'reading-history-' + index.toString()}
        renderItem={renderItem}
        renderSectionHeader={({section: {title}}) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{padding: 20}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 15,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  container: {
    flex: 1,
  },
  itemWrapper: {
    flexDirection: 'row',
    height: 80,
  },
  timelineContainer: {
    width: 30,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AppColors.primaryDark, // Green for "Completed"
    zIndex: 1,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: AppColors.primaryTint,
  },
  contentCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingBottom: 20,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AppColors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReadingHistory;
