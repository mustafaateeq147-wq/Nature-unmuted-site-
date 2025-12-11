export enum Category {
  OCEANS = 'Oceans',
  FORESTS = 'Forests',
  WILDLIFE = 'Wildlife',
  SUSTAINABILITY = 'Sustainability',
  CLIMATE = 'Climate Change',
}

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Post {
  id: string;
  title: string;
  subtitle: string;
  content: string; // HTML or Markdown string
  coverImage: string;
  category: Category;
  author: string;
  authorImage: string;
  date: string;
  tags: string[];
  seo: SeoData;
  comments: Comment[];
  isPublished: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  footerText: string;
  primaryColor: string;
  contactEmail: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}

export interface User {
  username: string;
  role: 'admin' | 'editor' | 'viewer';
  isLoggedIn: boolean;
}

export interface BlogContextType {
  posts: Post[];
  settings: SiteSettings;
  user: User;
  theme: 'light' | 'dark';
  savedImages: string[];
  toggleTheme: () => void;
  login: (password: string) => boolean;
  logout: () => void;
  addPost: (post: Post) => void;
  updatePost: (post: Post) => void;
  deletePost: (id: string) => void;
  updateSettings: (settings: SiteSettings) => void;
  restorePosts: (posts: Post[]) => void;
  saveImageToLibrary: (url: string) => void;
}