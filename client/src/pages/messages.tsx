import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types for buyers
type Buyer = {
  id: number;
  username: string;
  fullName: string;
  location: string;
  phoneNumber: string;
  companyName?: string;
  businessType: string;
};

// Types for direct messages
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

// Type for a conversation
type Conversation = {
  buyerId: number;
  buyerName: string;
  buyerLocation: string;
  buyerCompany?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");

  // Fetch all buyers
  const { data: buyers, isLoading: buyersLoading } = useQuery({
    queryKey: ["/api/buyers"],
    queryFn: async () => {
      const response = await fetch("/api/buyers");
      if (!response.ok) {
        throw new Error("Failed to load buyers");
      }
      return await response.json() as Buyer[];
    },
  });

  // Fetch all messages for the current farmer
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/direct-messages/farmer"],
    queryFn: async () => {
      const response = await fetch("/api/direct-messages/farmer");
      if (!response.ok) {
        throw new Error("Failed to load messages");
      }
      return await response.json() as DirectMessage[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch conversation with selected buyer
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ["/api/direct-messages/conversation", selectedBuyer?.id],
    queryFn: async () => {
      if (!selectedBuyer) return [];
      const response = await fetch(`/api/direct-messages/conversation/farmer/${selectedBuyer.id}`);
      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }
      return await response.json() as DirectMessage[];
    },
    enabled: !!selectedBuyer,
    refetchInterval: selectedBuyer ? 5000 : false, // Refresh every 5 seconds when a buyer is selected
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!selectedBuyer) throw new Error("No buyer selected");
      const data = {
        message,
        receiverId: selectedBuyer.id,
        receiverType: "buyer"
      };
      const res = await apiRequest("POST", "/api/direct-messages/farmer", data);
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages/conversation", selectedBuyer?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages/farmer"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark messages as read in this conversation
  useEffect(() => {
    if (conversation && selectedBuyer) {
      const unreadMessages = conversation.filter(
        msg => !msg.isRead && msg.senderType === "buyer" && msg.receiverType === "farmer"
      );
      
      if (unreadMessages.length > 0) {
        // Mark each unread message as read
        unreadMessages.forEach(async (msg) => {
          try {
            await apiRequest("PUT", `/api/direct-messages/${msg.id}/read`, {});
            queryClient.invalidateQueries({ queryKey: ["/api/direct-messages/farmer"] });
            queryClient.invalidateQueries({ queryKey: ["/api/direct-messages/conversation", selectedBuyer.id] });
          } catch (error) {
            console.error("Failed to mark message as read:", error);
          }
        });
      }
    }
  }, [conversation, selectedBuyer]);

  // Process conversations from messages
  const conversations: Conversation[] = (messages || []).reduce((acc: Conversation[], message: DirectMessage) => {
    // Get the buyer ID (either sender or receiver depending on message direction)
    const buyerId = message.senderType === "buyer" ? message.senderId : message.receiverId;
    
    // Find the buyer in our buyers list
    const buyer = buyers?.find(b => b.id === buyerId);
    if (!buyer) return acc;
    
    // Look for existing conversation with this buyer
    const existingConversation = acc.find(c => c.buyerId === buyerId);
    
    // Parse the timestamp
    const messageTime = new Date(message.timestamp);
    
    if (existingConversation) {
      // If message is newer than the last one in conversation, update it
      const lastMessageTime = new Date(existingConversation.lastMessageTime);
      if (messageTime > lastMessageTime) {
        existingConversation.lastMessage = message.message;
        existingConversation.lastMessageTime = message.timestamp;
      }
      
      // Count unread messages from this buyer
      if (!message.isRead && message.senderType === "buyer") {
        existingConversation.unreadCount += 1;
      }
      
      return acc;
    } else {
      // Create a new conversation
      return [...acc, {
        buyerId: buyerId,
        buyerName: buyer.fullName,
        buyerLocation: buyer.location,
        buyerCompany: buyer.companyName,
        lastMessage: message.message,
        lastMessageTime: message.timestamp,
        unreadCount: (!message.isRead && message.senderType === "buyer") ? 1 : 0
      }];
    }
  }, []);

  // Sort conversations by most recent message
  const sortedConversations = [...conversations].sort((a, b) => {
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const selectBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setActiveTab("messages");
  };

  // Format timestamp to readable format
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If within last week, show day name and time
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return `${date.toLocaleDateString([], { weekday: 'short' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date and time
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageSenderName = (message: DirectMessage) => {
    if (message.senderType === "farmer") {
      return "You";
    } else {
      return selectedBuyer?.fullName || "Buyer";
    }
  };

  if (!user) {
    return <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Please log in to view messages</p>
      </div>
    </MainLayout>
  }

  return (
    <MainLayout>
      <div className="container py-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Messages with Buyers</CardTitle>
            <CardDescription>
              Connect and communicate with crop buyers directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="conversations">
                  Conversations
                  {conversations.some(c => c.unreadCount > 0) && (
                    <Badge className="ml-2 bg-red-500" variant="outline">
                      {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="messages" disabled={!selectedBuyer}>
                  {selectedBuyer ? `Chat with ${selectedBuyer.fullName}` : 'Messages'}
                </TabsTrigger>
                <TabsTrigger value="buyers">All Buyers</TabsTrigger>
              </TabsList>

              {/* Conversations Tab */}
              <TabsContent value="conversations">
                {messagesLoading || buyersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sortedConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No conversations yet</p>
                    <p className="mt-2">Start by selecting a buyer from the "All Buyers" tab</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {sortedConversations.map((convo) => (
                        <Card 
                          key={convo.buyerId} 
                          className={`cursor-pointer hover:bg-accent/50 transition-colors ${convo.unreadCount > 0 ? 'border-l-4 border-l-primary' : ''}`}
                          onClick={() => {
                            const buyer = buyers?.find(b => b.id === convo.buyerId);
                            if (buyer) selectBuyer(buyer);
                          }}
                        >
                          <CardContent className="p-4 flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 mt-1">
                                <AvatarFallback>{convo.buyerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{convo.buyerName}</h4>
                                  {convo.unreadCount > 0 && (
                                    <Badge variant="default" className="text-xs">
                                      {convo.unreadCount} new
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                  {convo.lastMessage}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {convo.buyerCompany && `${convo.buyerCompany}, `}{convo.buyerLocation}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(convo.lastMessageTime)}
                            </span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages">
                {!selectedBuyer ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Select a buyer to view messages</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-[500px]">
                    <div className="bg-muted/50 p-3 rounded-t-lg flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{selectedBuyer.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedBuyer.fullName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedBuyer.companyName && `${selectedBuyer.companyName}, `}{selectedBuyer.location}
                        </p>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4 bg-accent/20 relative">
                      {conversationLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : conversation && conversation.length > 0 ? (
                        <div className="space-y-4">
                          {conversation.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderType === "farmer" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                  msg.senderType === "farmer"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <div className="flex justify-between items-center gap-2 mb-1">
                                  <span className="font-medium text-xs">
                                    {getMessageSenderName(msg)}
                                  </span>
                                  <span className="text-xs opacity-70">
                                    {formatMessageTime(msg.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No messages yet</p>
                          <p className="mt-2">Start a conversation by sending a message below</p>
                        </div>
                      )}
                    </ScrollArea>
                    
                    <form onSubmit={handleSendMessage} className="p-3 bg-background border-t">
                      <div className="flex gap-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 resize-none h-20"
                        />
                        <Button 
                          type="submit" 
                          size="icon" 
                          className="h-20" 
                          disabled={sendMessageMutation.isPending || !newMessage.trim()}
                        >
                          {sendMessageMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </TabsContent>

              {/* Buyers Tab */}
              <TabsContent value="buyers">
                {buyersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : buyers && buyers.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {buyers.map((buyer) => (
                        <Card 
                          key={buyer.id} 
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => selectBuyer(buyer)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 mt-1">
                                <AvatarFallback>{buyer.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{buyer.fullName}</h4>
                                <p className="text-sm">
                                  {buyer.companyName || "Independent Buyer"}
                                </p>
                                <div className="flex flex-col gap-1 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {buyer.location}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {buyer.businessType}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {buyer.phoneNumber}
                                  </span>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-3"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectBuyer(buyer);
                                  }}
                                >
                                  Message Buyer
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No buyers available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}