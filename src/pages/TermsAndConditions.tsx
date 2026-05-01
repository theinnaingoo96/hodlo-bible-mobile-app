import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NormalHeader from '../components/NormalHeader';
import { AppColors } from '../constants/Color';

const TermsAndConditions = () => {
  const device = useSelector((state: any) => state.device);
  const insets = useSafeAreaInsets();

  useEffect(() => { }, []);

  const Section = ({ title, children }: { title: string; children: any }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );

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
      <NormalHeader title="Terms and Conditions" backButton={true} />
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>Terms and Conditions</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.appName}>Gathengpu Dlo</Text>
        <Text style={styles.lastUpdated}>Last Updated: 10/02/2026</Text>

        <Text style={styles.intro}>
          Welcome to <Text style={{ fontWeight: 'bold' }}>Gathengpu Dlo</Text>. By
          accessing or using our mobile application, you agree to be bound by
          these Terms and Conditions. If you do not agree, please do not use the
          app.
        </Text>

        <Section title="1. Acceptance of Terms">
          By downloading and using Gathengpu Dlo, you confirm that you are at
          least 13 years of age (or have parental consent) and that you agree to
          abide by these terms.
        </Section>

        <Section title="2. Use of the App">
          {'\u2022'} <Text style={styles.bold}>Personal Use:</Text> This app is
          provided for your personal, non-commercial, and spiritual use.{'\n'}
          {'\u2022'} <Text style={styles.bold}>Prohibited Activities:</Text> You
          agree not to attempt to decompile or reverse-engineer the app
          software, or use the "Share" feature to create offensive imagery using
          the Bible text.
        </Section>

        <Section title="3. Intellectual Property">
          The design, code, logo, and brand "Gathengpu Dlo" are the intellectual
          property of the developers. Bible translations are used under license
          or are in the public domain. Gathengpu Dlo is not liable for copyright
          infringement caused by user-uploaded photos in the share feature.
        </Section>

        <Section title="4. Privacy Policy">
          Your privacy is important to us. Please refer to our Privacy Policy to
          understand how we collect and use data (e.g., your bookmarked verses).
        </Section>

        <Section title="5. No Warranties">
          Gathengpu Dlo is provided on an "AS IS" basis. While we strive for
          accuracy, we do not guarantee that the translation or the app will be
          error-free at all times.
        </Section>

        <Section title="6. Limitation of Liability">
          In no event shall the developers be liable for any damages (including
          loss of data) arising out of the use or inability to use the app.
        </Section>

        <Section title="7. Contact Us">
          If you have any questions about these Terms, please contact us at:
          {'\n'}
          <Text style={styles.link}>gathengpudlo@gmail.com</Text>
        </Section>

        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
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
  contentText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'column',
    paddingVertical: 16,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  itemText: {
    fontSize: 16,
  },
  referenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  datetimeText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 12,
    color: '#666',
    textAlign: 'right',
  },
  referenceText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#000',
    textAlign: 'right',
  },
  scrollContent: {
    padding: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  intro: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  link: {
    color: '#007AFF',
    marginTop: 5,
  },
  footerSpace: {
    height: 40,
  },
});

export default TermsAndConditions;
