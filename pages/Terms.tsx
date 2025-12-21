import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale, RefreshCw } from 'lucide-react';
import { trackPageView } from '../services/analytics';

const Terms: React.FC = () => {
  useEffect(() => {
    trackPageView('/terms', 'Terms of Service');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link to="/home" className="flex items-center text-slate-400 hover:text-white transition-colors mr-4">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Terms of Service</h1>
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

        {/* Sections */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Agreement to Terms</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                By accessing or using Lapaas Mindset ("the App"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the App.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the App.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Use of the App</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                Lapaas Mindset is a personal development application designed to help users build positive habits and mindset through 21-day journeys. By using this App, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Use the App only for lawful purposes</li>
                <li>Not attempt to reverse engineer or modify the App</li>
                <li>Not use the App to distribute harmful content</li>
                <li>Take responsibility for your own personal development journey</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Scale className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Intellectual Property</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                The App and its original content, features, and functionality are owned by Lapaas Digital Pvt. Ltd. and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                The educational content provided in the App is inspired by various self-help and personal development literature. References to books and authors are for educational purposes only.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Disclaimer</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                The information provided in this App is for general informational and educational purposes only. It is not intended as:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Professional medical, psychological, or financial advice</li>
                <li>A substitute for professional consultation</li>
                <li>A guarantee of specific results or outcomes</li>
              </ul>
              <p>
                Always seek the advice of qualified professionals for specific concerns related to your health, finances, or well-being.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Limitation of Liability</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                In no event shall Lapaas Digital Pvt. Ltd., its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the App.
              </p>
              <p>
                The App is provided "as is" without warranties of any kind, either express or implied.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <RefreshCw className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Changes to Terms</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              <p>
                By continuing to access or use our App after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Scale className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Governing Law</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or the use of the App shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold">Contact Us</h2>
            </div>
            <div className="text-slate-300 space-y-4 pl-9">
              <p>
                If you have any questions about these Terms, please contact us:
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
            to="/home" 
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

export default Terms;
