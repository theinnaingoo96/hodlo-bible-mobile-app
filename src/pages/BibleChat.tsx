import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, View, Platform, Keyboard, KeyboardEvent, KeyboardAvoidingView, Text } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, SendProps, IMessage, Send } from 'react-native-gifted-chat';
import Markdown from 'react-native-markdown-display';
import AppHeader from '../components/AppHeader';
import { useSelector } from 'react-redux';
import { AppColors } from '../constants/Color';
import NormalHeader from '../components/NormalHeader';
import { constants } from '../constants/Data';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AiService from '../services/AiService';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import GeminiService from '../services/GeminiService';
// import { 
//   BookOpen, 
//   Send as SendIcon, 
//   RotateCcw,
//   Quote,
//   User
// } from 'lucide-react';

const BibleChat = () => {
  const device = useSelector((state: any) => state.device);
  const reader = useSelector((state: any) => state.reader);
  const [messages, setMessages] = useState<any[]>([]);
  const insets = useSafeAreaInsets();
  const keyboardTopToolbarHeight = Platform.select({ ios: 44, default: 0 })
  const keyboardVerticalOffset = insets.bottom + keyboardTopToolbarHeight;

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello! I am your Bible Study Assistant. Ask me anything about today\'s reading.',
        createdAt: new Date(),
        user: { _id: 2, name: 'Bible AI', avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/512px-Google_Gemini_logo.svg.png', },
      },
    ]);
  }, []);
  // 2. Handle sending messages
  const onSend = useCallback((newMessages: any[]) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));

    // Get the text the user just typed
    const userMessage = newMessages[0].text;

    // 3. Call your AI function (we'll define this logic next)
    processAIResponse(userMessage);
  }, []);

  const processAIResponse = async (text: string) => {
    try {
      console.log('[Chat] ', text);
      const responseText = await AiService.getInstance().startBibleChat(text);
      
      const response = {
        _id: Math.random().toString(),
        text: responseText,
        createdAt: new Date(),
        user: { _id: 2, name: 'Bible AI', avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/512px-Google_Gemini_logo.svg.png' },
      };
      
      setMessages(previousMessages => GiftedChat.append(previousMessages, [response]));
    } catch (error) {
      console.error('[Chat] Error processing AI response:', error);
      const errorResponse = {
        _id: Math.random().toString(),
        text: 'I apologize, but I encountered an error. Please try again.',
        createdAt: new Date(),
        user: { _id: 2, name: 'Bible AI', avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/512px-Google_Gemini_logo.svg.png' },
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, [errorResponse]));
    }
  };

  // Custom renderer for message text with markdown support
  const renderMessageText = (props: any) => {
    const { currentMessage } = props;
    const isAI = currentMessage?.user?._id === 2;
    
    if (isAI && currentMessage?.text) {
      // Use markdown for AI messages
      return (
        <Markdown
          style={{
            body: {
              color: AppColors.appTextBlack,
              fontSize: 15,
              lineHeight: 22,
            },
            paragraph: {
              marginTop: 0,
              marginBottom: 8,
            },
            strong: {
              fontWeight: '700',
              color: AppColors.appTextBlack,
            },
            list_item: {
              marginTop: 4,
              marginBottom: 4,
              flexDirection: 'row',
            },
            bullet_list: {
              marginTop: 4,
              marginBottom: 4,
            },
            bullet_list_icon: {
              marginLeft: 0,
              marginRight: 8,
              fontSize: 15,
            },
            ordered_list: {
              marginTop: 4,
              marginBottom: 4,
            },
            text: {
              color: AppColors.appTextBlack,
            },
            textgroup: {
              color: AppColors.appTextBlack,
            },
          }}
        >
          {currentMessage.text}
        </Markdown>
      );
    }
    
    // Default text rendering for user messages
    return (
      <Text
        style={[
          props.textStyle,
          {
            color: isAI ? AppColors.appTextBlack : AppColors.appTextWhite,
          },
        ]}
      >
        {currentMessage?.text}
      </Text>
    );
  };

  // 4. Customizing the UI (Optional)
  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: AppColors.primary, paddingHorizontal: 15, paddingVertical: 5 }, // User bubble color
        left: { backgroundColor: AppColors.appBackgroundGrey },  // AI bubble color
      }}
      textStyle={{
        right: {
          color: AppColors.appTextWhite,
          paddingHorizontal: 10,
        },
        left: {
          color: AppColors.appTextBlack,
        },
      }}
      renderMessageText={renderMessageText}
    />
  );

  const renderSend = (props: SendProps<IMessage>) => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <View style={styles.sendButtonInner}>
          <FontAwesome6 iconStyle="solid" name="paper-plane" size={18} style={{ paddingHorizontal: 5 }} color={AppColors.primaryDark} />
        </View>
      </Send>
    );
  };

  const renderAvatar = (props: any) => {
    const isAssistant = props.currentMessage?.user?._id === 2;
    return (
      <View style={[styles.avatarContainer, isAssistant ? styles.assistantAvatar : styles.userAvatar]}>
        {isAssistant ? (
          // <Quote size={16} color="#fff" />
          <FontAwesome6 iconStyle="solid" name="message" size={18} style={{ paddingHorizontal: 5 }} color={device.theme ? AppColors.primary : AppColors.appTextWhite} />

        ) : (
          // <User size={16} color="#64748b" />
          <FontAwesome6 iconStyle="solid" name="message" size={18} style={{ paddingHorizontal: 5 }} color={device.theme ? AppColors.primary : AppColors.appTextWhite} />

        )}
      </View>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
      <StatusBar
        backgroundColor={constants.theme[reader.readerSetting.theme - 1].backgroundColor}
        barStyle={"dark-content"}
        showHideTransition="fade" animated={true}
      />
      <View style={{ flex: 1, marginBottom: insets.bottom }}>
        <NormalHeader title="Bible Chat" backButton={true} />
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{ _id: 1 }} // Current user ID
          renderBubble={renderBubble}
          textInputProps={{
            placeholder: 'Type a message',
            placeholderTextColor: '#999',
            style: {
              color: '#000',
            },
          }}
          keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
          scrollToBottomComponent={() => <View style={{ height: 100 }} />}
          scrollToBottomOffset={100}
          renderSend={renderSend}
          renderAvatar={renderAvatar}
          renderInputToolbar={renderInputToolbar}
        />
        {
          Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />
        }
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e0d8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    backgroundColor: '#b38e5d',
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2d2a26',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resetButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f8f5f0',
  },
  bubbleContainer: {
    marginVertical: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e0d8',
    borderRadius: 16,
    padding: 4,
  },
  userBubble: {
    backgroundColor: '#2d2a26',
    borderRadius: 16,
    padding: 4,
  },
  assistantText: {
    color: '#2d2a26',
    fontSize: 17,
    lineHeight: 24,
    fontFamily: 'Crimson Pro',
  },
  userText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  assistantAvatar: {
    backgroundColor: '#b38e5d',
  },
  userAvatar: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  sendButtonInner: {
    // backgroundColor: '#b38e5d',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputToolbar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e0d8',
    paddingTop: 4,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerNote: {
    fontSize: 8,
    textAlign: 'center',
    color: '#94a3b8',
    fontWeight: '800',
    letterSpacing: 2,
  },
});

export default BibleChat;