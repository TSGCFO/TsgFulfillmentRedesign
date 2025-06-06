import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, Car, Truck, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Locations: React.FC = () => {
  const locations = [
    {
      id: 'mississauga',
      name: 'Mississauga Distribution Center',
      address: '123 Industrial Drive, Mississauga, ON L5T 2Y4',
      phone: '(289) 815-5869',
      email: 'mississauga@tsgfulfillment.com',
      hours: 'Mon-Fri: 8:00 AM - 6:00 PM',
      services: ['Warehousing', 'Fulfillment', 'Transportation'],
      coordinates: { lat: 43.6175, lng: -79.6441 },
      description: 'Our flagship facility serving the Greater Toronto Area with comprehensive fulfillment services.'
    },
    {
      id: 'toronto',
      name: 'Toronto Fulfillment Hub',
      address: '456 Logistics Blvd, Toronto, ON M8Z 1X5',
      phone: '(416) 555-0123',
      email: 'toronto@tsgfulfillment.com',
      hours: 'Mon-Fri: 7:00 AM - 7:00 PM',
      services: ['E-commerce Fulfillment', 'Same-Day Delivery', 'Returns Processing'],
      coordinates: { lat: 43.6532, lng: -79.3832 },
      description: 'Strategic downtown location for rapid order fulfillment and urban distribution.'
    },
    {
      id: 'brampton',
      name: 'Brampton Warehouse',
      address: '789 Supply Chain Way, Brampton, ON L6T 4B3',
      phone: '(905) 555-0456',
      email: 'brampton@tsgfulfillment.com',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
      services: ['Cold Storage', 'Bulk Storage', 'Cross-Docking'],
      coordinates: { lat: 43.7315, lng: -79.7624 },
      description: 'Specialized facility with temperature-controlled storage and cross-docking capabilities.'
    }
  ];

  const generateMapUrl = (location: typeof locations[0]) => {
    const { lat, lng } = location.coordinates;
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
              Our Locations
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Strategically positioned across Ontario to serve your supply chain needs with maximum efficiency and reach.
            </p>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Building2 className="h-6 w-6 text-primary mr-3" />
                    {location.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {location.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{location.address}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-primary mr-2" />
                      <a 
                        href={`tel:${location.phone.replace(/[^\d]/g, '')}`} 
                        className="text-sm text-gray-700 hover:text-primary transition-colors"
                      >
                        {location.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-primary mr-2" />
                      <a 
                        href={`mailto:${location.email}`} 
                        className="text-sm text-gray-700 hover:text-primary transition-colors"
                      >
                        {location.email}
                      </a>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm text-gray-700">{location.hours}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Services Available:</h4>
                    <div className="flex flex-wrap gap-2">
                      {location.services.map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                    >
                      <Car className="h-4 w-4 mr-2" />
                      Get Directions
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                Our strategically located facilities ensure optimal coverage across the Greater Toronto Area and beyond.
              </p>
            </div>

            {/* Embedded Google Map */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d184552.57909730427!2d-79.54286406250001!3d43.71837775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2a1d7471156d%3A0x4ecad8e272e4c2a2!2sMississauga%2C%20ON%2C%20Canada!5e0!3m2!1sen!2sus!4v1649123456789!5m2!1sen!2sus"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="TSG Fulfillment Locations"
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