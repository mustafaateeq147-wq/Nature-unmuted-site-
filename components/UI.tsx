import React, { useRef, useState } from 'react';
import { Loader2, Bold, Italic, Heading, List, ListOrdered, Quote, Image as ImageIcon, Link as LinkIcon, X, Check, Upload, Strikethrough, Code, Copy } from 'lucide-react';
import { marked } from 'marked';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', className = '', isLoading, ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-nature-600 hover:bg-nature-700 text-white shadow-md hover:shadow-lg",
    secondary: "bg-white dark:bg-stone-800 text-stone-700 dark:text-nature-100 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-1 mb-4">
    {label && <label className="text-sm font-semibold text-stone-600 dark:text-stone-300">{label}</label>}
    <input 
      className={`px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-nature-50 focus:ring-2 focus:ring-nature-500 focus:outline-none ${className}`}
      {...props} 
    />
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-1 mb-4">
    {label && <label className="text-sm font-semibold text-stone-600 dark:text-stone-300">{label}</label>}
    <textarea 
      className={`px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-nature-50 focus:ring-2 focus:ring-nature-500 focus:outline-none ${className}`}
      {...props} 
    />
  </div>
);

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 p-6 ${className}`}>
    {children}
  </div>
);

// --- Rich Text Editor Components ---

export const MarkdownRenderer: React.FC<{ content: string, className?: string }> = ({ content, className = '' }) => {
  const html = marked.parse(content || '', { async: false }) as string;
  return (
    <div 
      className={`prose prose-lg dark:prose-invert prose-stone max-w-none prose-headings:font-serif prose-a:text-nature-600 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const RichTextEditor: React.FC<{ 
  value: string, 
  onChange: (value: string) => void,
  label?: string
}> = ({ value, onChange, label }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (startTag: string, endTag: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = `${before}${startTag}${selectedText}${endTag}${after}`;
    onChange(newText);
    
    // Reset cursor/selection
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + startTag.length, end + startTag.length);
    }, 0);
  };

  const ToolbarButton = ({ icon: Icon, onClick, title }: any) => (
    <button 
      type="button"
      onClick={onClick}
      className="p-2 text-stone-500 hover:text-nature-600 hover:bg-stone-100 dark:hover:bg-stone-700 rounded transition-colors"
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="flex flex-col gap-1 mb-4">
      {label && <label className="text-sm font-semibold text-stone-600 dark:text-stone-300">{label}</label>}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-stone-800 focus-within:ring-2 focus-within:ring-nature-500 transition-all shadow-sm">
        <div className="flex items-center gap-1 p-2 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 flex-wrap">
          <ToolbarButton icon={Bold} onClick={() => insertFormatting('**', '**')} title="Bold" />
          <ToolbarButton icon={Italic} onClick={() => insertFormatting('*', '*')} title="Italic" />
          <ToolbarButton icon={Strikethrough} onClick={() => insertFormatting('~~', '~~')} title="Strikethrough" />
          <ToolbarButton icon={Heading} onClick={() => insertFormatting('## ')} title="Heading" />
          <ToolbarButton icon={Quote} onClick={() => insertFormatting('> ')} title="Quote" />
          <ToolbarButton icon={Code} onClick={() => insertFormatting('```\n', '\n```')} title="Code Block" />
          
          <div className="w-px h-4 bg-stone-300 dark:bg-stone-600 mx-1 hidden md:block"></div>
          
          <ToolbarButton icon={List} onClick={() => insertFormatting('- ')} title="Bullet List" />
          <ToolbarButton icon={ListOrdered} onClick={() => insertFormatting('1. ')} title="Ordered List" />
          
          <div className="w-px h-4 bg-stone-300 dark:bg-stone-600 mx-1 hidden md:block"></div>
          
          <ToolbarButton icon={LinkIcon} onClick={() => insertFormatting('[', '](url)')} title="Link" />
          <ToolbarButton icon={ImageIcon} onClick={() => insertFormatting('![alt text](', ')')} title="Image" />
        </div>
        <textarea 
          ref={textareaRef}
          className="w-full px-4 py-3 min-h-[400px] bg-transparent border-none focus:ring-0 resize-y font-mono text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your story using markdown..."
        />
        <div className="px-4 py-2 text-xs text-stone-400 bg-stone-50/50 dark:bg-stone-900/30 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          {value.length} characters
        </div>
      </div>
    </div>
  );
};

// --- Media Library Picker ---

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&w=1000&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=1000&q=80",
  "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&w=1000&q=80",
  "https://images.unsplash.com/photo-1501854140884-074cf2b2c3af?ixlib=rb-4.0.3&w=1000&q=80",
  "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&w=1000&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?ixlib=rb-4.0.3&w=1000&q=80",
];

export const ImagePicker: React.FC<{ 
  value: string, 
  onChange: (url: string) => void,
  label?: string 
}> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      {label && <label className="text-sm font-semibold text-stone-600 dark:text-stone-300 block mb-1">{label}</label>}
      <div className="flex gap-2">
        <div className="flex-grow relative">
           <input 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-nature-50 focus:ring-2 focus:ring-nature-500 focus:outline-none truncate"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
           />
           <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />
        
        <Button 
          type="button" 
          variant="secondary" 
          onClick={triggerFileUpload}
          title="Upload from Device"
        >
          <Upload size={18} />
        </Button>

        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleCopy}
          title="Copy URL"
          className={isCopied ? "text-green-600 border-green-200 bg-green-50" : ""}
        >
          {isCopied ? <Check size={18} /> : <Copy size={18} />}
        </Button>

        <Button type="button" variant="secondary" onClick={() => setIsOpen(true)}>Library</Button>
      </div>
      
      {/* Preview */}
      {value && (
        <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 group bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-900">
              <h3 className="font-bold text-lg">Select Image</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                 <h4 className="text-sm font-bold mb-2 text-stone-500 uppercase tracking-wider">Presets</h4>
                 <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_IMAGES.map((img) => (
                      <button 
                        key={img} 
                        type="button"
                        onClick={() => { onChange(img); setIsOpen(false); }}
                        className="relative aspect-video rounded-lg overflow-hidden hover:opacity-80 ring-2 ring-transparent hover:ring-nature-500 transition-all"
                      >
                        <img src={img} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                 </div>
              </div>

              <div>
                <h4 className="text-sm font-bold mb-2 text-stone-500 uppercase tracking-wider">Custom URL</h4>
                <div className="flex gap-2">
                  <input 
                    className="flex-grow px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                    placeholder="Paste image address here..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                  />
                  <Button type="button" onClick={() => { if(customUrl) { onChange(customUrl); setIsOpen(false); }}}>
                    Use
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};