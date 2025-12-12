import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post, SiteSettings, User, Category, BlogContextType } from '../types';

// Placeholder Data
const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    title: '5 Ways We Can Reduce Plastic Waste Today',
    subtitle: 'Simple changes in our daily habits can have a massive impact on our oceans.',
    content: `Plastic pollution is one of the most pressing environmental issues of our time. Every year, millions of tons of plastic end up in our oceans, harming marine life and disrupting ecosystems. But it doesn't have to be this way. Here are five actionable steps you can take today to make a difference.

### 1. Switch to Reusable Bags
The easiest switch is ditching single-use plastic bags for cloth or durable recycled ones.

### 2. Stop Buying Bottled Water
Invest in a high-quality reusable water bottle. It saves money and plastic.

### 3. Say No to Straws
If you don't need one, don't use one. Or switch to metal/bamboo alternatives.

### 4. Buy in Bulk
Reduce packaging waste by purchasing grains, nuts, and spices in bulk using your own containers.

### 5. Choose Natural Fibers
Synthetic clothes shed microplastics when washed. Opt for cotton, wool, or linen.`,
    coverImage: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: Category.SUSTAINABILITY,
    author: 'Emma Green',
    authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    date: '2023-10-15',
    tags: ['Plastic Free', 'Ocean', 'Lifestyle'],
    seo: {
      metaTitle: '5 Ways to Reduce Plastic Waste',
      metaDescription: 'Actionable tips to reduce plastic consumption in daily life.',
      keywords: ['plastic', 'waste', 'ocean', 'sustainability']
    },
    comments: [],
    isPublished: true
  },
  {
    id: '2',
    title: 'The Silent Collapse of Coral Reefs',
    subtitle: 'Why these underwater cities are disappearing and what it means for us.',
    content: 'Coral reefs are often called the rainforests of the sea. They support 25% of all marine life despite covering less than 1% of the ocean floor. However, rising sea temperatures and acidification are causing widespread bleaching events...',
    coverImage: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: Category.OCEANS,
    author: 'Dr. Lucas Marine',
    authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    date: '2023-10-20',
    tags: ['Coral', 'Marine Biology', 'Climate Change'],
    seo: {
      metaTitle: 'Coral Reef Collapse: A Global Crisis',
      metaDescription: 'Understanding the impact of climate change on coral reefs.',
      keywords: ['coral', 'reefs', 'ocean', 'warming']
    },
    comments: [],
    isPublished: true
  },
  {
    id: '3',
    title: 'Why Forests Are the Lungs of Our Planet',
    subtitle: 'Exploring the critical role of trees in carbon sequestration.',
    content: 'Forests breathe in carbon dioxide and breathe out the oxygen we need to survive. Beyond this, they regulate local climates, prevent soil erosion, and provide habitats for countless species...',
    coverImage: 'https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: Category.FORESTS,
    author: 'Sarah Wood',
    authorImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    date: '2023-11-01',
    tags: ['Forests', 'Trees', 'Carbon'],
    seo: {
      metaTitle: 'Forests: The Lungs of Earth',
      metaDescription: 'How forests sustain life on Earth.',
      keywords: ['forest', 'trees', 'oxygen', 'climate']
    },
    comments: [],
    isPublished: true
  }
];

const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'Nature Unmuted',
  tagline: 'Voices for a Greener Future',
  logoUrl: 'https://ibb.co/Kzqs905s',
  footerText: '© 2024 Nature Unmuted. Preserving our planet one post at a time.',
  primaryColor: '#36a869',
  contactEmail: 'mustafaateeq147@gmail.com',
  socialLinks: {
    facebook: '#',
    twitter: '#',
    instagram: '#'
  }
};

const INITIAL_IMAGES = [
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&w=1000&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=1000&q=80",
  "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&w=1000&q=80",
  "https://images.unsplash.com/photo-1501854140884-074cf2b2c3af?ixlib=rb-4.0.3&w=1000&q=80",
  "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&w=1000&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?ixlib=rb-4.0.3&w=1000&q=80",
];

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Safe Storage Saver
  const [storageError, setStorageError] = useState<string | null>(null);

  const saveToStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Only clear error if it was a specific quota error, otherwise keep it visible if needed, 
      // but usually success means we can clear.
      if (storageError) setStorageError(null);
    } catch (e: any) {
      console.error("Storage Save Failed:", e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        setStorageError("⚠️ Storage Full! Your changes cannot be saved. Please delete old posts or images.");
      } else {
        setStorageError("⚠️ Error saving data to local storage.");
      }
    }
  };

  // Lazy initialization to prevent overwriting local storage on mount
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const stored = localStorage.getItem('nu_posts');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Robust sanitization to ensure required fields (like seo) exist
        return Array.isArray(parsed) ? parsed.map((p: any) => ({
          ...p,
          seo: p.seo || { metaTitle: p.title || '', metaDescription: '', keywords: [] },
          tags: p.tags || [],
          comments: p.comments || []
        })) : INITIAL_POSTS;
      }
      return INITIAL_POSTS;
    } catch (e) {
      console.error("Failed to load posts", e);
      return INITIAL_POSTS;
    }
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const stored = localStorage.getItem('nu_settings');
      return stored ? { ...INITIAL_SETTINGS, ...JSON.parse(stored) } : INITIAL_SETTINGS;
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  });

  const [savedImages, setSavedImages] = useState<string[]>(() => {
    try {
        const stored = localStorage.getItem('nu_images');
        const parsed = stored ? JSON.parse(stored) : [];
        // Use set to ensure uniqueness and merge with initial images
        return Array.from(new Set([...INITIAL_IMAGES, ...parsed]));
    } catch (e) {
        return INITIAL_IMAGES;
    }
  });

  const [user, setUser] = useState<User>(() => {
    const storedAuth = localStorage.getItem('nu_auth');
    return storedAuth === 'true' 
      ? { username: 'Admin', role: 'admin', isLoggedIn: true }
      : { username: 'guest', role: 'viewer', isLoggedIn: false };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Check system preference for dark mode once
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    saveToStorage('nu_posts', posts);
  }, [posts]);

  useEffect(() => {
    saveToStorage('nu_settings', settings);
  }, [settings]);

  useEffect(() => {
    saveToStorage('nu_images', savedImages);
  }, [savedImages]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = (password: string) => {
    if (password === 'nature2024') {
        setUser({ username: 'Admin', role: 'admin', isLoggedIn: true });
        localStorage.setItem('nu_auth', 'true');
        return true;
    }
    return false;
  };

  const logout = () => {
    setUser({ username: 'guest', role: 'viewer', isLoggedIn: false });
    localStorage.removeItem('nu_auth');
  };

  const addPost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
  };

  const updatePost = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const updateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
  };
  
  const restorePosts = (restoredPosts: Post[]) => {
    const sanitized = restoredPosts.map((p: any) => ({
      ...p,
      seo: p.seo || { metaTitle: p.title || '', metaDescription: '', keywords: [] },
      tags: p.tags || [],
      comments: p.comments || []
    }));
    setPosts(sanitized);
  };

  const saveImageToLibrary = (url: string) => {
    if (!url) return;
    setSavedImages(prev => {
        // Prevent duplicates
        if (prev.includes(url)) return prev;
        return [url, ...prev];
    });
  };

  const dismissStorageError = () => setStorageError(null);

  return (
    <BlogContext.Provider value={{ 
      posts, settings, user, theme, savedImages, storageError,
      toggleTheme, login, logout, 
      addPost, updatePost, deletePost, updateSettings, restorePosts, saveImageToLibrary,
      dismissStorageError
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) throw new Error("useBlog must be used within a BlogProvider");
  return context;
};
