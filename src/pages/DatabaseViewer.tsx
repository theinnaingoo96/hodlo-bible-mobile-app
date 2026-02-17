import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import DatabaseService from '../services/DataService';
import { AppColors } from '../constants/Color';
import AppHeader from '../components/AppHeader';

const tables = ['books', 'chapters', 'search_history', 'bookmarks', 'notifications'];

const DatabaseViewer = () => {
    const [data, setData] = useState<any>({});
    const [columns, setColumns] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('books');

    useEffect(() => {
        setLoading(true);
        const fetchAllTables = async () => {
            const { rows, columns } = await DatabaseService.getInstance().getAllData();
            setData(rows);
            setColumns(columns);
            setLoading(false);
            // console.log(rows, columns);
        };

        fetchAllTables();
    }, []);

    return (
        loading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={AppColors.primary} />
            </View>
        ) : (
            <View style={styles.container}>
                <AppHeader backButton={false} title="Database Viewer" />
                {/* Custom Tab Bar */}
                <View style={styles.tabBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {tables.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tabItem, activeTab === tab && styles.activeTab]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                    {tab.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Table View */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                            {/* Header Row */}
                            <View style={styles.rowHeader}>
                                {columns[activeTab]?.map((col: string) => (
                                    <Text key={col} style={[styles.cell, styles.headerCell]}>
                                        {col}
                                    </Text>
                                ))}
                            </View>

                            {/* Data Rows */}
                            {data[activeTab]?.map((row: any, i: number) => (
                                <View key={i} style={styles.row}>
                                    {columns[activeTab]?.map((col: string) => (
                                        <Text key={col} style={styles.cell}>
                                            {row[col] !== null ? String(row[col]) : 'NULL'}
                                        </Text>
                                    ))}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </ScrollView>
            </View>
        )
    );
};

export default DatabaseViewer;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        // paddingTop: 12,
        backgroundColor: '#f9f9f9',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ddd',
        paddingVertical: 6,
    },
    tabItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#000',
    },
    tabText: {
        fontSize: 16,
        color: '#555',
    },
    activeTabText: {
        fontWeight: 'bold',
        color: '#000',
    },
    rowHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#ddd',
    },
    cell: {
        minWidth: 120,
        padding: 6,
        fontSize: 14,
        borderRightWidth: 0.5,
        borderColor: '#ccc',
        color: '#333',
    },
    headerCell: {
        fontWeight: 'bold',
        backgroundColor: '#f0f0f0',
    },
});
