import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Image,
} from 'react-native';
import {GoogleGenerativeAI} from '@google/generative-ai';
import {GEMINI_API_KEY} from '@env';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Markdown from 'react-native-markdown-renderer';

const Chat = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatList, setChatList] = useState([]);
  const scrollViewRef = useRef();
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  };

  useEffect(() => {
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not defined');
    }
  }, [chatList]);

  const sendMessage = async () => {
    try {
      const chatSession = model.startChat({
        generationConfig,
        // safetySettings: Adjust safety settings
        // See https://ai.google.dev/gemini-api/docs/safety-settings
        history: [],
      });

      const result = await chatSession.sendMessage(input);
      chatList.push({text: result.response.text(), role: 'model'});
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({animated: true});
      }, 100);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log('err: ', err);
      console.warn('Inappropriate Content Warning!');
    }
  };

  const markdownStyles = {
    text: {
      color: '#fff',
    },
    heading1: {
      color: '#fff',
      fontSize: 24,
    },
    link: {
      color: '#1e90ff',
    },
  };

  return (
    <>
      {/* Header */}
      <View
        style={{
          alignItems: 'center',
          paddingVertical: 15,
          elevation: 3,
          backgroundColor: '#fff',
          marginBottom: 2,
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          onPress={() => setChatList([])}
          style={{position: 'absolute', right: 15}}>
          <Icon name="delete" size={30} color="#FE6969" />
        </TouchableOpacity>
        <Text style={{color: '#000', fontSize: 22, fontWeight: 'bold'}}>
          ChatGuru
        </Text>
      </View>
      <View style={styles.container}>
        {chatList.length > 0 ? (
          <ScrollView
            style={{height: '100%'}}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingVertical: 10}}>
            {chatList.map(item => {
              return (
                <View>
                  {item.role == 'user' ? (
                    <View
                      style={{
                        backgroundColor: '#2868C6',
                        maxWidth: '70%',
                        borderRadius: 10,
                        padding: 10,
                        marginVertical: 5,
                        marginHorizontal: 10,
                        alignSelf: 'flex-end',
                      }}>
                      <Text selectable={true} style={{color: '#fff'}}>
                        {item.text}
                      </Text>
                    </View>
                  ) : null}
                  {item.role == 'model' ? (
                    <View
                      style={{
                        backgroundColor: '#448243',
                        width: '70%',
                        borderRadius: 10,
                        padding: 10,
                        marginVertical: 5,
                        marginHorizontal: 10,
                        alignSelf: 'flex-start',
                      }}>
                      {/* <Markdown>
                        {item.text}
                        </Markdown> */}
                      <Markdown style={markdownStyles}>{item.text}</Markdown>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{alignItems: 'center'}}>
              <View style={{width: '50%', height: 100}}>
                <Image
                  source={require('../assets/images/chat.jpg')}
                  style={{width: '100%', height: '100%'}}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={{fontSize: 20, color: '#000', fontWeight: 'bold'}}>
                  Start Chat
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={txt => setInput(txt)}
            placeholder="Type your message..."
            placeholderTextColor={'grey'}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              setLoading(true);
              setInput('');
              Keyboard.dismiss();
              setTimeout(() => {
                scrollViewRef.current.scrollToEnd({animated: true});
              }, 100);
              chatList.push({text: input, role: 'user'});
              console.log('chatu: ', chatList);
              sendMessage();
            }}>
            {loading ? (
              <ActivityIndicator color={'#007BFF'} />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    color: '#000',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    width: 40,
  },
  sendButtonText: {
    color: '#007BFF',
    fontSize: 16,
  },
});

export default Chat;
