import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {View, StyleSheet, Text, Image} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import NormalHeader from '../components/NormalHeader';
import {AppColors} from '../constants/Color';

const AboutUs = () => {
  const device = useSelector((state: any) => state.device);
  const insets = useSafeAreaInsets();

  useEffect(() => {}, []);

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
      <NormalHeader title="About Us" backButton={true} />
      <View style={styles.contentContainer}>
        <View style={styles.contentTextContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.contentText}>
            Gathengpu Dlo Mobile Bible App makes God's Word accessible in Ho
            dlo, Burmese, and English (KJV). Built for clarity and unity, it
            equips believers to read, study, apply, and share Scripture across
            languages - anytime, anywhere.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    marginTop: 100,
  },
  logoContainer: {
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  contentText: {
    fontSize: 17,
    lineHeight: 30,
    letterSpacing: 0,
    textAlign: 'justify',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    position: 'absolute',
    top: -50,
  },
  contentTextContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 30,
  },
});

export default AboutUs;
