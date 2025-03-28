import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useLanguage } from "@/hooks/use-language";
import { useBuyer } from "@/hooks/use-buyer";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Search, MessageSquare, User, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

// Types for API responses
type Farmer = {
  id: number;
  username: string;
  fullName: string;
  location: string;
  phoneNumber: string;
};

type DirectMessage = {
  id: number;
  senderId: number;
  receiverId: number;
  senderType: string;
  receiverType: string;
  message: string;
  isRead: boolean;
  timestamp: string;
};

type Conversation = {
  farmerId: number;
  farmerName: string;
  farmerLocation: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

export default function ContactFarmers() {
  const { t } = useLanguage();
  const { buyer } = useBuyer();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("farmers");
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch farmers list
  const { data: farmers, isLoading: isFarmersLoading } = useQuery({
    queryKey: ["/api/farmers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/farmers");
      return await res.json() as Farmer[];
    },
  });

  // Fetch direct messages
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["/api/direct-messages/buyer"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/direct-messages/buyer");
      return await res.json() as DirectMessage[];
    },
  });

  // Fetch selected conversation
  const { data: conversation, isLoading: isConversationLoading } = useQuery({
    queryKey: ["/api/direct-messages/conversation/buyer", selectedFarmerId],
    queryFn: async () => {
      if (!selectedFarmerId) return [];
      const res = await apiRequest("GET", `/api/direct-messages/conversation/buyer/${selectedFarmerId}`);
      return await res.json() as DirectMessage[];
    },
    enabled: !!selectedFarmerId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { receiverId: number; receiverType: string; message: string }) => {
      const res = await apiRequest("POST", "/api/direct-messages/buyer", message);
      return await res.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages/buyer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages/conversation/buyer", selectedFarmerId] });
      toast({
        title: t("Message Sent"),
        description: t("Your message has been sent to the farmer."),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("Failed to Send Message"),
        description: error.message || t("There was an error sending your message."),
        variant: "destructive",
      });
    },
  });

  // Calculate conversations from messages
  const conversations: Conversation[] = (messages || []).reduce((acc: Conversation[], message: DirectMessage) => {
    const isIncoming = message.senderType === "farmer";
    const farmerId = isIncoming ? message.senderId : message.receiverId;
    
    const existingConversation = acc.find(c => c.farmerId === farmerId);
    
    if (existingConversation) {
      const messageTime = new Date(message.timestamp);
      const existingTime = new Date(existingConversation.lastMessageTime);
      
      if (messageTime > existingTime) {
        existingConversation.lastMessage = message.message;
        existingConversation.lastMessageTime = message.timestamp;
      }
      
      if (isIncoming && !message.isRead) {
        existingConversation.unreadCount += 1;
      }
      
      return acc;
    }
    
    // Try to find farmer info in farmers data
    const farmerInfo = (farmers || []).find(f => f.id === farmerId);
    
    if (!farmerInfo) {
      // If we don't have the farmer info yet, use placeholder
      acc.push({
        farmerId,
        farmerName: `Farmer #${farmerId}`,
        farmerLocation: "Unknown",
        lastMessage: message.message,
        lastMessageTime: message.timestamp,
        unreadCount: isIncoming && !message.isRead ? 1 : 0
      });
    } else {
      acc.push({
        farmerId,
        farmerName: farmerInfo.fullName,
        farmerLocation: farmerInfo.location,
        lastMessage: message.message,
        lastMessageTime: message.timestamp,
        unreadCount: isIncoming && !message.isRead ? 1 : 0
      });
    }
    
    return acc;
  }, []);

  // Sort conversations by last message time (newest first)
  conversations.sort((a, b) => {
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  // Filter farmers based on search query
  const filteredFarmers = (farmers || []).filter(farmer => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      farmer.fullName.toLowerCase().includes(query) ||
      farmer.location.toLowerCase().includes(query)
    );
  });

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedFarmerId) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedFarmerId,
      receiverType: "farmer",
      message: messageText.trim()
    });
  };

  // Select a farmer when clicking on a conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedFarmerId && activeTab === "messages") {
      setSelectedFarmerId(conversations[0].farmerId);
    }
  }, [conversations, selectedFarmerId, activeTab]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("Contact Farmers")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("Connect with farmers to discuss purchases, request crop information, or negotiate deals.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar - Farmers list or conversations */}
          <div className="md:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="farmers">{t("Farmers")}</TabsTrigger>
                    <TabsTrigger value="messages">
                      {t("Messages")}
                      {conversations.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {conversations.reduce((total, convo) => total + convo.unreadCount, 0)}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder={activeTab === "farmers" ? t("Search farmers...") : t("Search conversations...")}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <TabsContent value="farmers" className="mt-0 space-y-2 h-[450px] overflow-y-auto">
                  {isFarmersLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredFarmers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? t("No farmers matching your search") : t("No farmers available")}
                    </div>
                  ) : (
                    filteredFarmers.map(farmer => (
                      <Card 
                        key={farmer.id} 
                        className={`cursor-pointer hover:bg-accent/20 ${
                          selectedFarmerId === farmer.id ? 'bg-accent/30' : ''
                        }`}
                        onClick={() => {
                          setSelectedFarmerId(farmer.id);
                          setActiveTab("messages");
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">{farmer.fullName}</div>
                              <div className="text-xs text-muted-foreground">{farmer.location}</div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFarmerId(farmer.id);
                                setActiveTab("messages");
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="messages" className="mt-0 space-y-2 h-[450px] overflow-y-auto">
                  {isMessagesLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("No conversations yet")}
                    </div>
                  ) : (
                    conversations
                      .filter(convo => 
                        !searchQuery || 
                        convo.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        convo.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(conversation => (
                        <Card 
                          key={conversation.farmerId} 
                          className={`cursor-pointer hover:bg-accent/20 ${
                            selectedFarmerId === conversation.farmerId ? 'bg-accent/30' : ''
                          }`}
                          onClick={() => setSelectedFarmerId(conversation.farmerId)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center relative">
                                <User className="h-5 w-5 text-primary" />
                                {conversation.unreadCount > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                              <div className="ml-3 flex-1 overflow-hidden">
                                <div className="font-medium">{conversation.farmerName}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {conversation.lastMessage}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </TabsContent>
              </CardContent>
            </Card>
          </div>
          
          {/* Chat area */}
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedFarmerId ? (
                <>
                  <CardHeader className="py-3 border-b">
                    {(() => {
                      const selectedFarmer = farmers?.find(f => f.id === selectedFarmerId);
                      const selectedConversation = conversations.find(c => c.farmerId === selectedFarmerId);
                      
                      return (
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="ml-3">
                            <CardTitle className="text-base">
                              {selectedFarmer?.fullName || selectedConversation?.farmerName || `Farmer #${selectedFarmerId}`}
                            </CardTitle>
                            <CardDescription>
                              {selectedFarmer?.location || selectedConversation?.farmerLocation || "Unknown location"}
                            </CardDescription>
                          </div>
                        </div>
                      );
                    })()}
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-y-auto p-4 h-[400px]">
                    {isConversationLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !conversation || conversation.length === 0 ? (
                      <div className="text-center py-20 text-muted-foreground">
                        {t("Start a conversation with this farmer")}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conversation.map(message => {
                          const isOutgoing = message.senderType === "buyer";
                          return (
                            <div 
                              key={message.id} 
                              className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  isOutgoing 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                }`}
                              >
                                <div className="text-sm">{message.message}</div>
                                <div className="text-xs mt-1 flex items-center gap-1 opacity-70">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="border-t p-3">
                    <div className="flex w-full items-center space-x-2">
                      <Textarea 
                        className="flex-1 min-h-20 max-h-40"
                        placeholder={t("Type your message...")}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        size="icon" 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                      >
                        {sendMessageMutation.isPending 
                          ? <Loader2 className="h-4 w-4 animate-spin" /> 
                          : <Send className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </CardFooter>
                </>
              ) : (
                <div className="flex items-center justify-center h-full py-20">
                  <div className="text-center max-w-md p-6">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-1">{t("No Conversation Selected")}</h3>
                    <p className="text-muted-foreground">
                      {t("Select a farmer from the list to start or continue a conversation.")}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}