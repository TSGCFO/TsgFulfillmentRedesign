import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid business email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid mobile number' }),
  company: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  currentShipments: z.string().min(1, { message: 'Please select current monthly shipments' }),
  expectedShipments: z.string().min(1, { message: 'Please select expected monthly shipments' }),
  services: z.string().min(1, { message: 'Please select fulfillment services' }),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuoteForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      currentShipments: '',
      expectedShipments: '',
      services: '',
      message: '',
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/quote', data);
      toast({
        title: 'Quote request submitted',
        description: 'We will get back to you soon!',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Error submitting form',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  placeholder="Name *" 
                  className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-gray-700 placeholder-gray-500" 
                  {...field} 
                />
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
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Business Email *" 
                  className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-gray-700 placeholder-gray-500" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  type="tel"
                  placeholder="Mobile Number *" 
                  className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-gray-700 placeholder-gray-500" 
                  {...field} 
                />
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
              <FormControl>
                <Input 
                  placeholder="Company Name *" 
                  className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-gray-700 placeholder-gray-500" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="currentShipments"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-gray-700">
                    <SelectValue placeholder="Current Monthly Shipments*" className="text-gray-500" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0-250">0-250</SelectItem>
                  <SelectItem value="250-500">250-500</SelectItem>
                  <SelectItem value="500-1000">500-1000</SelectItem>
                  <SelectItem value="1000-2000">1000-2000</SelectItem>
                  <SelectItem value="2000-5000">2000-5000</SelectItem>
                  <SelectItem value="5000+">5000+</SelectItem>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-gray-700">
                    <SelectValue placeholder="Monthly shipments expected 12 months from now*" className="text-gray-500" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="less-than-2000">Less than 2000</SelectItem>
                  <SelectItem value="2000-10000">2,000-10,000</SelectItem>
                  <SelectItem value="10001-50000">10,001-50,000</SelectItem>
                  <SelectItem value="50001-100000">50,001-100,000</SelectItem>
                  <SelectItem value="100000+">100,000+</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="services"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-gray-700">
                    <SelectValue placeholder="Looking for fulfillment services" className="text-gray-500" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="warehousing">Warehousing</SelectItem>
                  <SelectItem value="order-fulfillment">Order Fulfillment</SelectItem>
                  <SelectItem value="shipping-logistics">Shipping & Logistics</SelectItem>
                  <SelectItem value="inventory-management">Inventory Management</SelectItem>
                  <SelectItem value="kitting-assembly">Kitting & Assembly</SelectItem>
                  <SelectItem value="reverse-logistics">Reverse Logistics</SelectItem>
                  <SelectItem value="value-added-services">Value-Added Services</SelectItem>
                  <SelectItem value="freight-forwarding">Freight Forwarding</SelectItem>
                  <SelectItem value="healthcare-marketing">Healthcare Marketing Services</SelectItem>
                  <SelectItem value="complete-solution">Complete Fulfillment Solution</SelectItem>
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
              <FormControl>
                <Textarea 
                  placeholder="Additional Information" 
                  className="w-full p-4 min-h-[120px] border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-gray-700 placeholder-gray-500 resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-start space-x-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <input type="checkbox" className="mt-1" />
          <span className="text-sm text-gray-600">I'm not a robot</span>
          <div className="ml-auto">
            <div className="text-xs text-gray-400">reCAPTCHA</div>
            <div className="text-xs text-gray-400">Privacy - Terms</div>
          </div>
        </div>
        
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-4 px-6 rounded-lg font-medium hover:bg-primary/90 transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </Form>
  );
}