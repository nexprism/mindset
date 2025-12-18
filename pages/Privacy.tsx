import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Eye, Lock, Trash2, Mail } from 'lucide-react';
import { trackPageView } from '../services/analytics';

const Privacy: React.FC = () => {
  useEffect(() => {
    trackPageView('/privacy', 'Privacy Policy');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Company Info */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-8 border border-slate-800">
          <h2 className="text-lg font-bold text-orange-500 mb-2">Lapaas Digital Pvt. Ltd.</h2>
          <p className="text-slate-400 text-sm">
            GARG SHOPPING MALL, PLOT NO.07,08 AND 09 OPPOSITE SECTOR.-11 EXTN PSP-IV AREA, PHASE-II, Rohini, New Delhi, Delhi 110089
          </p>
          <p className="text-slate-400 text-sm mt-1">Phone: 095400 65704</p>
        </div>

        <p className="text-slate-400 mb-8">
          Last updated: January 2026
        </p>

        {/* Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-center">
            <Database className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-bold text-sm mb-1">100% Local Storage</h3>
            <p className="text-xs text-slate-400">All your data stays on your device</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-center">
            <Lock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-bold text-sm mb-1">No Server Storage</h3>
            <p className="text-xs text-slate-400">We don't store user data on servers</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-center">
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-bold text-sm mb-1">Easy Deletion</h3>
            <p className="text-xs text-slate-400">Clear your data anytime from settings</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Introduction</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                Welcome to Lapaas Mindset. We are committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our application.
              </p>
              <p>
                <strong className="text-white">Important:</strong> Lapaas Mindset is designed as a 100% serverless application for users. We do not collect, store, or process any personal user data on our servers.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Data Storage</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                All your data, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Your name and profile information</li>
                <li>Journal entries and reflections</li>
                <li>Progress and completed days</li>
                <li>Daily goals and their history</li>
                <li>App preferences (language, theme, reminders)</li>
              </ul>
              <p>
                is stored <strong className="text-white">locally on your device</strong> using your browser's localStorage. This data never leaves your device and is not transmitted to any server.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Analytics</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                We use Google Analytics to understand how users interact with our app. This helps us improve the user experience. Google Analytics may collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Pages visited and time spent</li>
                <li>Device type and browser information</li>
                <li>General geographic location (country/city level)</li>
                <li>App usage patterns (anonymized)</li>
              </ul>
              <p>
                This data is aggregated and anonymized. We cannot identify individual users from this data.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Advertising</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                We display advertisements through Google AdSense to support the free availability of this app. Google may use cookies to serve ads based on your prior visits to our app or other websites.
              </p>
              <p>
                You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Google's Ads Settings</a>.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Trash2 className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Data Deletion</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                Since all data is stored locally on your device, you have complete control over it:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Use the "Reset App" option in Profile settings to delete all app data</li>
                <li>Clear your browser's localStorage to remove all data</li>
                <li>Uninstall the PWA to remove all associated data</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Contact Us</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <p className="font-bold text-white">Lapaas Digital Pvt. Ltd.</p>
                <p className="text-slate-400 text-sm mt-1">
                  GARG SHOPPING MALL, PLOT NO.07,08 AND 09<br />
                  OPPOSITE SECTOR.-11 EXTN PSP-IV AREA, PHASE-II<br />
                  Rohini, New Delhi, Delhi 110089
                </p>
                <p className="text-orange-500 mt-2">Phone: 095400 65704</p>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
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

export default Privacy;
