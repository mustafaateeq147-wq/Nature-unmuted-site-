import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { Button, Card, Input, TextArea, RichTextEditor, ImagePicker, MarkdownRenderer } from '../components/UI';
import { Category, Post, SiteSettings } from '../types';
import { generateSeoTags, generateFullPost, classifyPost } from '../services/geminiService';
import { 
  Plus, Edit, Trash2, Settings, BarChart3, Save, 
  ArrowLeft, Sparkles, LayoutDashboard, FileText, Globe, Eye, PenTool, Wand2, Loader2, Download, Upload as UploadIcon, Clock
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, user } = useBlog();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user.isLoggedIn) navigate('/admin');
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
        navigate('/admin');
    } else {
        setError('Incorrect password. Hint: nature2024');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nature-50 dark:bg-stone-900">
      <Card className="w-full max-w-md p-8 border-nature-200 shadow-xl">
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-nature-100 dark:bg-nature-900 rounded-full flex items-center justify-center mx-auto mb-4 text-nature-600">
             <LayoutDashboard size={24} />
           </div>
           <h1 className="text-3xl font-serif font-bold text-nature-800 dark:text-nature-400">Admin Access</h1>
           <p className="text-stone-500 mt-2">Enter your secure password to manage content.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm font-semibold text-stone-600 dark:text-stone-300 block mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-nature-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button type="submit" className="w-full mt-2">Login to Dashboard</Button>
          <p className="text-xs text-center mt-6 text-stone-400">Restricted Area. Authorized Personnel Only.</p>
        </form>
      </Card>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { posts, deletePost } = useBlog();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-serif font-bold text-stone-800 dark:text-white">Dashboard</h1>
           <p className="text-stone-500">Welcome back, Admin.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/admin/settings')}>
                <Settings size={18} /> Settings
            </Button>
            <Button onClick={() => navigate('/admin/editor')}>
                <Plus size={18} /> New Post
            </Button>
        </div>
      </div>

      {/* Stats Mock */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 p-6">
          <div className="p-4 bg-emerald-200 dark:bg-emerald-800 rounded-full text-emerald-700 dark:text-emerald-100"><FileText size={24} /></div>
          <div>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">Published Posts</p>
            <p className="text-3xl font-bold text-stone-800 dark:text-white">{posts.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 p-6">
           <div className="p-4 bg-amber-200 dark:bg-amber-800 rounded-full text-amber-700 dark:text-amber-100"><BarChart3 size={24} /></div>
          <div>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">Total Views</p>
            <p className="text-3xl font-bold text-stone-800 dark:text-white">12.5K</p>
          </div>
        </Card>
         <Card className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 p-6">
           <div className="p-4 bg-blue-200 dark:bg-blue-800 rounded-full text-blue-700 dark:text-blue-100"><Globe size={24} /></div>
          <div>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">SEO Health</p>
            <p className="text-3xl font-bold text-stone-800 dark:text-white">92%</p>
          </div>
        </Card>
      </div>

      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm overflow-hidden border border-stone-200 dark:border-stone-700">
        <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center">
            <h2 className="font-bold text-lg text-stone-800 dark:text-white">Recent Posts</h2>
        </div>
        <table className="w-full">
          <thead className="bg-stone-50 dark:bg-stone-900 text-left">
            <tr>
              <th className="p-4 text-xs font-bold uppercase text-stone-500 dark:text-stone-400 tracking-wider">Title</th>
              <th className="p-4 text-xs font-bold uppercase text-stone-500 dark:text-stone-400 tracking-wider hidden md:table-cell">Category</th>
              <th className="p-4 text-xs font-bold uppercase text-stone-500 dark:text-stone-400 tracking-wider hidden md:table-cell">Date</th>
              <th className="p-4 text-xs font-bold uppercase text-stone-500 dark:text-stone-400 tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
            {posts.map(post => {
              const isScheduled = new Date(post.date) > new Date();
              return (
                <tr key={post.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
                  <td className="p-4">
                      <p className="font-medium text-stone-800 dark:text-white">{post.title}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 md:hidden">{post.category} • {new Date(post.date).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4 text-stone-600 dark:text-stone-400 hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 ${isScheduled ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-nature-100 text-nature-700 dark:bg-nature-900 dark:text-nature-300'}`}>
                      {isScheduled && <Clock size={12} />}
                      {isScheduled ? 'Scheduled' : post.category}
                    </span>
                  </td>
                  <td className="p-4 text-stone-600 dark:text-stone-400 hidden md:table-cell text-sm">
                    {new Date(post.date).toLocaleDateString()}
                    {isScheduled && <div className="text-xs text-amber-600 dark:text-amber-500">{new Date(post.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="ghost" className="p-2 inline-flex h-8 w-8" onClick={() => navigate(`/admin/editor/${post.id}`)} title="Edit">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" className="p-2 inline-flex h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => deletePost(post.id)} title="Delete">
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GoogleSnippetPreview: React.FC<{ title: string; description: string; urlSlug?: string }> = ({ title, description, urlSlug }) => {
  const displayUrl = `natureunmuted.com › blog › ${urlSlug || 'post'}`;
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 font-sans max-w-[600px] select-none text-left">
       <div className="flex items-center gap-2 mb-1">
          <div className="bg-stone-100 rounded-full p-1 border border-stone-200 flex items-center justify-center w-7 h-7">
             <Globe size={14} className="text-stone-500"/>
          </div>
          <div className="flex flex-col leading-none justify-center">
             <span className="text-[14px] text-[#202124] font-normal">Nature Unmuted</span>
             <span className="text-[12px] text-[#4d5156] mt-0.5">{displayUrl}</span>
          </div>
       </div>
       <h3 className="text-[#1a0dab] text-xl font-medium cursor-pointer hover:underline truncate mt-1">
          {title || "Post Title Will Appear Here"}
       </h3>
       <div className="text-[#4d5156] text-sm leading-snug line-clamp-2 mt-1">
          <span className="text-stone-500 text-xs mr-2">{new Date().toDateString().split(' ').slice(1,3).join(' ')} — </span>
          {description || "Meta description will appear here in search results. It summarizes the post content for users and helps improve click-through rates from search engines."}
       </div>
    </div>
  );
};

export const PostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { posts, addPost, updatePost, savedImages, saveImageToLibrary } = useBlog();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Post>({
    id: Date.now().toString(),
    title: '',
    subtitle: '',
    content: '',
    coverImage: '',
    category: Category.SUSTAINABILITY,
    author: 'Admin',
    authorImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&w=150&q=80',
    date: new Date().toISOString(),
    tags: [],
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    comments: [],
    isPublished: true
  });

  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (isEditing) {
      const existingPost = posts.find(p => p.id === id);
      if (existingPost) {
        // Ensure seo and other optional fields are populated to avoid crashes
        setFormData({
            ...existingPost,
            seo: existingPost.seo || { metaTitle: existingPost.title, metaDescription: '', keywords: [] },
            tags: existingPost.tags || []
        });
      }
    }
  }, [id, posts, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!formData.title) return alert("Title is required");
    
    // Auto-save image to library when post is saved
    if (formData.coverImage) {
        saveImageToLibrary(formData.coverImage);
    }

    const postToSave = {
        ...formData,
        // Fallback for SEO to prevent undefined error if it somehow got lost
        seo: formData.seo || { metaTitle: formData.title, metaDescription: '', keywords: [] }
    };
    
    if (isEditing) {
      updatePost(postToSave);
    } else {
      addPost(postToSave);
    }
    navigate('/admin');
  };

  const handleGenerateSeo = async () => {
    if (!formData.title || !formData.content) {
      alert("Please enter a title and content first.");
      return;
    }
    setIsGeneratingSeo(true);
    try {
      const seo = await generateSeoTags(formData.content, formData.title);
      setFormData(prev => ({ ...prev, seo }));
    } catch (e) {
      alert("Failed to generate SEO tags.");
    } finally {
      setIsGeneratingSeo(false);
    }
  };
  
  const handleAutoClassify = async () => {
      if(!formData.title) {
          alert("Enter a title first.");
          return;
      }
      setIsClassifying(true);
      try {
          const category = await classifyPost(formData.title, formData.content || formData.subtitle);
          setFormData(prev => ({ ...prev, category }));
      } catch(e) {
          console.error(e);
      } finally {
          setIsClassifying(false);
      }
  };

  const handleAutoGenerate = async () => {
    if (!formData.title) {
        alert("Please enter a title first to generate the post.");
        return;
    }
    setIsAutoGenerating(true);
    try {
        const generatedData = await generateFullPost(formData.title);
        
        setFormData(prev => ({
            ...prev,
            subtitle: generatedData.subtitle,
            content: generatedData.content,
            category: generatedData.category,
            tags: generatedData.tags,
            // Ensure SEO exists, fallback to safe default if API returns incomplete data
            seo: generatedData.seo || { metaTitle: prev.title, metaDescription: generatedData.subtitle, keywords: [] },
            coverImage: generatedData.coverImage
        }));
        
        // Auto-save generated image
        if (generatedData.coverImage) {
            saveImageToLibrary(generatedData.coverImage);
        }
        
        setViewMode('preview');
    } catch (error) {
        console.error(error);
        alert("Failed to auto-generate. This might be a network issue. Please check your connection and API Key.");
    } finally {
        setIsAutoGenerating(false);
    }
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  // Helper to handle local time for datetime-local input
  const formatDateForInput = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const localValue = e.target.value;
      if (!localValue) return;
      const date = new Date(localValue);
      setFormData({ ...formData, date: date.toISOString() });
  };

  // Safe access to SEO data for rendering, ensuring it's never undefined
  const seoData = formData.seo || { metaTitle: '', metaDescription: '', keywords: [] };
  const urlSlug = formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'new-post';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}><ArrowLeft size={18} /></Button>
            <h1 className="text-2xl font-bold font-serif dark:text-white">{isEditing ? 'Edit Post' : 'New Post'}</h1>
         </div>
         <div className="flex gap-2">
            <div className="bg-white dark:bg-stone-800 rounded-lg p-1 border border-stone-200 dark:border-stone-700 flex">
                <button 
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-2 ${viewMode === 'edit' ? 'bg-stone-100 dark:bg-stone-700 font-medium' : 'text-stone-500'}`}
                >
                   <PenTool size={14} /> Write
                </button>
                <button 
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-2 ${viewMode === 'preview' ? 'bg-stone-100 dark:bg-stone-700 font-medium' : 'text-stone-500'}`}
                >
                   <Eye size={14} /> Preview
                </button>
            </div>
            <Button onClick={handleSave} className="bg-nature-600 hover:bg-nature-700 text-white">
            <Save size={18} /> {new Date(formData.date) > new Date() ? 'Schedule Post' : 'Publish Post'}
            </Button>
         </div>
      </div>

      {viewMode === 'preview' ? (
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 overflow-hidden animate-fade-in">
             <div className="h-[40vh] w-full relative">
                {formData.coverImage ? (
                    <img src={formData.coverImage} alt={formData.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">No Cover Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                    <span className="bg-nature-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">{formData.category}</span>
                    <h1 className="text-4xl font-serif font-bold mb-2">{formData.title || 'Untitled Post'}</h1>
                    <p className="text-lg text-stone-200 max-w-3xl">{formData.subtitle}</p>
                </div>
            </div>
            <div className="max-w-3xl mx-auto p-8">
                <div className="prose prose-lg dark:prose-invert prose-stone max-w-none">
                     <MarkdownRenderer content={formData.content} />
                </div>
                
                {/* Preview Metadata */}
                <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-700">
                    <h4 className="font-bold mb-4 text-stone-500 uppercase text-sm">Search Engine Preview</h4>
                    <GoogleSnippetPreview 
                        title={seoData?.metaTitle || formData.title}
                        description={seoData?.metaDescription}
                        urlSlug={urlSlug}
                    />
                </div>
            </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
            <Card>
                <div className="flex items-end gap-2 mb-4">
                   <div className="flex-grow">
                        <Input 
                            name="title" 
                            label="Post Title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            placeholder="e.g., The Future of Electric Vehicles" 
                            className="mb-0"
                        />
                   </div>
                   <Button 
                     onClick={handleAutoGenerate} 
                     disabled={isAutoGenerating || !formData.title}
                     className="mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-none"
                     title="Automatically generate content, subtitles, and image based on title"
                   >
                     {isAutoGenerating ? (
                        <><Loader2 className="animate-spin" size={18} /> Generating...</>
                     ) : (
                        <><Wand2 size={18} /> Magic Auto-Generate</>
                     )}
                   </Button>
                </div>
                
                <Input name="subtitle" label="Subtitle" value={formData.subtitle} onChange={handleChange} placeholder="A short hook for the post" />
                
                <RichTextEditor 
                    label="Content"
                    value={formData.content}
                    onChange={(val) => setFormData({...formData, content: val})}
                />
            </Card>
            </div>

            <div className="space-y-6">
            <Card>
                <h3 className="font-bold mb-4 text-stone-700 dark:text-white">Publishing Details</h3>
                <div className="flex flex-col gap-4">
                
                <Input 
                   type="datetime-local"
                   label="Publish Date & Time"
                   value={formatDateForInput(formData.date)}
                   onChange={handleDateChange}
                />

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-stone-600 dark:text-stone-300">Category</label>
                    <div className="flex gap-2">
                        <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange}
                            className="flex-grow px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-nature-50"
                        >
                            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Button variant="secondary" onClick={handleAutoClassify} disabled={isClassifying} title="Auto-classify category based on title">
                            {isClassifying ? <Loader2 className="animate-spin" size={16}/> : <Wand2 size={16}/>}
                        </Button>
                    </div>
                </div>
                
                <ImagePicker 
                    label="Cover Image"
                    value={formData.coverImage}
                    onChange={(url) => setFormData({...formData, coverImage: url})}
                    presets={savedImages}
                />

                <Input name="author" label="Author Name" value={formData.author} onChange={handleChange} />
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-stone-700 dark:text-white">SEO & Meta</h3>
                    <Button 
                    variant="ghost" 
                    onClick={handleGenerateSeo} 
                    isLoading={isGeneratingSeo}
                    className="text-xs text-nature-600 bg-nature-50 hover:bg-nature-100 dark:bg-nature-900/30"
                    title="Generate with Gemini"
                    >
                    <Sparkles size={14} className="mr-1" /> Refresh SEO
                    </Button>
                </div>
                
                {/* Google Preview Inside Card */}
                <div className="mb-6 p-4 bg-stone-50 dark:bg-stone-900/50 rounded-lg border border-stone-100 dark:border-stone-800">
                   <label className="text-xs font-bold text-stone-500 uppercase block mb-3">Google Search Preview</label>
                   <GoogleSnippetPreview 
                      title={seoData?.metaTitle || formData.title}
                      description={seoData?.metaDescription}
                      urlSlug={urlSlug}
                   />
                </div>

                <div className="space-y-4">
                    <Input 
                        label="Meta Title" 
                        value={seoData?.metaTitle || ''} 
                        onChange={(e) => setFormData({...formData, seo: {...seoData, metaTitle: e.target.value}})} 
                        placeholder="Optimized title for search engines"
                    />
                    <TextArea 
                        label="Meta Description" 
                        rows={3}
                        value={seoData?.metaDescription || ''} 
                        onChange={(e) => setFormData({...formData, seo: {...seoData, metaDescription: e.target.value}})} 
                        placeholder="Brief summary for search results"
                    />
                    <div>
                    <label className="text-sm font-semibold text-stone-600 dark:text-stone-300">Tags</label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            className="flex-grow px-3 py-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Add tag"
                            onKeyDown={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button onClick={addTag} type="button" variant="secondary" className="px-3 py-1">+</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.tags?.map(tag => (
                            <span key={tag} className="text-xs bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded flex items-center gap-1 border border-stone-200 dark:border-stone-600">
                                {tag} <button onClick={() => setFormData({...formData, tags: formData.tags.filter(t => t !== tag)})} className="hover:text-red-500">&times;</button>
                            </span>
                        ))}
                    </div>
                    </div>
                </div>
            </Card>
            </div>
        </div>
      )}
    </div>
  );
};

export const SettingsPage: React.FC = () => {
   const { settings, updateSettings, posts, restorePosts } = useBlog();
   const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSettings({ ...localSettings, [e.target.name]: e.target.value });
   };

   const handleSave = () => {
      updateSettings(localSettings);
      alert("Settings Saved!");
   };

   const handleDownloadBackup = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(posts));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "nature_unmuted_backup.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
   };

   const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
         try {
            const restoredPosts = JSON.parse(event.target?.result as string);
            if (Array.isArray(restoredPosts)) {
               restorePosts(restoredPosts);
               alert("Posts restored successfully!");
            } else {
               alert("Invalid backup file.");
            }
         } catch (error) {
            alert("Error parsing backup file.");
         }
      };
      reader.readAsText(file);
   };

   return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
         <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => window.history.back()}><ArrowLeft size={18} /></Button>
            <h1 className="text-3xl font-serif font-bold text-stone-800 dark:text-white">Site Settings</h1>
         </div>
         <Card className="space-y-6">
            <h3 className="text-xl font-bold border-b border-stone-200 dark:border-stone-700 pb-2 text-stone-800 dark:text-white">General</h3>
            <Input name="siteName" label="Site Name" value={localSettings.siteName} onChange={handleChange} />
            <Input name="tagline" label="Tagline" value={localSettings.tagline} onChange={handleChange} />
            
            <ImagePicker 
               label="Website Logo"
               value={localSettings.logoUrl}
               onChange={(url) => setLocalSettings({...localSettings, logoUrl: url})}
            />
            
            <h3 className="text-xl font-bold border-b border-stone-200 dark:border-stone-700 pb-2 pt-4 text-stone-800 dark:text-white">Footer & Contact</h3>
            <Input name="footerText" label="Footer Copyright" value={localSettings.footerText} onChange={handleChange} />
            <Input name="contactEmail" label="Contact Email" value={localSettings.contactEmail} onChange={handleChange} />
            
            <h3 className="text-xl font-bold border-b border-stone-200 dark:border-stone-700 pb-2 pt-4 text-stone-800 dark:text-white">Data Management</h3>
            <div className="flex gap-4">
               <Button onClick={handleDownloadBackup} variant="secondary">
                  <Download size={16} /> Backup Posts
               </Button>
               <div className="relative">
                  <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                     <UploadIcon size={16} /> Restore Posts
                  </Button>
                  <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleRestoreBackup} 
                     className="hidden" 
                     accept=".json"
                  />
               </div>
            </div>

            <Button onClick={handleSave} className="w-full mt-4">Save Changes</Button>
         </Card>
      </div>
   )
};