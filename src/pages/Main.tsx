import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import useKeyboardVisible from "../utils/hooks/useKeyboardVisible";
import BookmarkIcon from "../components/icons/BookmarkIcon";
import SettingIcon from "../components/icons/SettingIcon";
import { useNavigation } from "@react-navigation/native";
import SearchIcon from "../components/icons/SearchIcon";
import BibleIcon from "../components/icons/BibleIcon";
import HomeIcon from "../components/icons/HomeIcon";
import TabHeader from "../components/TabHeader";
import { AppColors } from "../constants/Color";

import Bookmark from "./tabs/Bookmark";
import Setting from "./tabs/Setting";
import Search from "./tabs/Search";
import Bible from "./tabs/Bible";
import Home from "./tabs/Home";
import { useSelector } from "react-redux";

const Tab = createBottomTabNavigator();

interface CustomHeaderProps {
    title: string;
    icon: React.ComponentType<{
        name: string;
        color: string;
        size: number;
    }>;
}

const Main = () => {
    const device = useSelector((state: any) => state.device);
    const isKeyboardVisible = useKeyboardVisible();

    return (
        <View style={styles.mainWrapper}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: true,
                    headerStyle: [styles.header, { backgroundColor: device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDark }],
                    headerTitleAlign: 'center',
                    tabBarStyle: [styles.tabBar, { display: isKeyboardVisible ? 'none' : 'flex' }], //{ backgroundColor: device.theme ? AppColors.primary : AppColors.primaryNior }],
                    tabBarActiveTintColor: AppColors.appTextWhite,
                    tabBarInactiveTintColor: AppColors.appTextBlack,
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '500',
                    },
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={Home}
                    options={{
                        headerTitle: () => <TabHeader title="Home" icon={HomeIcon} />,
                        tabBarIcon: ({ focused, color }) => (
                            <HomeIcon name="home" color={color} size={24} />
                            // <FontAwesome6 name="house" iconStyle="solid" color={color} size={20} style={styles.tabBarIcon} />
                        ),
                        tabBarLabel: '',
                    }}
                />
                <Tab.Screen
                    name="Bible"
                    component={Bible}
                    options={{
                        headerTitle: () => <TabHeader title="Bible" icon={BibleIcon} />,
                        tabBarIcon: ({ color }) => (
                            <BibleIcon name="bible" color={color} size={24} />
                            // <FontAwesome6 name="book" iconStyle="solid" color={color} size={20} style={styles.tabBarIcon} />
                        ),
                        tabBarLabel: '',
                    }}
                />
                <Tab.Screen
                    name="Search"
                    component={Search}
                    options={{
                        headerTitle: () => <TabHeader title="Search" icon={SearchIcon} />,
                        tabBarIcon: ({ color }) => (
                            <SearchIcon name="search" color={color} size={24} />
                            // <FontAwesome6 name="magnifying-glass" iconStyle="solid" color={color} size={20} style={styles.tabBarIcon} />
                        ),
                        tabBarLabel: '',
                    }}
                />
                <Tab.Screen
                    name="Bookmark"
                    component={Bookmark}
                    options={{
                        headerTitle: () => <TabHeader title="Bookmarks" icon={BookmarkIcon} />,
                        tabBarIcon: ({ color }) => (
                            <BookmarkIcon name="bookmark" color={color} size={24} />
                            // <FontAwesome6 name="bookmark" iconStyle="solid" color={color} size={20} style={styles.tabBarIcon} />
                        ),
                        tabBarLabel: '',
                    }}
                />
                <Tab.Screen
                    name="Setting"
                    component={Setting}
                    options={{
                        headerTitle: () => <TabHeader title="Settings" icon={SettingIcon} />,
                        tabBarIcon: ({ color }) => (
                            <SettingIcon name="setting" color={color} size={24} />
                            // <FontAwesome6 name="gear" iconStyle="solid" color={color} size={20} style={styles.tabBarIcon} />
                        ),
                        tabBarLabel: '',
                    }}
                />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: AppColors.primary,
    },
    header: {
        backgroundColor: AppColors.appTextWhite,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.primaryTint,
        // flex: 1,
        // padding: 0
    },
    tabBar: {
        height: 70,
        paddingBottom: 8,
        paddingTop: 8,
        backgroundColor: AppColors.primary,
        marginBottom: 40
        // borderTopWidth: 1,
        // borderTopColor: AppColors.appTextGrey,
    },
    tabBarIcon: {
        marginTop: 10,
        height: 21,
    }
});

export default Main;