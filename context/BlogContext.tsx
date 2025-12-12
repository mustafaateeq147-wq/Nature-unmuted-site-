import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post, SiteSettings, User, Category } from '../types';

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
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/3209/3209971.png', // Placeholder leaf icon
  footerText: '© 2024 Nature Unmuted. Preserving our planet one post at a time.',
  primaryColor: '#36a869',
  socialLinks: {
    facebook: '#',
    twitter: '#',
    instagram: '#'
  }
};

interface BlogContextType {
  posts: Post[];
  settings: SiteSettings;
  user: User;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  login: (password: string) => boolean;
  logout: () => void;
  addPost: (post: Post) => void;
  updatePost: (post: Post) => void;
  deletePost: (id: string) => void;
  updateSettings: (settings: SiteSettings) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [user, setUser] = useState<User>({ username: 'guest', role: 'viewer', isLoggedIn: false });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedPosts = localStorage.getItem('nu_posts');
    if (storedPosts) setPosts(JSON.parse(storedPosts));
    
    const storedSettings = localStorage.getItem('nu_settings');
    if (storedSettings) setSettings(JSON.parse(storedSettings));

    // Check auth session
    const storedAuth = localStorage.getItem('nu_auth');
    if (storedAuth === 'true') {
        setUser({ username: 'Admin', role: 'admin', isLoggedIn: true });
    }

    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('nu_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('nu_settings', JSON.stringify(settings));
  }, [settings]);

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
    setPosts([post, ...posts]);
  };

  const updatePost = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const updateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
  };

  return (
    <BlogContext.Provider value={{ 
      posts, settings, user, theme, 
      toggleTheme, login, logout, 
      addPost, updatePost, deletePost, updateSettings 
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