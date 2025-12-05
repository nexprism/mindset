import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Book, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 px-6 flex justify-around items-center z-50 pb-safe transition-colors duration-300">
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-orange-600 dark:text-orange-500' : 'text-slate-400 dark:text-slate-500 hover:text-orange-300'}`
        }
      >
        <Home size={24} />
        <span className="text-[10px] font-medium uppercase tracking-wide">Home</span>
      </NavLink>
      
      <NavLink 
        to="/journal" 
        className={({ isActive }) => 
          `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-orange-600 dark:text-orange-500' : 'text-slate-400 dark:text-slate-500 hover:text-orange-300'}`
        }
      >
        <Book size={24} />
        <span className="text-[10px] font-medium uppercase tracking-wide">Journal</span>
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => 
          `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-orange-600 dark:text-orange-500' : 'text-slate-400 dark:text-slate-500 hover:text-orange-300'}`
        }
      >
        <User size={24} />
        <span className="text-[10px] font-medium uppercase tracking-wide">Profile</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;