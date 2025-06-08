import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Send } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

export interface UnifiedContactFormProps {
  endpoint: string;
  title?: string;
  description?: string;
}

// Complete quote form schema
const quoteFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid business email address"),
  phone: z.string().min(7, "Please enter a valid mobile number"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  currentShipments: z.string().min(1, "Please select current monthly shipments"),
  expectedShipments: z.string().min(1, "Please select expected monthly shipments"),
  services: z.string().min(1, "Please select fulfillment services"),
  message: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "You must agree to the privacy policy to submit this form"
  }),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

// Define dropdown options
const currentShipmentsOptions = [
  "1-50",
  "51-100", 
  "101-250",
  "251-500",
  "501-1000",
  "1001-2000",
  "2000+"
];

const expectedShipmentsOptions = [
  "1-50",
  "51-100", 
  "101-250",
  "251-500",
  "501-1000",
  "1001-2000",
  "2001-10000",
  "10000+"
];

const servicesOptions = [
  "Fulfillment Services",
  "Warehousing", 
  "Transportation",
  "Supply Chain Consulting",
  "E-commerce Solutions",
  "Inventory Management",
  "Reverse Logistics",
  "Value-Added Services",
  "Custom Solutions"
];

export function UnifiedContactForm({
  endpoint,
  title = "Request a Quote",
  description = "Get a customized quote for your fulfillment needs. Our team will analyze your requirements and provide competitive pricing within 24 hours."
}: UnifiedContactFormProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      currentShipments: "",
      expectedShipments: "",
      services: "",
      message: "",
      consent: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: QuoteFormValues) => {
      console.log("Submitting quote form:", data);
      
      // Transform data to match API expectations
      const submitData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        service: data.services, // Keep for backward compatibility
        currentShipments: data.currentShipments,
        expectedShipments: data.expectedShipments,
        services: data.services,
        message: data.message || `Current Shipments: ${data.currentShipments}/month, Expected: ${data.expectedShipments}/month`,
        consent: data.consent
      };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        throw new Error(`Server error: ${res.status}`);
      }
      
      const result = await res.json();
      console.log("Success response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Quote form submission successful:", data);
      toast({
        title: "Quote Request Submitted!",
        description: "We'll get back to you within 24 hours with a detailed quote.",
      });
      setSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      console.error("Quote form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: QuoteFormValues) {
    mutation.mutate(values);
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-2xl font-poppins">{title}</CardTitle>
        <p className="text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="p-8">
        {submitted ? (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Quote Request Submitted Successfully!</h3>
              <p className="text-green-700">Thank you for your interest in TSG Fulfillment. Our team will review your requirements and get back to you within 24 hours with a detailed quote.</p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="currentShipments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Monthly Shipments *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select current shipments" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currentShipmentsOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedShipments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Monthly Shipments *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expected shipments" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expectedShipmentsOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Services Needed *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {servicesOptions.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="min-h-[120px]" 
                        placeholder="Please describe your fulfillment needs, special requirements, or any questions you have..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I agree to TSG Fulfillment's privacy policy and terms of service *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                size="lg"
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Quote Request
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}