import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UnifiedContactForm } from "@/components/UnifiedContactForm";

const subjects = [
  "General Inquiry",
  "Request a Quote",
  "Partnership Opportunity",
  "Technical Support",
  "Billing Question",
  "Career Opportunities",
  "Media Inquiry",
  "Other"
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const ContactForm = () => {
  const [, setLocation] = useLocation();

  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Phone",
      content: "(289) 815-5869",
      href: "tel:2898155869"
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email",
      content: "info@tsgfulfillment.com",
      href: "mailto:info@tsgfulfillment.com"
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Address",
      content: "6750 Langstaff Road, Vaughan, Ontario, L4H 5K2",
      href: "https://maps.google.com"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Business Hours",
      content: "Mon-Fri: 8:00 AM - 6:00 PM EST",
      href: "#"
    }
  ];

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary to-primary/80 text-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="max-w-4xl mx-auto text-center"
            >
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 mb-6"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-6">
                Contact Us
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Ready to streamline your fulfillment operations? Get in touch with our logistics experts for personalized solutions.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
              {/* Contact Information */}
              <div className="lg:col-span-1">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold font-poppins mb-4">Get in Touch</h2>
                    <p className="text-gray-600 mb-8">
                      Our team of fulfillment experts is ready to help you optimize your logistics operations. Reach out to us through any of the channels below.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {contactInfo.map((item, index) => (
                      <Card key={index} className="border-primary/10 hover:border-primary/20 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 p-3 rounded-lg">
                              {item.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                              {item.href !== "#" ? (
                                <a href={item.href} className="text-gray-600 hover:text-primary transition-colors">
                                  {item.content}
                                </a>
                              ) : (
                                <p className="text-gray-600">{item.content}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="space-y-8"
                >
                  <UnifiedContactForm
                    endpoint="/api/contact"
                    includeSubject
                    subjectOptions={subjects}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ContactForm;