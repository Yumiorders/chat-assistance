import './App.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, Avatar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import chatBotPrompts from "./ChatBotPrompts"
import Sam from "./Images/SAM.png";
import You from "./Images/YOU.png";
import { useState } from "react";


function App() {

  const prompt = JSON.stringify([chatBotPrompts]);

  const getAvatar = (sender) => {
    return sender === "Hotellom Assistance" ? Sam : You;
  };


  const API_KEY = "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";
  const systemMessage = {
    "role": "system",
    "content": prompt
  }
  const [messages, setMessages] = useState([
    {
      message: "Hey there! I'm your trusty Hotellom Assistant 😊 Ask me anything!",
      sentTime: "just now",
      sender: "Hotellom Assistance"
    }
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    setIsTyping(true);
    await processMessageToHotellom_Assistance(newMessages);
  };

  const [isTyping, setIsTyping] = useState(false);


  async function processMessageToHotellom_Assistance(chatMessages) {

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "Hotellom Assistance") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message }
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ],
      temperature: 0.72,
      max_tokens: 170,
      top_p: 0.47,
      frequency_penalty: 0,
      presence_penalty: 0,
    }

    await fetch("https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      }).then((data) => {
        return data.json();
      }).then((data) => {
        setMessages([...chatMessages, {
          message: data.choices[0].message.content,
          sender: "Hotellom Assistance"
        }]);

        setIsTyping(false);
      });
  }

  return (
    <div className="App" id='Chat'>
      <MainContainer>
        <ChatContainer>
          <MessageList
            typingIndicator={isTyping && <TypingIndicator content="Hotellom Assistance is typing" />}
            className="message-list"
          >
            {messages.map((message, i) => (
              <Message key={i} model={message}>
                <Avatar src={getAvatar(message.sender)} className='avatar' status="available" size='sm' />
              </Message>
            ))}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            onSend={handleSend}
            className="message-input"
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default App;
