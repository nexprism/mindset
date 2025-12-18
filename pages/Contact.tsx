import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Clock, MessageCircle, Building } from 'lucide-react';
import { trackPageView } from '../services/analytics';

const Contact: React.FC = () => {
  useEffect(() => {
    trackPageView('/contact', 'Contact Us');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Contact Us</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Get in Touch</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Have questions, feedback, or suggestions? We'd love to hear from you!
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Phone */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-orange-500/50 transition-colors">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Call Us</h3>
            <p className="text-slate-400 text-sm mb-4">
              Available Monday to Saturday, 10 AM - 6 PM IST
            </p>
            <a 
              href="tel:+919540065704" 
              className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors"
            >
              095400 65704
            </a>
          </div>

          {/* Office Hours */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-orange-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Business Hours</h3>
            <p className="text-slate-400 text-sm mb-4">
              We're here to help during these hours
            </p>
            <div className="space-y-1 text-sm">
              <p><span className="text-slate-500">Mon - Sat:</span> <span className="text-white font-medium">10:00 AM - 6:00 PM</span></p>
              <p><span className="text-slate-500">Sunday:</span> <span className="text-white font-medium">Closed</span></p>
            </div>
          </div>
        </div>

        {/* Office Address */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-12">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
              <Building className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Registered Office</h3>
              <h4 className="text-orange-500 font-bold mb-3">Lapaas Digital Pvt. Ltd.</h4>
              <div className="flex items-start text-slate-400">
                <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-slate-500" />
                <div>
                  <p>GARG SHOPPING MALL</p>
                  <p>PLOT NO.07,08 AND 09</p>
                  <p>OPPOSITE SECTOR.-11 EXTN PSP-IV AREA, PHASE-II</p>
                  <p>Rohini, New Delhi, Delhi 110089</p>
                  <p className="mt-2 text-white font-medium">India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 mb-12">
          <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <h4 className="font-bold mb-1">Is my data stored on your servers?</h4>
              <p className="text-sm text-orange-100">No! Lapaas Mindset is 100% serverless. All your data is stored locally on your device and never leaves it.</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <h4 className="font-bold mb-1">Is the app free to use?</h4>
              <p className="text-sm text-orange-100">Yes, Lapaas Mindset is completely free. We support the app through non-intrusive advertisements.</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <h4 className="font-bold mb-1">How do I reset my progress?</h4>
              <p className="text-sm text-orange-100">Go to your Profile page and scroll down to Settings. You'll find a "Reset App" option there.</p>
            </div>
          </div>
        </div>

        {/* About the App */}
        <div className="text-center mb-12">
          <h3 className="text-lg font-bold mb-4">About Lapaas Mindset</h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Lapaas Mindset is a personal development application designed to help you build positive habits and transform your mindset through structured 21-day journeys. Our mission is to make self-improvement accessible, engaging, and effective for everyone.
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;
