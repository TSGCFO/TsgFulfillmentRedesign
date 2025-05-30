import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { EnhancedImage } from '@/components/ui/enhanced-image';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

interface TestimonialProps {
  quote: string;
  name: string;
  position: string;
  company: string;
  image: string;
  rating: number;
}

const TestimonialsSection: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials: TestimonialProps[] = [
    {
      quote: "Since partnering with TSG Fulfillment, our shipping costs have decreased by 23% while our delivery times have improved significantly. Their integrated technology platform provides us with real-time visibility, allowing us to make data-driven decisions and deliver exceptional customer experiences.",
      name: "Sarah Johnson",
      position: "CEO",
      company: "Fashion Retail Co.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      rating: 5
    },
    {
      quote: "TSG's technology integration was seamless. We now have real-time visibility into our inventory and order status, which has significantly improved our operational efficiency. Their strategic warehouse locations have helped us reduce shipping times by 47%, leading to higher customer satisfaction scores and repeat purchases.",
      name: "Michael Chen",
      position: "Operations Director",
      company: "Tech Gadgets Inc.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      rating: 5
    },
    {
      quote: "During our peak season, TSG scaled operations flawlessly to handle a 300% increase in orders. Their flexibility, responsiveness, and proactive communication have made them an invaluable partner in our growth strategy. We've been able to expand into new markets with confidence knowing our fulfillment is in expert hands.",
      name: "David Rodriguez",
      position: "Founder",
      company: "Seasonal Gifts Co.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      rating: 5
    }
  ];

  const handleNext = () => {
    setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const currentTestimonial = testimonials[activeTestimonial];

  return (
    <section 
      id="testimonials" 
      className="py-24 bg-primary relative overflow-hidden"
      itemScope
      itemType="https://schema.org/Review"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-80 -right-80 w-[500px] h-[500px] rounded-full border-[50px] border-white"></div>
        <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] rounded-full border-[30px] border-white"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="inline-block text-white/90 font-semibold uppercase tracking-wider mb-3">Testimonials</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-2 mb-6">What Our Clients Say</h2>
          <p className="text-white/80 max-w-3xl mx-auto text-lg">
            Don't just take our word for it - hear from businesses who have transformed their operations with TSG Fulfillment.
          </p>
        </motion.div>
        
        <motion.div 
          className="max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Quote section */}
              <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex mb-6" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                    <meta itemProp="worstRating" content="1" />
                    <meta itemProp="bestRating" content="5" />
                    <meta itemProp="ratingValue" content={currentTestimonial.rating.toString()} />
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star 
                        key={index} 
                        className={`w-5 h-5 ${index < currentTestimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-10 h-10 text-primary/20 transform -scale-x-100" />
                    <p 
                      className="italic text-gray-700 text-lg md:text-xl relative z-10 pl-8 md:pl-10"
                      itemProp="reviewBody"
                    >
                      "{currentTestimonial.quote}"
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center" itemProp="author" itemScope itemType="https://schema.org/Person">
                  <div className="flex-shrink-0">
                    <EnhancedImage 
                      src={currentTestimonial.image} 
                      alt={currentTestimonial.name} 
                      width={60}
                      height={60}
                      className="rounded-full w-14 h-14 object-cover" 
                    />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900" itemProp="name">{currentTestimonial.name}</h4>
                    <div itemProp="jobTitle">{currentTestimonial.position}</div>
                    <div className="text-primary" itemProp="worksFor" itemScope itemType="https://schema.org/Organization">
                      <span itemProp="name">{currentTestimonial.company}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image section */}
              <div className="md:w-1/3 bg-primary">
                <div className="h-full flex items-center justify-center p-6 md:p-0">
                  <div className="text-white text-center">
                    <div className="text-6xl md:text-8xl font-bold opacity-10">❝</div>
                    <div className="mt-4 font-semibold text-xl">Success Stories</div>
                    <div className="mt-6 flex justify-center space-x-4">
                      <button 
                        onClick={handlePrev}
                        className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        aria-label="Previous testimonial"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={handleNext}
                        className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        aria-label="Next testimonial"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-4 text-white/70">
                      {activeTestimonial + 1} / {testimonials.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Structured data for testimonials */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "TSG Fulfillment Services",
        "review": testimonials.map(testimonial => ({
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": testimonial.rating,
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": testimonial.name
          },
          "reviewBody": testimonial.quote
        }))
      })}} />
    </section>
  );
};

export default TestimonialsSection;
