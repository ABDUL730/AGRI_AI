import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export function AIAssistant() {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  
  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat-messages'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('POST', '/api/chat-messages', {
        sender: 'user',
        message
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-messages'] });
      setMessage("");
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const isInputDisabled = sendMessageMutation.isPending;

  return (
    <div className="bg-white shadow sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-heading font-semibold text-gray-900">{t("AI Farming Assistant")}</h3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-gray-500">
            <p>{t("Ask any farming-related questions or request guidance on crop management, pest control, or market prices.")}</p>
          </div>
          <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
            <div className="flex space-x-2">
              <button 
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-green-700 focus:outline-none"
              >
                <span className="material-icons mr-2">mic</span>
                {t("Voice Input")}
              </button>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <span className="material-icons mr-2">message</span>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5 border border-gray-300 rounded-md">
          <div className="bg-gray-50 px-4 py-3 rounded-t-md">
            <div className="flex items-center space-x-2">
              <span className="material-icons text-primary">smart_toy</span>
              <span className="text-sm font-medium text-gray-700">{t("AgriAI Assistant")}</span>
            </div>
          </div>
          
          <div className="px-4 py-4 h-48 overflow-y-auto space-y-4 bg-white">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="material-icons text-primary text-sm">smart_toy</span>
                      </div>
                    </div>
                  )}
                  <div className={`${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-800'
                  } rounded-lg px-4 py-2 max-w-md`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="flex-shrink-0 ml-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="material-icons text-gray-600 text-sm">person</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="material-icons text-primary text-sm">smart_toy</span>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-md">
                  <p className="text-sm text-gray-800">
                    {t("Hello! I'm your AgriAI assistant. How can I help with your farming today?")}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 bg-white border-t border-gray-200 rounded-b-md">
            <form onSubmit={handleSendMessage}>
              <div className="flex items-center">
                <input
                  type="text"
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                  placeholder={t("Type your question here...")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isInputDisabled}
                />
                <button
                  type="submit"
                  className={`ml-3 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-green-700 focus:outline-none ${
                    isInputDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isInputDisabled}
                >
                  {isInputDisabled ? (
                    <span className="material-icons animate-spin">loop</span>
                  ) : (
                    <span className="material-icons">send</span>
                  )}
                </button>
              </div>
            </form>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <span className="material-icons text-xs mr-1">info</span>
              <span>{t("You can ask in English, Hindi, Tamil, Telugu, or Kannada")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
