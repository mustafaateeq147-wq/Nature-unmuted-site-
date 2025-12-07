import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { Menu, X, Sun, Moon, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from './UI';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, theme, toggleTheme, user, logout } = useBlog();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'New Post', path: '/admin/editor' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  const linksToRender = isAdmin ? adminLinks : navLinks;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            {settings.logoUrl && (
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="h-12 w-12 md:h-14 md:w-14 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300" 
                onError={handleImageError}
              />
            )}
            <span className="text-xl md:text-2xl font-bold font-serif text-stone-800 dark:text-nature-100 tracking-tight">
              {isAdmin ? 'Admin Panel' : settings.siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {linksToRender.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-nature-600 dark:hover:text-nature-400 ${location.pathname === link.path ? 'text-nature-600 dark:text-nature-400' : 'text-stone-600 dark:text-stone-300'}`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-2"></div>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user.isLoggedIn ? (
              <div className="flex items-center gap-2">
                 <Link to="/admin" className="hidden lg:block">
                  <Button variant="ghost" className="text-sm">
                    <UserIcon size={16} /> Admin
                  </Button>
                 </Link>
                 <Button variant="ghost" onClick={logout} className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={16} />
                 </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="text-sm">
                  <LogIn size={16} />
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-stone-600 dark:text-stone-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-4 flex flex-col gap-4 shadow-lg animate-fade-in-down">
            {linksToRender.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className="block py-2 text-stone-700 dark:text-stone-200 hover:text-nature-600 dark:hover:text-nature-400 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
             <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
               <button onClick={toggleTheme} className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                  {theme === 'light' ? <><Moon size={16}/> Dark Mode</> : <><Sun size={16}/> Light Mode</>}
               </button>
               {user.isLoggedIn ? (
                 <button onClick={logout} className="text-red-500 font-medium">Logout</button>
               ) : (
                 <Link to="/login" className="text-nature-600 font-medium">Login</Link>
               )}
             </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-nature-900 text-nature-100 py-12 mt-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-6">
               {settings.logoUrl && (
                 <div className="bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                   <img 
                      src={settings.logoUrl} 
                      alt="Logo" 
                      className="h-16 w-16 object-contain" 
                      onError={handleImageError}
                   />
                 </div>
               )}
               <div>
                 <h3 className="text-2xl font-serif font-bold text-white leading-none">{settings.siteName}</h3>
                 <p className="text-nature-300 text-sm mt-1">EST. 2024</p>
               </div>
            </div>
            <p className="text-nature-200/80 mb-6 max-w-xs">{settings.tagline}</p>
            <div className="flex gap-4">
              {/* Social Placeholders */}
              <a href="#" className="p-2 bg-nature-800 rounded-full hover:bg-nature-700 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
              </a>
              <a href="#" className="p-2 bg-nature-800 rounded-full hover:bg-nature-700 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
              </a>
            </div>
          </div>
          
          <div className="md:pl-12">
            <h4 className="text-white font-bold mb-6 text-lg">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-nature-200 hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-nature-400 rounded-full"></span> About Us</Link></li>
              <li><Link to="/blog" className="text-nature-200 hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-nature-400 rounded-full"></span> Our Blog</Link></li>
              <li><Link to="/contact" className="text-nature-200 hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-nature-400 rounded-full"></span> Contact</Link></li>
              <li><Link to="/privacy" className="text-nature-200 hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-nature-400 rounded-full"></span> Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Newsletter</h4>
            <p className="text-nature-200 text-sm mb-4">Join our community for the latest environmental news and tips.</p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className="bg-nature-800/50 border border-nature-700 text-white placeholder-nature-400 px-4 py-3 rounded-lg flex-grow focus:ring-2 focus:ring-nature-500 focus:outline-none focus:border-transparent transition-all" />
              <button className="bg-nature-500 hover:bg-nature-400 text-white px-4 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-nature-900/20">Subscribe Now</button>
            </form>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-nature-800 text-center text-nature-300 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>{settings.footerText}</p>
          <p className="opacity-60">Designed with ❤️ for Nature</p>
        </div>
      </footer>
    </div>
  );
};