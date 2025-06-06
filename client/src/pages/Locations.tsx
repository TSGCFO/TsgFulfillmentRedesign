import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, Car, Truck, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Locations: React.FC = () => {
  const location = {
    id: 'vaughan',
    name: 'TSG Fulfillment Services',
    address: '6750 Langstaff Road, Vaughan, Ontario, L4H 5K2',
    phone: '(289) 815-5869',
    email: 'info@tsgfulfillment.com',
    hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    services: ['Warehousing', 'Fulfillment', 'Transportation', 'Value Added Services'],
    coordinates: { lat: 43.8013, lng: -79.5425 },
    description: 'Our fulfillment center serves businesses across Ontario with comprehensive logistics and warehousing solutions.'
  };

  const generateMapUrl = (loc: typeof location) => {
    const { lat, lng } = loc.coordinates;
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${lat},${lng}&zoom=15`;
  };

  return (
    <>
      <Helmet>
        <title>Locations - TSG Fulfillment</title>
        <meta name="description" content="Find TSG Fulfillment warehouse and distribution centers across Ontario. Strategic locations for optimal supply chain efficiency." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-primary text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Location
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Our fulfillment center in Vaughan, Ontario serves your supply chain needs with maximum efficiency and reach.
            </p>
          </div>
        </div>

        {/* Location Details */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Building2 className="h-8 w-8 text-primary mr-4" />
                  {location.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {location.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-lg mb-4">Contact Information</h4>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{location.address}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-primary mr-3" />
                      <a 
                        href={`tel:${location.phone.replace(/[^\d]/g, '')}`} 
                        className="text-gray-700 hover:text-primary transition-colors"
                      >
                        {location.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-primary mr-3" />
                      <a 
                        href={`mailto:${location.email}`} 
                        className="text-gray-700 hover:text-primary transition-colors"
                      >
                        {location.email}
                      </a>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-primary mr-3" />
                      <span className="text-gray-700">{location.hours}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-4">Services Available</h4>
                    <div className="flex flex-wrap gap-3">
                      {location.services.map((service: string) => (
                        <Badge key={service} variant="secondary" className="text-sm py-2 px-3">
                          {service}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="pt-6">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                      >
                        <Car className="h-5 w-5 mr-2" />
                        Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Find Us on the Map
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our fulfillment center is strategically located in Vaughan, Ontario, providing excellent access to the Greater Toronto Area.
              </p>
            </div>

            {/* Embedded Google Map */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2874.123456789!2d${location.coordinates.lng}!3d${location.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDQ4JzA0LjciTiA3OcKwMzInMzMuMCJX!5e0!3m2!1sen!2sca!4v1649123456789!5m2!1sen!2sca`}
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="TSG Fulfillment Location"
              />
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-primary text-white py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Optimize Your Supply Chain?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Contact us to discuss how our strategic locations can benefit your business operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/quote"
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                <Truck className="h-5 w-5 mr-2" />
                Get a Quote
              </a>
              <a
                href="tel:2898155869"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Locations;