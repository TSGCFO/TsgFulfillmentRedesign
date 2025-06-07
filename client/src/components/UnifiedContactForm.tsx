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
import { CheckCircle } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

export interface UnifiedContactFormProps {
  endpoint: string;
  includeService?: boolean;
  includeSubject?: boolean;
  includeConsent?: boolean;
  serviceOptions?: string[];
  subjectOptions?: string[];
  defaultValues?: Partial<Record<string, string | boolean>>;
}

export function UnifiedContactForm({
  endpoint,
  includeService = false,
  includeSubject = false,
  includeConsent = false,
  serviceOptions = [],
  subjectOptions = [],
  defaultValues = {},
}: UnifiedContactFormProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const baseSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(7, "Please enter a valid phone number"),
    company: z.string().min(2, "Company name must be at least 2 characters"),
    message: z.string().min(10, "Message must be at least 10 characters").optional(),
  });

  const extendedSchema = baseSchema
    .extend(includeService ? { service: z.string().min(1, "Please select a service") } : {})
    .extend(includeSubject ? { subject: z.string().min(1, "Please select a subject") } : {})
    .extend(includeConsent ? { 
      consent: z.boolean().refine(val => val === true, {
        message: "You must agree to the privacy policy to submit this form"
      })
    } : {});

  type FormValues = z.infer<typeof extendedSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      ...(includeService ? { service: "" } : {}),
      ...(includeSubject ? { subject: "" } : {}),
      ...(includeConsent ? { consent: false } : {}),
      ...(defaultValues ?? {}),
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      console.log("Submitting form data:", data);
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      console.log("Form submission successful:", data);
      toast({
        title: "Quote Request Submitted!",
        description: "We'll get back to you within 24 hours with a detailed quote.",
      });
      setSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-2xl font-poppins">Contact Us</CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        {submitted ? (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <p className="text-green-700">Thank you! We will be in touch soon.</p>
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
                      <FormLabel>Full Name *</FormLabel>
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
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
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
                      <FormLabel>Phone Number *</FormLabel>
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
                        <Input placeholder="Your Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {includeSubject && (
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjectOptions.map((option) => (
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
              )}

              {includeService && (
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Needed *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceOptions.map((service) => (
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
              )}

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {includeConsent && (
                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I agree to the privacy policy *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
