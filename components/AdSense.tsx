import React, { useEffect, useRef } from 'react';

const ADSENSE_CLIENT_ID = 'ca-pub-3337061110775910';
const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
    adsenseScriptLoaded?: boolean;
  }
}

// Load AdSense script dynamically (only once)
const loadAdSenseScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject('Window not available');
      return;
    }

    // Already loaded
    if (window.adsenseScriptLoaded) {
      resolve();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="pagead2.googlesyndication.com"]`);
    if (existingScript) {
      window.adsenseScriptLoaded = true;
      resolve();
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = ADSENSE_SCRIPT_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      window.adsenseScriptLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      reject('Failed to load AdSense script');
    };

    document.head.appendChild(script);
  });
};

export const AdSense: React.FC<AdSenseProps> = ({ 
  adSlot, 
  adFormat = 'auto',
  style = { display: 'block' },
  className = ''
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (isAdLoaded.current) return;
    
    const initAd = async () => {
      try {
        await loadAdSenseScript();
        
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({});
          isAdLoaded.current = true;
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    };

    initAd();
  }, []);

  return (
    <div ref={adRef} className={`adsense-container my-6 ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

// In-article ad component for content
export const InArticleAd: React.FC<{ adSlot?: string }> = ({ adSlot = "XXXXXXXXXX" }) => {
  return (
    <div className="my-8 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-2 uppercase tracking-wide">Advertisement</p>
      <AdSense 
        adSlot={adSlot} 
        adFormat="fluid"
        style={{ display: 'block', textAlign: 'center' }}
        className="min-h-[100px]"
      />
    </div>
  );
};

// Placeholder ad for development/testing (shown when AdSense is not configured)
export const AdPlaceholder: React.FC<{ type?: 'horizontal' | 'rectangle' }> = ({ type = 'horizontal' }) => {
  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  
  // In production, return empty if no real ad
  if (isProduction) {
    return null;
  }
  
  return (
    <div className={`my-6 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center ${type === 'rectangle' ? 'h-64' : 'h-24'}`}>
      <div className="text-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">📢 Ad Space</p>
        <p className="text-slate-300 dark:text-slate-600 text-xs">AdSense will appear here</p>
      </div>
    </div>
  );
};

export default AdSense;
