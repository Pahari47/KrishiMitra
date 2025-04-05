import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaMicrophone, FaPaperPlane, FaTimes } from 'react-icons/fa';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen && messages.length === 0) {
            setMessages([{
                text: "Hello! I'm your agriculture assistant. How can I help you today?",
                sender: 'bot'
            }]);
        }
    };

    const callChatAPI = async (message, inputType = 'text', returnOnlyInput = false) => {
        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    type: inputType,
                    return_only_input: returnOnlyInput
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    };

    const callSpeakAPI = async (text) => {
        try {
            const response = await fetch('http://localhost:5000/api/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                console.warn('Speech synthesis failed');
            }
        } catch (error) {
            console.error('Speak API error:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isProcessing) return;

        const userMessage = { text: inputMessage, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsProcessing(true);

        try {
            // Add typing indicator
            setMessages(prev => [...prev, { text: "Bot is typing...", sender: 'bot', temporary: true }]);

            const data = await callChatAPI(inputMessage);

            // Remove typing indicator and add bot response
            setMessages(prev => [
                ...prev.filter(msg => !msg.temporary),
                { text: data.response, sender: 'bot' }
            ]);

            await callSpeakAPI(data.response);
        } catch (error) {
            setMessages(prev => [
                ...prev.filter(msg => !msg.temporary),
                {
                    text: "Sorry, I'm having trouble connecting to the assistant.",
                    sender: 'bot'
                }
            ]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleListen = async () => {
        if (isListening || isProcessing) return;

        setIsListening(true);
        setIsProcessing(true);

        // Show listening indicator
        setMessages(prev => [...prev, { text: "Listening...", sender: 'bot', temporary: true }]);

        try {
            // Step 1: Get only the user's speech input
            const recognitionData = await callChatAPI('', 'speech', true);

            if (!recognitionData.user_input) {
                throw new Error('Could not understand your voice');
            }

            // Remove listening indicator
            setMessages(prev => prev.filter(msg => !msg.temporary));

            // Step 2: Add user's spoken question
            const userMessage = {
                text: recognitionData.user_input,
                sender: 'user'
            };
            setMessages(prev => [...prev, userMessage]);

            // Add typing indicator
            setMessages(prev => [...prev, { text: "Bot is typing...", sender: 'bot', temporary: true }]);

            // Step 3: Get bot response to the user's question
            const botResponse = await callChatAPI(userMessage.text);

            // Remove typing indicator and add bot response
            setMessages(prev => [
                ...prev.filter(msg => !msg.temporary),
                { text: botResponse.response, sender: 'bot' }
            ]);

            // Step 4: Speak the response
            await callSpeakAPI(botResponse.response);

        } catch (error) {
            console.error('Voice interaction error:', error);
            setMessages(prev => [
                ...prev.filter(msg => !msg.temporary),
                {
                    text: error.message || "Sorry, I couldn't process your voice request.",
                    sender: 'bot'
                }
            ]);
        } finally {
            setIsListening(false);
            setIsProcessing(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isProcessing) {
            handleSendMessage();
        }
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 ${isOpen ? 'w-80' : ''}`}>
            {!isOpen ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                    {/* Heading with subtle animation */}
                    <h1
                        className="text-3xl font-bold text-gray-800 mb-4"
                        style={{
                            animation: 'float 3s ease-in-out infinite',
                        }}
                    >
                        Hello!!
                    </h1>

                    {/* Button with hover animation */}
                    <button
                        onClick={toggleChat}
                        className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-y-1 active:scale-95 group"
                        aria-label="Open chatbot"
                    >
                        <FaRobot className="text-2xl transform group-hover:scale-110 transition-transform" />

                        {/* Pulsing ring effect */}
                        <span className="absolute inset-0 border-2 border-green-300 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 bg-green-600 text-white">
                        <h3 className="font-semibold">Agriculture Assistant</h3>
                        <button
                            onClick={toggleChat}
                            className="p-1 rounded-full hover:bg-green-700 transition-colors"
                            aria-label="Close chatbot"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((message, index) => (
                            !message.temporary && (
                                <div
                                    key={index}
                                    className={`mb-3 max-w-[80%] p-3 rounded-lg ${message.sender === 'user'
                                        ? 'ml-auto bg-green-600 text-white rounded-br-none'
                                        : 'mr-auto bg-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    {message.text}
                                </div>
                            )
                        ))}
                        {(isListening || isProcessing) && (
                            <div className="flex items-center justify-center py-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-500">
                                    {isListening ? "Listening..." : "Bot is typing..."}
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex p-3 border-t border-gray-200 bg-white">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            disabled={isListening || isProcessing}
                            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                        />
                        <button
                            onClick={handleListen}
                            disabled={isListening || isProcessing}
                            className={`ml-2 p-2 rounded-full ${isListening
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'text-green-600 hover:bg-gray-100 disabled:opacity-50'
                                }`}
                            aria-label="Voice input"
                        >
                            <FaMicrophone />
                        </button>
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isListening || isProcessing}
                            className={`ml-2 p-2 rounded-full ${inputMessage.trim() && !isListening && !isProcessing
                                ? 'text-green-600 hover:bg-gray-100'
                                : 'text-gray-400 cursor-not-allowed'
                                }`}
                            aria-label="Send message"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;