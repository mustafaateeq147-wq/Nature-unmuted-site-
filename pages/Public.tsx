import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { Button, Card, Input, TextArea, MarkdownRenderer } from '../components/UI';
import { Calendar, User, Tag, Share2, MapPin, Mail, ArrowRight, Search, Edit } from 'lucide-react';
import { Category } from '../types';

// Components for smaller parts
const PostCard: React.FC<{ post: any }> = ({ post }) => (
  <Link to={`/post/${post.id}`} className="group h-full">
    <Card className="h-full flex flex-col overflow-hidden p-0 border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-4 left-4 bg-white/90 dark:bg-stone-900/90 text-nature-700 dark:text-nature-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {post.category}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
          <Calendar size={14} /> <span>{new Date(post.date).toLocaleDateString()}</span>
          <span>•</span>
          <span className="text-nature-600 dark:text-nature-400 font-medium">{post.author}</span>
        </div>
        <h3 className="text-xl font-bold font-serif text-stone-800 dark:text-stone-100 mb-2 group-hover:text-nature-600 dark:group-hover:text-nature-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-3 mb-4 flex-grow">
          {post.subtitle}
        </p>
        <div className="flex items-center text-nature-600 dark:text-nature-400 text-sm font-medium mt-auto">
          Read Article <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  </Link>
);

export const Home: React.FC = () => {
  const { posts, settings } = useBlog();
  const featuredPosts = posts.filter(p => p.isPublished).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Nature" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/40 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <span className="inline-block py-1 px-3 rounded-full bg-nature-500/80 backdrop-blur-sm text-xs font-bold uppercase tracking-widest mb-4 animate-fade-in">
            Welcome to {settings.siteName}
          </span>
          <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 leading-tight animate-slide-up">
            {settings.tagline}
          </h1>
          <p className="text-xl text-stone-100 max-w-2xl mx-auto mb-8 font-light animate-slide-up animation-delay-200">
            Join our journey to protect the planet. Discover stories, tips, and insights on sustainability and conservation.
          </p>
          <div className="flex justify-center gap-4 animate-slide-up animation-delay-400">
             <Link to="/blog">
              <Button className="bg-nature-500 hover:bg-nature-600 text-lg px-8 py-3 rounded-full">Explore Blog</Button>
             </Link>
             <Link to="/about">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm text-lg px-8 py-3 rounded-full">Our Mission</Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 bg-stone-50 dark:bg-stone-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-800 dark:text-white mb-2">Latest Insights</h2>
              <p className="text-stone-600 dark:text-stone-400">Fresh from the press, curated for you.</p>
            </div>
            <Link to="/blog" className="text-nature-600 dark:text-nature-400 font-medium hover:underline">View All</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPosts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-nature-700 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-nature-600 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-nature-800 rounded-full blur-3xl opacity-50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Join the Movement</h2>
          <p className="text-nature-100 mb-8 max-w-xl mx-auto">Get the latest eco-news, sustainability tips, and exclusive content delivered straight to your inbox.</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input type="email" placeholder="Enter your email" className="flex-grow px-6 py-3 rounded-full text-stone-900 focus:outline-none focus:ring-2 focus:ring-nature-300" />
            <button className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-full font-bold transition-colors">Subscribe</button>
          </div>
        </div>
      </section>
    </>
  );
};

export const BlogList: React.FC = () => {
  const { posts } = useBlog();
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter ? post.category === filter : true;
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.content.toLowerCase().includes(search.toLowerCase());
    return post.isPublished && matchesFilter && matchesSearch;
  });

  return (
    <div className="py-12 bg-stone-50 dark:bg-stone-900 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-stone-800 dark:text-white mb-4">Our Blog</h1>
          <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">Exploring the beauty of nature and the urgent need to protect it.</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            <Button variant={filter === '' ? 'primary' : 'secondary'} onClick={() => setFilter('')} className="whitespace-nowrap">All</Button>
            {Object.values(Category).map(cat => (
              <Button key={cat} variant={filter === cat ? 'primary' : 'secondary'} onClick={() => setFilter(cat)} className="whitespace-nowrap">
                {cat}
              </Button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-white focus:ring-2 focus:ring-nature-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="col-span-full text-center py-20 text-stone-500">
              No posts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { posts, user } = useBlog();
  const post = posts.find(p => p.id === id);

  if (!post) return <div className="text-center py-20">Post not found</div>;

  return (
    <article className="bg-white dark:bg-stone-900 min-h-screen pb-20">
      {/* Header Image */}
      <div className="h-[50vh] w-full relative">
        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 text-white">
           <div className="container mx-auto relative">
             {/* Admin Edit Button */}
             {user.isLoggedIn && (
               <div className="absolute right-0 top-0 -mt-16 md:mt-0 md:relative md:float-right">
                  <Link to={`/admin/editor/${post.id}`}>
                    <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-0 text-white shadow-lg">
                      <Edit size={16} /> Edit Post
                    </Button>
                  </Link>
               </div>
             )}

             <span className="bg-nature-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">{post.category}</span>
             <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">{post.title}</h1>
             <p className="text-xl text-stone-200 font-light max-w-3xl mb-6">{post.subtitle}</p>
             <div className="flex items-center gap-4">
               <img src={post.authorImage} alt={post.author} className="w-12 h-12 rounded-full border-2 border-white" />
               <div>
                 <p className="font-medium">{post.author}</p>
                 <p className="text-sm text-stone-300">{new Date(post.date).toLocaleDateString()} • 5 min read</p>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 grid md:grid-cols-[1fr_300px] gap-12">
        {/* Main Content */}
        <div>
          <MarkdownRenderer content={post.content} />

          {/* Tags & Share */}
          <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-3 py-1 rounded-full text-sm">
                  <Tag size={14} /> {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <span className="text-stone-500 font-medium self-center mr-2">Share:</span>
              <Button variant="ghost" className="rounded-full p-2"><Share2 size={18} /></Button>
            </div>
          </div>
          
          {/* Comments Placeholder */}
          <div className="mt-12">
             <h3 className="text-2xl font-serif font-bold mb-6 text-stone-800 dark:text-white">Comments</h3>
             <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-xl mb-6">
                <textarea className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 mb-2 focus:ring-2 focus:ring-nature-500 focus:outline-none" placeholder="Leave a comment..." rows={3}></textarea>
                <div className="flex justify-end">
                   <Button>Post Comment</Button>
                </div>
             </div>
             <p className="text-stone-500 italic">No comments yet. Be the first to share your thoughts!</p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
           <Card className="bg-nature-50 dark:bg-nature-900/20 border-nature-100 dark:border-nature-800">
             <h4 className="font-serif font-bold text-lg mb-4 text-nature-800 dark:text-nature-200">About the Author</h4>
             <div className="flex items-center gap-4 mb-4">
                <img src={post.authorImage} alt={post.author} className="w-16 h-16 rounded-full object-cover" />
                <div>
                   <p className="font-bold text-stone-800 dark:text-white">{post.author}</p>
                   <p className="text-xs text-stone-500 dark:text-stone-400">Environmental Enthusiast</p>
                </div>
             </div>
             <p className="text-sm text-stone-600 dark:text-stone-300">Dedicated to researching and writing about the beautiful complexities of our natural world.</p>
           </Card>

           <Card>
              <h4 className="font-serif font-bold text-lg mb-4 text-stone-800 dark:text-white">Related Topics</h4>
              <div className="flex flex-wrap gap-2">
                 {Object.values(Category).slice(0, 5).map(c => (
                    <Link to="/blog" key={c} className="text-sm text-nature-600 dark:text-nature-400 hover:underline block w-full py-1 border-b border-stone-100 dark:border-stone-700 last:border-0">{c}</Link>
                 ))}
              </div>
           </Card>
        </aside>
      </div>
    </article>
  );
};

export const About: React.FC = () => (
  <div className="py-20 container mx-auto px-4">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-serif font-bold text-stone-800 dark:text-white mb-8 text-center">Our Mission</h1>
      <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-12">
         <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Forest" className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-stone-900/30 flex items-center justify-center">
            <p className="text-white text-2xl md:text-3xl font-serif italic text-center px-4">"We do not inherit the earth from our ancestors, we borrow it from our children."</p>
         </div>
      </div>
      <div className="prose prose-lg dark:prose-invert prose-stone mx-auto">
        <p>Nature Unmuted was born from a simple idea: the planet has a voice, but it is often drowned out by the noise of modern life. We aim to amplify that voice.</p>
        <h3>Why Protect Our Planet?</h3>
        <p>Climate change, biodiversity loss, and pollution are not just abstract concepts—they are realities affecting every corner of the globe. Our goal is to break down these complex issues into actionable insights and compelling stories.</p>
        <p>We believe in the power of education and community. By understanding the intricate webs of life that sustain us, we can make better choices for a sustainable future.</p>
      </div>
      
      <div className="mt-16 flex flex-col md:flex-row items-center gap-8 bg-stone-100 dark:bg-stone-800 p-8 rounded-2xl">
         <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Founder" className="w-32 h-32 rounded-full object-cover" />
         <div>
            <h3 className="text-xl font-bold font-serif mb-2 text-stone-800 dark:text-white">Meet the Founder</h3>
            <p className="text-stone-600 dark:text-stone-300 italic mb-4">Alex Greenriver</p>
            <p className="text-stone-700 dark:text-stone-200">An ecologist turned writer, Alex started Nature Unmuted to bridge the gap between scientific research and public awareness.</p>
         </div>
      </div>
    </div>
  </div>
);

export const Contact: React.FC = () => (
  <div className="py-20 container mx-auto px-4">
    <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-serif font-bold text-stone-800 dark:text-white mb-6">Get in Touch</h1>
        <p className="text-stone-600 dark:text-stone-400 mb-8">Have a story tip? Want to collaborate? Or just want to say hi? We'd love to hear from you.</p>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-nature-100 dark:bg-nature-900 rounded-full text-nature-600 dark:text-nature-400">
               <Mail />
            </div>
            <div>
              <p className="font-bold text-stone-800 dark:text-white">Email Us</p>
              <p className="text-stone-600 dark:text-stone-400">hello@natureunmuted.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-nature-100 dark:bg-nature-900 rounded-full text-nature-600 dark:text-nature-400">
               <MapPin />
            </div>
            <div>
              <p className="font-bold text-stone-800 dark:text-white">Visit Us</p>
              <p className="text-stone-600 dark:text-stone-400">123 Eco Way, Green City, Earth</p>
            </div>
          </div>
        </div>
        
        {/* Map Placeholder */}
        <div className="mt-8 h-64 bg-stone-200 dark:bg-stone-800 rounded-xl flex items-center justify-center text-stone-500">
          <MapPin size={48} className="opacity-50" />
          <span className="ml-2">Google Maps Placeholder</span>
        </div>
      </div>

      <Card className="p-8">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent! (Mock)"); }}>
          <Input label="Name" placeholder="Your Name" required />
          <Input label="Email" type="email" placeholder="Your Email" required />
          <Input label="Subject" placeholder="Subject" />
          <TextArea label="Message" rows={5} placeholder="How can we help?" required />
          <Button type="submit" className="w-full">Send Message</Button>
        </form>
      </Card>
    </div>
  </div>
);