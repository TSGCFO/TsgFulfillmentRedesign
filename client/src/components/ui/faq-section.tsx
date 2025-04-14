import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

export interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
  description?: string;
  className?: string;
  mainEntity?: string;
}

/**
 * FAQ Section component with structured data for SEO
 */
export function FAQSection({
  items,
  title = "Frequently Asked Questions",
  description,
  className,
  mainEntity = "https://tsgfulfillment.com/faq"
}: FAQSectionProps) {
  // Prepare FAQPage structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": typeof item.answer === 'string' 
          ? item.answer 
          : "Please visit our website for a detailed answer to this question."
      }
    }))
  };
  
  return (
    <section className={cn("py-16", className)}>
      {/* Hidden JSON-LD structured data for SEO */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold font-poppins mb-4">{title}</h2>
          
          {description && (
            <p className="text-gray-600 mb-8">{description}</p>
          )}
          
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;