import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { GoogleGenerativeAI } from '@google/generative-ai';

const RecommendScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const scrollViewRef = React.useRef();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, user: true }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiUrl);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(input);
      const botReply = await result.response.text();
      setMessages([...newMessages, { text: botReply, user: false }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { text: 'Sorry, something went wrong.', user: false }]);
    }

    setLoading(false);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {messages.length === 0 && (
            <Text style={styles.placeholder}>Start a conversation...</Text>
          )}
          
          {messages.map((msg, index) => (
            <View 
              key={index} 
              style={[
                styles.message, 
                msg.user ? styles.userMessage : styles.botMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.user ? styles.userMessageText : styles.botMessageText
              ]}>
                {msg.text}
              </Text>
            </View>
          ))}
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6200ee" />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#666"
            multiline
            maxHeight={100}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <IconButton
              icon="send"
              size={24}
              iconColor={input.trim() ? '#fff' : '#000000'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  keyboardAvoid: {
    flex: 1
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  chatContainer: {
    flex: 1
  },
  chatContent: {
    padding: 16,
    paddingBottom: 32
  },
  placeholder: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20
  },
  message: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
    maxWidth: '85%'
  },
  userMessage: {
    backgroundColor: '#6200ee',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4
  },
  botMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  userMessageText: {
    color: '#fff'
  },
  botMessageText: {
    color: '#1a1a1a'
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    paddingTop: 12,
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8
  },
  sendButton: {
    backgroundColor: '#6200ee',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#b8b8b8'
  }
});

export default RecommendScreen;