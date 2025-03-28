import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useLanguage } from "@/hooks/use-language";
import MarketConnect from "@/components/dashboard/market-connect";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";

// Types for API responses
type CropListing = {
  id: number;
  title: string;
  farmerId: number;
  cropName: string;
  cropVariety: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;
  qualityGrade: string;
  location: string;
  harvestDate: string;
  availableUntil: string;
  description: string;
  images?: string[];
  createdAt: string;
};

type PurchaseRequest = {
  id: number;
  farmerId: number;
  buyerId: number;
  listingId: number;
  requestedQuantity: number;
  bidPricePerUnit: number | null;
  message: string | null;
  status: string;
  requestDate: string;
  paymentStatus: string;
  paymentMethod: string | null;
  contactName: string | null;
  contactNumber: string | null;
  notes: string | null;
};

// Schema for creating a new crop listing
const cropListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  cropName: z.string().min(2, "Crop name required"),
  cropVariety: z.string().optional(),
  quantity: z.coerce.number().min(1, "Must offer at least 1 unit"),
  pricePerUnit: z.coerce.number().min(0.01, "Price must be greater than 0"),
  unit: z.string().min(1, "Unit required"),
  qualityGrade: z.string().optional(),
  description: z.string().optional(),
  harvestDate: z.string(),
  availableUntil: z.string(),
});

// Schema for creating a purchase request
const purchaseRequestSchema = z.object({
  listingId: z.coerce.number(),
  requestedQuantity: z.coerce.number().min(1, "Must request at least 1 unit"),
  bidPricePerUnit: z.coerce.number().optional(),
  message: z.string().optional(),
  contactName: z.string().min(3, "Contact name required"),
  contactNumber: z.string().min(5, "Contact number required"),
});

export default function Market() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [tab, setTab] = useState("market");
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [isBuyerDialogOpen, setIsBuyerDialogOpen] = useState(false);
  const [isNewListingDialogOpen, setIsNewListingDialogOpen] = useState(false);
  const { user: farmer } = useAuth();

  // Fetch all crop listings
  const { data: listings, isLoading: isLoadingListings } = useQuery<CropListing[]>({
    queryKey: ["/api/crop-listings"],
    retry: false,
  });

  // Fetch farmer's own listings
  const { data: farmerListings, isLoading: isLoadingFarmerListings } = useQuery<CropListing[]>({
    queryKey: ["/api/crop-listings/farmer"],
    retry: false,
  });

  // Fetch the purchase requests for this farmer
  const { data: purchaseRequests, isLoading: isLoadingRequests } = useQuery<PurchaseRequest[]>({
    queryKey: ["/api/purchase-requests/farmer"],
    retry: false,
  });

  // Mutation for creating a new crop listing
  const createListingMutation = useMutation({
    mutationFn: async (listingData: z.infer<typeof cropListingSchema>) => {
      const res = await apiRequest("POST", "/api/crop-listings", listingData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crop-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crop-listings/farmer"] });
      setIsNewListingDialogOpen(false);
      toast({
        title: "Listing Created",
        description: "Your crop listing has been successfully published",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create listing",
        description: error.message || "There was an error creating your listing",
      });
    },
  });

  // Mutation for responding to a purchase request
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/purchase-requests/${id}/farmer`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests/farmer"] });
      toast({
        title: "Request Updated",
        description: "The purchase request has been updated",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update request",
        description: error.message || "There was an error updating the request",
      });
    },
  });

  // Form for creating a new crop listing
  const newListingForm = useForm<z.infer<typeof cropListingSchema>>({
    resolver: zodResolver(cropListingSchema),
    defaultValues: {
      title: "",
      cropName: "",
      cropVariety: "",
      quantity: 0,
      pricePerUnit: 0,
      unit: "kg",
      qualityGrade: "A",
      description: "",
      harvestDate: new Date().toISOString().split("T")[0],
      availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  });

  // Form for submitting a purchase request
  const purchaseForm = useForm<z.infer<typeof purchaseRequestSchema>>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: {
      requestedQuantity: 0,
      bidPricePerUnit: 0,
      message: "",
      contactName: farmer?.fullName || "",
      contactNumber: "",
    },
  });

  // Handler for creating a new listing
  function onSubmitNewListing(values: z.infer<typeof cropListingSchema>) {
    createListingMutation.mutate(values);
  }

  // Handler for accepting a purchase request
  function acceptRequest(requestId: number) {
    respondToRequestMutation.mutate({ id: requestId, status: "accepted" });
  }

  // Handler for rejecting a purchase request
  function rejectRequest(requestId: number) {
    respondToRequestMutation.mutate({ id: requestId, status: "rejected" });
  }

  // Function to open the buyer dialog with a specific listing
  function openBuyerDialog(listing: CropListing) {
    setSelectedListing(listing);
    purchaseForm.setValue("listingId", listing.id);
    purchaseForm.setValue("requestedQuantity", 1);
    purchaseForm.setValue("bidPricePerUnit", listing.pricePerUnit);
    setIsBuyerDialogOpen(true);
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">{t("AgriMarket")}</h1>
        <p className="mt-1 text-sm text-gray-600">{t("Access market prices, sell your produce, and connect with buyers")}</p>
      </div>
      
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">{t("Market Prices")}</TabsTrigger>
          <TabsTrigger value="listings">{t("Crop Listings")}</TabsTrigger>
          <TabsTrigger value="requests">{t("Purchase Requests")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="market">
          <MarketConnect />
        </TabsContent>
        
        <TabsContent value="listings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-heading font-semibold text-gray-900">{t("Available Crops")}</h2>
            <Button onClick={() => setIsNewListingDialogOpen(true)}>
              {t("Add New Listing")}
            </Button>
          </div>
          
          {isLoadingListings ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-heading">{listing.title}</CardTitle>
                      <Badge variant={listing.farmerId === farmer?.id ? "outline" : "default"}>
                        {listing.farmerId === farmer?.id ? t("Your Listing") : t("Available")}
                      </Badge>
                    </div>
                    <CardDescription>
                      {listing.cropName} {listing.cropVariety && `(${listing.cropVariety})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t("Price")}</span>
                        <span className="font-medium">₹{listing.pricePerUnit} / {listing.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t("Quantity")}</span>
                        <span>{listing.quantity} {listing.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t("Location")}</span>
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t("Available until")}</span>
                        <span>{format(new Date(listing.availableUntil), 'dd MMM yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t("Quality")}</span>
                        <span>{listing.qualityGrade || "Standard"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {listing.farmerId !== farmer?.id ? (
                      <Button className="w-full" onClick={() => openBuyerDialog(listing)}>
                        {t("Inquire to Buy")}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        {t("Your Listing")}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 mt-4 text-center">
              <div className="text-center">
                <span className="material-icons text-primary text-4xl">inventory</span>
                <h2 className="mt-2 text-lg font-medium text-gray-900">{t("No Crop Listings Available")}</h2>
                <p className="mt-1 text-gray-500">{t("Be the first to add a crop listing to the marketplace")}</p>
                <Button className="mt-4" onClick={() => setIsNewListingDialogOpen(true)}>
                  {t("Add New Listing")}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="requests">
          <div className="space-y-4">
            <h2 className="text-xl font-heading font-semibold text-gray-900">{t("Purchase Requests")}</h2>
            
            {isLoadingRequests ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : purchaseRequests && purchaseRequests.length > 0 ? (
              <div className="space-y-4 mt-4">
                {purchaseRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-heading">{t("Purchase Request")} #{request.id}</CardTitle>
                        <Badge 
                          variant={
                            request.status === "pending" ? "default" : 
                            request.status === "accepted" ? "secondary" : 
                            request.status === "completed" ? "outline" : "destructive"
                          }
                        >
                          {t(request.status.charAt(0).toUpperCase() + request.status.slice(1))}
                        </Badge>
                      </div>
                      <CardDescription>
                        {t("Received")} {formatDistanceToNow(new Date(request.requestDate), { addSuffix: true })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t("Listing ID")}</span>
                          <span>#{request.listingId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t("Quantity")}</span>
                          <span>{request.requestedQuantity}</span>
                        </div>
                        {request.bidPricePerUnit && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t("Bid Price")}</span>
                            <span>₹{request.bidPricePerUnit}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t("Contact")}</span>
                          <span>{request.contactName || "Not provided"}</span>
                        </div>
                        {request.message && (
                          <div className="pt-2">
                            <span className="text-gray-500 block">{t("Message")}:</span>
                            <p className="mt-1 text-gray-700">{request.message}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    {request.status === "pending" && (
                      <CardFooter className="flex gap-2">
                        <Button 
                          variant="default" 
                          className="flex-1"
                          onClick={() => acceptRequest(request.id)}
                        >
                          {t("Accept")}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => rejectRequest(request.id)}
                        >
                          {t("Reject")}
                        </Button>
                      </CardFooter>
                    )}
                    {request.status === "accepted" && (
                      <CardFooter>
                        <div className="w-full text-center text-sm text-gray-600">
                          {t("You've accepted this request. The buyer will contact you soon.")}
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 mt-4 text-center">
                <div className="text-center">
                  <span className="material-icons text-primary text-4xl">receipt_long</span>
                  <h2 className="mt-2 text-lg font-medium text-gray-900">{t("No Purchase Requests")}</h2>
                  <p className="mt-1 text-gray-500">{t("You don't have any purchase requests yet")}</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog for creating a new crop listing */}
      <Dialog open={isNewListingDialogOpen} onOpenChange={setIsNewListingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("Create New Crop Listing")}</DialogTitle>
            <DialogDescription>
              {t("Add your crop to the marketplace to connect with potential buyers")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...newListingForm}>
            <form onSubmit={newListingForm.handleSubmit(onSubmitNewListing)} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <FormField
                  control={newListingForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Listing Title")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("e.g. Fresh Organic Rice")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Crop Name */}
                <FormField
                  control={newListingForm.control}
                  name="cropName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Crop Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("e.g. Rice, Wheat, Cotton")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Crop Variety */}
                <FormField
                  control={newListingForm.control}
                  name="cropVariety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Variety")} ({t("optional")})</FormLabel>
                      <FormControl>
                        <Input placeholder={t("e.g. Basmati, Durum")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Quality Grade */}
                <FormField
                  control={newListingForm.control}
                  name="qualityGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Quality Grade")}</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select quality grade")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">{t("Grade A (Premium)")}</SelectItem>
                            <SelectItem value="B">{t("Grade B (Standard)")}</SelectItem>
                            <SelectItem value="C">{t("Grade C (Economy)")}</SelectItem>
                            <SelectItem value="Organic">{t("Organic Certified")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Quantity */}
                <FormField
                  control={newListingForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Quantity")}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Unit */}
                <FormField
                  control={newListingForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Unit")}</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select unit")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">{t("Kilogram (kg)")}</SelectItem>
                            <SelectItem value="quintal">{t("Quintal (100 kg)")}</SelectItem>
                            <SelectItem value="ton">{t("Ton (1000 kg)")}</SelectItem>
                            <SelectItem value="bag">{t("Bag")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Price per Unit */}
                <FormField
                  control={newListingForm.control}
                  name="pricePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Price per Unit")} (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0.01" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Harvest Date */}
                <FormField
                  control={newListingForm.control}
                  name="harvestDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Harvest Date")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Available Until */}
                <FormField
                  control={newListingForm.control}
                  name="availableUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Available Until")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Description */}
              <FormField
                control={newListingForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Description")} ({t("optional")})</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t("Provide additional details about your crop...")} 
                        className="min-h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewListingDialogOpen(false)}
                >
                  {t("Cancel")}
                </Button>
                <Button 
                  type="submit"
                  disabled={createListingMutation.isPending}
                >
                  {createListingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("Creating...")}
                    </>
                  ) : (
                    t("Create Listing")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for submitting a purchase request */}
      <Dialog open={isBuyerDialogOpen} onOpenChange={setIsBuyerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle>{t("Inquire to Purchase")}</DialogTitle>
                <DialogDescription>
                  {t("Contact the farmer about purchasing")} {selectedListing.title}
                </DialogDescription>
              </DialogHeader>
              
              <div className="bg-muted/50 p-3 rounded-md mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{selectedListing.title}</h3>
                  <span className="text-sm text-muted-foreground">#{selectedListing.id}</span>
                </div>
                <div className="text-sm space-y-1 mt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Price")}</span>
                    <span>₹{selectedListing.pricePerUnit} / {selectedListing.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Available")}</span>
                    <span>{selectedListing.quantity} {selectedListing.unit}</span>
                  </div>
                </div>
              </div>
              
              <Form {...purchaseForm}>
                <form className="space-y-4">
                  <input type="hidden" name="listingId" value={selectedListing.id} />
                  
                  {/* Requested Quantity */}
                  <FormField
                    control={purchaseForm.control}
                    name="requestedQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Quantity to Purchase")} ({selectedListing.unit})</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max={selectedListing.quantity} 
                            step="1" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          {t("Available")}: {selectedListing.quantity} {selectedListing.unit}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Bid Price (optional) */}
                  <FormField
                    control={purchaseForm.control}
                    name="bidPricePerUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Your Bid Price")} (₹ / {selectedListing.unit}) ({t("optional")})</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            placeholder={selectedListing.pricePerUnit.toString()}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          {t("Listed price")}: ₹{selectedListing.pricePerUnit} / {selectedListing.unit}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Contact Name */}
                  <FormField
                    control={purchaseForm.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Contact Name")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("Your full name")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Contact Number */}
                  <FormField
                    control={purchaseForm.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Contact Phone Number")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("Your phone number")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Message */}
                  <FormField
                    control={purchaseForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Message to Farmer")} ({t("optional")})</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t("Any additional information or questions...")} 
                            className="min-h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsBuyerDialogOpen(false)}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button 
                      type="submit"
                    >
                      {t("Submit Inquiry")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
