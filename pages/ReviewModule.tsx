
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MODULES, UI_LABELS } from '../constants';
import { UserState } from '../types';
import { ArrowLeft, BookOpen, CheckCircle, PenTool, Share2, CheckSquare, X, Link as LinkIcon, MessageCircle, Twitter, Linkedin, Facebook, MoreHorizontal } from 'lucide-react';

interface ReviewModuleProps {
  userState: UserState;
}

const ReviewModule: React.FC<ReviewModuleProps> = ({ userState }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [showShareModal, setShowShareModal] = useState(false);
  
  const lang = userState.language;
  const module = MODULES.find(m => m.id === moduleId);
  const progress = userState.progress[moduleId || ''];
  
  if (!module) return <div className="p-8 text-center">Module not found</div>;

  const shareUrl = window.location.origin;
  const shareText = lang === 'en'
      ? `I just completed the "${module.title.en}" journey on Lapaas Mindset! 🚀\n\nTransform your life in 21 days.`
      : `मैंने अभी लपास माइंडसेट पर "${module.title.hi}" यात्रा पूरी की है! 🚀\n\n21 दिनों में अपना जीवन बदलें।`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lapaas Mindset',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
       handleCopy();
    }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert(UI_LABELS.copied[lang]);
      setShowShareModal(false);
  };

  const openSocial = (platform: string) => {
      const text = encodeURIComponent(shareText);
      const url = encodeURIComponent(shareUrl);
      let link = '';

      switch(platform) {
          case 'whatsapp':
              link = `https://api.whatsapp.com/send?text=${text}%20${url}`;
              break;
          case 'twitter':
              link = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
              break;
          case 'linkedin':
              link = `https://www.linkedin.com/feed/?shareActive=true&text=${text}%20${url}`;
              break;
          case 'facebook':
              link = `https://www.facebook.com/sharer/sharer.php?u=${url}`; // FB mainly shares URL
              break;
      }
      
      if(link) window.open(link, '_blank');
      setShowShareModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
           <Link to={`/module/${moduleId}`} className="flex items-center text-slate-500 hover:text-orange-600 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">{UI_LABELS.home[lang]}</span>
          </Link>
          <h1 className="font-bold text-slate-800 text-lg hidden md:block truncate max-w-xs">{module.title[lang]} - {UI_LABELS.reviewJourney[lang]}</h1>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-slate-800 mb-2">{module.title[lang]}</h1>
           <p className="text-slate-500 mb-6">{UI_LABELS.moduleComplete[lang]}</p>
           
           <button 
             onClick={() => setShowShareModal(true)}
             className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
           >
             <Share2 size={20} />
             <span className="font-bold">{UI_LABELS.shareAchievement[lang]}</span>
           </button>
        </div>

        {module.days.map(day => {
          const entry = progress?.journal?.[day.dayNumber];
          
          return (
            <div key={day.dayNumber} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">{UI_LABELS.day[lang]} {day.dayNumber}: {day.title[lang]}</h3>
                <CheckCircle size={20} className="text-green-500" />
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                   <div className="flex items-center text-orange-600 mb-2">
                     <BookOpen size={16} className="mr-2" />
                     <span className="text-xs font-bold uppercase tracking-wider">{UI_LABELS.reading[lang]}</span>
                   </div>
                   <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line line-clamp-6 opacity-80">
                      {day.reading[lang]}
                   </p>
                </div>

                {entry?.taskResponse && (
                    <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                        <div className="flex items-center text-indigo-800 mb-3">
                            <CheckSquare size={16} className="mr-2" />
                            <span className="text-xs font-bold uppercase tracking-wider">{UI_LABELS.task[lang]}</span>
                        </div>
                        <div className="text-slate-800 whitespace-pre-wrap font-medium">
                            {entry.taskResponse}
                        </div>
                    </div>
                )}

                <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                   <div className="flex items-center text-orange-800 mb-3">
                     <PenTool size={16} className="mr-2" />
                     <span className="text-xs font-bold uppercase tracking-wider">{UI_LABELS.myJournal[lang]}</span>
                   </div>
                   {entry ? (
                     <div className="text-slate-800 whitespace-pre-wrap font-medium">
                       {entry.text}
                     </div>
                   ) : (
                     <p className="text-slate-400 italic text-sm">No entry recorded.</p>
                   )}
                   {entry && (
                     <div className="mt-2 text-xs text-orange-400 text-right">
                       {new Date(entry.timestamp).toLocaleDateString()}
                     </div>
                   )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowShareModal(false)}>
           <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-slate-800">Share Achievement</h3>
                   <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">
                       <X size={24} />
                   </button>
               </div>
               
               <div className="grid grid-cols-4 gap-4 mb-6">
                   <button onClick={() => openSocial('whatsapp')} className="flex flex-col items-center space-y-2 group">
                       <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                           <MessageCircle size={24} />
                       </div>
                       <span className="text-xs font-medium text-slate-600">WhatsApp</span>
                   </button>
                   <button onClick={() => openSocial('twitter')} className="flex flex-col items-center space-y-2 group">
                       <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-400 group-hover:bg-blue-400 group-hover:text-white transition-colors">
                           <Twitter size={24} />
                       </div>
                       <span className="text-xs font-medium text-slate-600">X / Twitter</span>
                   </button>
                   <button onClick={() => openSocial('linkedin')} className="flex flex-col items-center space-y-2 group">
                       <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                           <Linkedin size={24} />
                       </div>
                       <span className="text-xs font-medium text-slate-600">LinkedIn</span>
                   </button>
                   <button onClick={() => openSocial('facebook')} className="flex flex-col items-center space-y-2 group">
                       <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                           <Facebook size={24} />
                       </div>
                       <span className="text-xs font-medium text-slate-600">Facebook</span>
                   </button>
               </div>

               <div className="flex flex-col space-y-3">
                   <button onClick={handleCopy} className="flex items-center justify-center w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-colors">
                       <LinkIcon size={18} className="mr-2" />
                       Copy Link
                   </button>
                   {navigator.share && (
                       <button onClick={handleNativeShare} className="flex items-center justify-center w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-600 transition-colors">
                           <MoreHorizontal size={18} className="mr-2" />
                           More Options
                       </button>
                   )}
               </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default ReviewModule;
