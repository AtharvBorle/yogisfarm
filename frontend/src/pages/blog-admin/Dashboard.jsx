import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getAssetUrl } from '../../api';
import toast from 'react-hot-toast';

const BlogAdminDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'edit', 'seo', 'categories'
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [authorName, setAuthorName] = useState('ProWIn');
  const [authorDate, setAuthorDate] = useState('');
  
  // New States
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [tags, setTags] = useState('');
  const [archiveBlogIds, setArchiveBlogIds] = useState('');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [sidebarImage, setSidebarImage] = useState('');
  const [sidebarLink, setSidebarLink] = useState('');
  const [status, setStatus] = useState('inactive');

  const [selectedBlogIds, setSelectedBlogIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // SEO States
  const [seoPage, setSeoPage] = useState('home');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoOgImage, setSeoOgImage] = useState('');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoBlogSearch, setSeoBlogSearch] = useState('');
  const [isConfiguringSpecificBlog, setIsConfiguringSpecificBlog] = useState(false);
  
  // Product SEO States
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [seoProductSearch, setSeoProductSearch] = useState('');
  const [isConfiguringSpecificProduct, setIsConfiguringSpecificProduct] = useState(false);

  // Manage SEO List view states
  const [seoView, setSeoView] = useState('list'); // 'list' or 'form'
  const [seoList, setSeoList] = useState([]);
  const [seoListLoading, setSeoListLoading] = useState(false);
  const [seoTotalCount, setSeoTotalCount] = useState(0);
  const [seoPageNum, setSeoPageNum] = useState(1);
  const [seoLimit] = useState(10);
  const [seoTotalPages, setSeoTotalPages] = useState(0);
  const [seoSearch, setSeoSearch] = useState('');
  const [seoTypeFilter, setSeoTypeFilter] = useState('all');
  const [seoStartDate, setSeoStartDate] = useState('');
  const [seoEndDate, setSeoEndDate] = useState('');
  const [isEditingSeo, setIsEditingSeo] = useState(false);
  
  // Editor State
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const wordInputRef = useRef(null);
  const featuredImageRef = useRef(null);
  const bannerImageRef = useRef(null);
  const authorAvatarRef = useRef(null);
  const sidebarImageRef = useRef(null);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/admin/me');
        if (!res.data.status) {
          toast.error('Session expired, please login.');
          navigate('/blogs/admin/login');
        }
      } catch (err) {
        toast.error('Session expired, please login.');
        navigate('/blogs/admin/login');
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch blogs list
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/blogs?admin=true');
      if (res.data.status) {
        setBlogs(res.data.blogs || []);
      } else {
        toast.error('Failed to load blog posts');
      }
    } catch (err) {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get('/blogs/categories');
      if (res.data.status) {
        const cats = res.data.categories || [];
        setCategories(cats);
        if (cats.length > 0) {
          setCategory(prev => prev || cats[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  // Sync editor content editable value only when activeTab, isHtmlMode or editingId switches
  useEffect(() => {
    if ((activeTab === 'create' || activeTab === 'edit') && editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [activeTab, isHtmlMode, editingId]);

  // Handle Slug Auto-Generation
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (activeTab === 'create') {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  // Editor command helper
  const execEditorCommand = (command, value = null) => {
    if (isHtmlMode) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Editor content changes
  const handleEditorInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Handle paste in editor to clean up pasted styles (e.g. green headings, classes, bad font-sizes)
  const handleEditorPaste = (e) => {
    // We let the browser perform the native paste operation first.
    // This allows the browser to convert Microsoft Word stylesheets and nested clipboard elements
    // into standard inline CSS styles (font-family, font-size, colors, bold, lists, etc.) on the elements.
    
    // We schedule a sanitize pass immediately after the paste completes.
    setTimeout(() => {
      if (editorRef.current) {
        sanitizeEditorDOM(editorRef.current);
        setContent(editorRef.current.innerHTML);
      }
    }, 10);
  };

  // Walk through the editor elements to strip styles/classes that conflict with Yogi's Farms theme
  const sanitizeEditorDOM = (root) => {
    const walk = (node) => {
      if (node.nodeType === 1) { // Element node
        const tagName = node.tagName.toUpperCase();

        // 1. Remove class and id attributes completely so global page stylesheet rules (like .post-title or .section-title h3)
        // do not force headings green inside the editor.
        node.removeAttribute('class');
        node.removeAttribute('id');

        // 2. Check inline style attribute and clean specific conflicting styles (like brand green colors)
        const styleAttr = node.getAttribute('style');
        if (styleAttr) {
          let styleRules = styleAttr.split(';').map(rule => rule.trim()).filter(Boolean);
          
          styleRules = styleRules.filter(rule => {
            const parts = rule.split(':').map(p => p.trim());
            if (parts.length < 2) return true;
            const prop = parts[0].toLowerCase();
            const val = parts[1].toLowerCase();

            // Strip green color values from headings and text so they default to dark neutral color
            if (prop === 'color') {
              if (val.includes('green') || val.includes('0a6738') || val.includes('046938') || val.includes('rgb(4,') || val.includes('rgb(10,')) {
                return false;
              }
            }

            // Strip green background highlights
            if (prop === 'background-color' || prop === 'background') {
              if (val.includes('green') || val.includes('0a6738') || val.includes('046938') || val.includes('rgb(4,') || val.includes('rgb(10,')) {
                return false;
              }
            }

            return true;
          });

          if (styleRules.length > 0) {
            node.setAttribute('style', styleRules.join('; '));
          } else {
            node.removeAttribute('style');
          }
        }

        // 3. Remove pasted raw <style> tags to avoid polluting the editor
        if (tagName === 'STYLE') {
          node.parentNode.removeChild(node);
          return;
        }
      }

      // Process children
      const children = Array.from(node.childNodes);
      for (const child of children) {
        walk(child);
      }
    };

    walk(root);
  };


  // Editor image upload handler
  const handleEditorImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadPath', 'blogs');

    const loadToast = toast.loading('Uploading image...');
    try {
      const res = await api.post('/blogs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        toast.success('Image uploaded!', { id: loadToast });
        // Focus the editor before inserting
        if (editorRef.current) {
          editorRef.current.focus();
        }
        document.execCommand('insertImage', false, res.data.url);
        // Trigger state sync
        handleEditorInput();
      } else {
        toast.error(res.data.message || 'Upload failed', { id: loadToast });
      }
    } catch (err) {
      toast.error('Upload error', { id: loadToast });
    }
  };

  // Import Word document (.docx) handler
  const handleWordImportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'docx') {
      toast.error('Only Microsoft Word (.docx) files are supported.');
      return;
    }

    const formData = new FormData();
    formData.append('doc', file);

    const loadToast = toast.loading('Importing content from Word...');
    try {
      const res = await api.post('/blogs/import-word', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        toast.success('Word document imported successfully!', { id: loadToast });
        
        // Load clean HTML into editor content state
        const importedHtml = res.data.html;
        setContent(importedHtml);
        
        if (editorRef.current) {
          editorRef.current.innerHTML = importedHtml;
          // Trigger post-paste sanitizer to make sure classes and ids from Word are stripped
          sanitizeEditorDOM(editorRef.current);
          setContent(editorRef.current.innerHTML);
        }
      } else {
        toast.error(res.data.message || 'Import failed', { id: loadToast });
      }
    } catch (err) {
      toast.error('Error importing Word document: ' + err.message, { id: loadToast });
    }

    // Reset file input value so same file can be imported again if needed
    e.target.value = '';
  };

  // Featured Image Upload handler
  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadPath', 'blogs');

    const loadToast = toast.loading('Uploading featured image...');
    try {
      const res = await api.post('/blogs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        toast.success('Featured image uploaded!', { id: loadToast });
        setImage(res.data.url);
      } else {
        toast.error(res.data.message || 'Upload failed', { id: loadToast });
      }
    } catch (err) {
      toast.error('Upload error', { id: loadToast });
    }
  };

  // Banner/Hero Image Upload handler
  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadPath', 'blogs');

    const loadToast = toast.loading('Uploading banner image...');
    try {
      const res = await api.post('/blogs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        toast.success('Banner/Hero image uploaded!', { id: loadToast });
        setBannerImage(res.data.url);
      } else {
        toast.error(res.data.message || 'Upload failed', { id: loadToast });
      }
    } catch (err) {
      toast.error('Upload error', { id: loadToast });
    }
  };

  // Author Avatar Upload handler
  const handleAuthorAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadPath', 'blogs');

    const loadToast = toast.loading('Uploading author image...');
    try {
      const res = await api.post('/blogs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        toast.success('Author profile image uploaded!', { id: loadToast });
        setAuthorAvatar(res.data.url);
      } else {
        toast.error(res.data.message || 'Upload failed', { id: loadToast });
      }
    } catch (err) {
      toast.error('Upload error', { id: loadToast });
    }
  };

  // Sidebar Banner Image Upload handler
  const handleSidebarImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadPath', 'blogs');

    const loadToast = toast.loading('Uploading sidebar banner image...');
    try {
      const res = await api.post('/blogs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status) {
        toast.success('Sidebar banner image uploaded!', { id: loadToast });
        setSidebarImage(res.data.url);
      } else {
        toast.error(res.data.message || 'Upload failed', { id: loadToast });
      }
    } catch (err) {
      toast.error('Upload error', { id: loadToast });
    }
  };

  // Helper to count words in a string
  const getWordCount = (str) => {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  // Restrict short description to maximum 25 words
  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean);
    
    if (words.length > 25) {
      const tokens = text.split(/(\s+)/);
      let count = 0;
      let resultParts = [];
      for (const token of tokens) {
        if (/\s+/.test(token)) {
          resultParts.push(token);
        } else if (token !== '') {
          count++;
          if (count <= 25) {
            resultParts.push(token);
          } else {
            break;
          }
        }
      }
      setDescription(resultParts.join('').trim());
    } else {
      setDescription(text);
    }
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setCategory(categories.length > 0 ? categories[0].name : '');
    setDescription('');
    setContent('');
    setImage('');
    setBannerImage('');
    setAuthorName('ProWIn');
    setAuthorDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
    setAuthorAvatar('');
    setTags('');
    setArchiveBlogIds('');
    setArchiveSearchQuery('');
    setSidebarImage('');
    setSidebarLink('');
    setStatus('inactive');
    setIsHtmlMode(false);
    setSelectedBlogIds([]);
  };

  // Edit action
  const startEdit = (blog) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setCategory(blog.category);
    setDescription(blog.description || '');
    setContent(blog.content || '');
    setImage(blog.image || '');
    setBannerImage(blog.bannerImage || '');
    setAuthorName(blog.authorName || 'ProWIn');
    setAuthorDate(blog.authorDate || '');
    setAuthorAvatar(blog.authorAvatar || '');
    setTags(blog.tags || '');
    setArchiveBlogIds(blog.archiveBlogIds || '');
    setArchiveSearchQuery('');
    setSidebarImage(blog.sidebarImage || '');
    setSidebarLink(blog.sidebarLink || '');
    setStatus(blog.status || 'inactive');
    setActiveTab('edit');
    setIsHtmlMode(false);
  };

  // Delete Action
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await api.delete(`/blogs/${id}`);
      if (res.data.status) {
        toast.success('Blog post deleted successfully');
        fetchBlogs();
      } else {
        toast.error(res.data.message || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Delete error');
    }
  };

  // Submit creation / update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category || !content) {
      toast.error('Title, Category, and Content are required!');
      return;
    }

    // Ensure short description is strictly truncated to 25 words max
    const descWords = description.trim().split(/\s+/).filter(Boolean);
    const finalDescription = descWords.length > 25 ? descWords.slice(0, 25).join(' ') : description;

    const payload = {
      title,
      slug,
      category,
      description: finalDescription,
      content,
      image,
      bannerImage,
      authorName,
      authorDate,
      authorAvatar,
      tags,
      archiveBlogIds,
      sidebarImage,
      sidebarLink,
      status
    };

    try {
      let res;
      if (activeTab === 'edit') {
        res = await api.put(`/blogs/${editingId}`, payload);
      } else {
        res = await api.post('/blogs', payload);
      }

      if (res.data.status) {
        toast.success(activeTab === 'edit' ? 'Blog updated successfully!' : 'Blog created successfully!');
        resetForm();
        setActiveTab('list');
        fetchBlogs();
      } else {
        toast.error(res.data.message || 'Failed to save blog post');
      }
    } catch (err) {
      toast.error('Server error saving blog post');
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedBlogIds.length === 0) {
      toast.error('No blogs selected!');
      return;
    }
    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedBlogIds.length} selected blog posts?`)) {
      return;
    }

    try {
      const res = await api.post('/blogs/bulk-action', {
        ids: selectedBlogIds,
        action
      });

      if (res.data.status) {
        toast.success(res.data.message || 'Bulk action completed');
        setSelectedBlogIds([]);
        fetchBlogs();
      } else {
        toast.error(res.data.message || 'Bulk action failed');
      }
    } catch (err) {
      toast.error('Server error executing bulk action');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const filteredIds = filteredBlogs.map(b => b.id);
      setSelectedBlogIds(filteredIds);
    } else {
      setSelectedBlogIds([]);
    }
  };

  const handleSelectBlog = (id, checked) => {
    if (checked) {
      setSelectedBlogIds(prev => [...prev, id]);
    } else {
      setSelectedBlogIds(prev => prev.filter(item => item !== id));
    }
  };

  // SEO Handlers
  const fetchSeoList = async () => {
    setSeoListLoading(true);
    try {
      const params = new URLSearchParams({
        page: seoPageNum,
        limit: seoLimit,
        search: seoSearch,
        type: seoTypeFilter,
        startDate: seoStartDate,
        endDate: seoEndDate
      });
      const res = await api.get(`/settings/seo?${params.toString()}`);
      if (res.data.status) {
        setSeoList(res.data.data || []);
        setSeoTotalCount(res.data.totalCount || 0);
        setSeoTotalPages(res.data.totalPages || 0);
      } else {
        toast.error(res.data.message || 'Failed to load SEO pages');
      }
    } catch (err) {
      toast.error('Failed to fetch SEO list');
    } finally {
      setSeoListLoading(false);
    }
  };

  const handleSeoDelete = async (pageKey) => {
    if (!window.confirm(`Are you sure you want to delete SEO settings for '${pageKey}'?`)) return;
    try {
      const res = await api.delete(`/settings/seo/${encodeURIComponent(pageKey)}`);
      if (res.data.status) {
        toast.success(res.data.message || 'SEO settings deleted');
        if (seoList.length === 1 && seoPageNum > 1) {
          setSeoPageNum(prev => prev - 1);
        } else {
          fetchSeoList();
        }
      } else {
        toast.error(res.data.message || 'Failed to delete SEO settings');
      }
    } catch (err) {
      toast.error('Error deleting SEO settings');
    }
  };

  const fetchSeoSettings = async (page) => {
    setSeoLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.status && res.data.settings) {
        const settings = res.data.settings;
        setSeoTitle(settings[`seo_${page}_title`] || '');
        setSeoDesc(settings[`seo_${page}_description`] || '');
        setSeoKeywords(settings[`seo_${page}_keywords`] || '');
        setSeoOgImage(settings[`seo_${page}_og_image`] || '');
      }
    } catch (err) {
      console.error('Failed to fetch SEO settings', err);
    } finally {
      setSeoLoading(false);
    }
  };

  const handleSeoSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        settings: {
          [`seo_${seoPage}_title`]: seoTitle,
          [`seo_${seoPage}_description`]: seoDesc,
          [`seo_${seoPage}_keywords`]: seoKeywords,
          [`seo_${seoPage}_og_image`]: seoOgImage
        }
      };
      const res = await api.put('/settings', payload);
      if (res.data.status) {
        toast.success('SEO settings saved successfully!');
        setSeoView('list');
        fetchSeoList();
      } else {
        toast.error(res.data.message || 'Failed to save SEO settings');
      }
    } catch (err) {
      toast.error('Error saving SEO settings');
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await api.get('/products?limit=1000');
      if (res.data.status) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // SEO list fetch trigger
  useEffect(() => {
    if (activeTab === 'seo' && seoView === 'list') {
      fetchSeoList();
    }
  }, [activeTab, seoView, seoPageNum, seoTypeFilter, seoStartDate, seoEndDate]);

  // Debounced search for SEO list
  useEffect(() => {
    if (activeTab === 'seo' && seoView === 'list') {
      const handler = setTimeout(() => {
        setSeoPageNum(1);
        fetchSeoList();
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [seoSearch]);

  // SEO form editor trigger
  useEffect(() => {
    if (activeTab === 'seo') {
      if (products.length === 0) {
        fetchProducts();
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'seo' && seoView === 'form') {
      fetchSeoSettings(seoPage);
    }
  }, [activeTab, seoView, seoPage]);

  // Client-side search and category filtering
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      (blog.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.authorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.slug || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategoryFilter === 'All' || 
      (blog.category || '').trim().toLowerCase() === selectedCategoryFilter.trim().toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Logout Admin
  const handleLogout = async () => {
    try {
      await api.get('/admin/logout');
      toast.success('Logged out successfully');
      navigate('/blogs/admin/login');
    } catch (err) {
      toast.error('Logout error');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    const slugValue = categorySlug.trim() || categoryName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
    try {
      let res;
      if (editingCategoryId) {
        res = await api.put(`/blogs/categories/${editingCategoryId}`, { name: categoryName, slug: slugValue });
      } else {
        res = await api.post('/blogs/categories', { name: categoryName, slug: slugValue });
      }

      if (res.data.status) {
        toast.success(editingCategoryId ? 'Category updated successfully!' : 'Category created successfully!');
        setCategoryName('');
        setCategorySlug('');
        setEditingCategoryId(null);
        fetchCategories();
      } else {
        toast.error(res.data.message || 'Failed to save category');
      }
    } catch (err) {
      toast.error('Server error saving category');
    }
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/blogs/categories/${id}`);
      if (res.data.status) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(res.data.message || 'Failed to delete category');
      }
    } catch (err) {
      toast.error('Error deleting category');
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategorySlug('');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0A6738',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 10px rgba(0, 0, 0, 0.05)',
        flexShrink: 0
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '0.5px' }}>Yogi's Farms</div>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#ACD140', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Blog Dashboard
          </span>
        </div>

        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button
            onClick={() => { setActiveTab('list'); resetForm(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'list' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.2s'
            }}
          >
            <i className="fi-rs-document" style={{ fontSize: '16px' }}></i>
            All Blog Posts
          </button>

          <button
            onClick={() => { setActiveTab('create'); resetForm(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'create' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.2s'
            }}
          >
            <i className="fi-rs-add" style={{ fontSize: '16px' }}></i>
            Create New Blog
          </button>

          <button
            onClick={() => { setActiveTab('categories'); resetForm(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'categories' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.2s'
            }}
          >
            <i className="fi-rs-settings" style={{ fontSize: '16px' }}></i>
            Manage Categories
          </button>

          <button
            onClick={() => { setActiveTab('seo'); resetForm(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'seo' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.2s'
            }}
          >
            <i className="fi-rs-search" style={{ fontSize: '16px' }}></i>
            SEO Settings
          </button>

          <a
            href="/blogs"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <i className="fi-rs-eye" style={{ fontSize: '16px' }}></i>
            View Live Site
          </a>
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
          >
            <i className="fi-rs-sign-out" style={{ fontSize: '16px' }}></i>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* Header Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#101828', margin: '0 0 4px 0' }}>
              {activeTab === 'list' && 'All Blog Posts'}
              {activeTab === 'create' && 'Create Blog Post'}
              {activeTab === 'edit' && 'Edit Blog Post'}
              {activeTab === 'categories' && 'Blog Categories'}
            </h1>
            <p style={{ color: '#667085', margin: 0, fontSize: '14px' }}>
              {activeTab === 'list' && 'Manage your live posts, view counts, and update blogs.'}
              {activeTab === 'create' && 'Publish a new dynamic blog post with rich HTML elements.'}
              {activeTab === 'edit' && 'Modify the properties, layout, or content of an existing post.'}
              {activeTab === 'categories' && 'Manage your dynamic blog categories for client filters.'}
            </p>
          </div>
          {activeTab === 'list' && (
            <button
              onClick={() => { setActiveTab('create'); resetForm(); }}
              style={{
                backgroundColor: '#0A6738',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#08532d'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0A6738'}
            >
              + Create New Blog
            </button>
          )}
        </div>

        {/* List View */}
        {activeTab === 'list' && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #EAECF0',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.1)',
            overflow: 'hidden'
          }}>
            {/* Search & Category Filter Bar */}
            <div style={{
              display: 'flex',
              gap: '16px',
              padding: '20px 24px',
              borderBottom: '1px solid #EAECF0',
              flexWrap: 'wrap',
              alignItems: 'center',
              backgroundColor: '#FDFDFD'
            }}>
              <div style={{ flex: '1 1 300px', position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="Search by Title, Category, Author, or Slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 16px 0 40px',
                    borderRadius: '8px',
                    border: '1px solid #D0D5DD',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <i className="fi-rs-search" style={{ position: 'absolute', left: '14px', top: '12px', color: '#667085', fontSize: '16px' }}></i>
              </div>
              <div style={{ width: '200px' }}>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #D0D5DD',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Actions Header */}
            {selectedBlogIds.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 24px',
                backgroundColor: '#F3F4F6',
                borderBottom: '1px solid #EAECF0',
                gap: '16px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  {selectedBlogIds.length} item(s) selected
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleBulkAction('active')}
                    style={{
                      backgroundColor: '#0A6738', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    Make Active
                  </button>
                  <button 
                    onClick={() => handleBulkAction('inactive')}
                    style={{
                      backgroundColor: '#6B7280', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    Make Inactive
                  </button>
                  <button 
                    onClick={() => handleBulkAction('delete')}
                    style={{
                      backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <img src="/assets/imgs/theme/loader.gif" alt="Loading..." style={{ width: '60px' }} />
                <p style={{ color: '#667085', marginTop: '15px' }}>Loading blogs list...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#344054', marginBottom: '8px' }}>No blog posts found</h3>
                <p style={{ color: '#667085', fontSize: '14px' }}>Try adjusting your search filters or create a new blog post.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #EAECF0' }}>
                      <th style={{ padding: '16px 24px', width: '40px' }}>
                        <input 
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={filteredBlogs.length > 0 && selectedBlogIds.length === filteredBlogs.length}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase' }}>Blog Details</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase' }}>Author / Date</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase' }}>Slug</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs.map((blog) => (
                      <tr key={blog.id} style={{ borderBottom: '1px solid #EAECF0', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '16px 24px', width: '40px' }}>
                          <input 
                            type="checkbox"
                            checked={selectedBlogIds.includes(blog.id)}
                            onChange={(e) => handleSelectBlog(blog.id, e.target.checked)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img
                              src={getAssetUrl(blog.image) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                              alt=""
                              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #EAECF0' }}
                            />
                            <div style={{ maxWidth: '300px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#101828', margin: '0 0 4px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {blog.title}
                              </h4>
                              <p style={{ fontSize: '12px', color: '#667085', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {blog.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: 'rgba(10, 103, 56, 0.08)',
                            color: '#0A6738',
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '4px 10px',
                            borderRadius: '12px'
                          }}>
                            {blog.category}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontSize: '13px' }}>
                            <div style={{ fontWeight: '500', color: '#344054' }}>{blog.authorName}</div>
                            <div style={{ color: '#667085', fontSize: '12px' }}>{blog.authorDate}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#667085', fontFamily: 'monospace' }}>
                          {blog.slug}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: blog.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            color: blog.status === 'active' ? '#10B981' : '#6B7280',
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            textTransform: 'capitalize'
                          }}>
                            {blog.status || 'inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => startEdit(blog)}
                              style={{
                                border: 'none',
                                background: 'none',
                                color: '#0A6738',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(blog.id)}
                              style={{
                                border: 'none',
                                background: 'none',
                                color: '#F04438',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Category Management View */}
        {activeTab === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Create/Edit Category Form */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #EAECF0',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#101828' }}>
                {editingCategoryId ? 'Edit Category' : 'Create New Category'}
              </h3>
              <form onSubmit={handleCategorySubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Healthy Oils"
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 16px',
                      borderRadius: '8px',
                      border: '1px solid #D0D5DD',
                      boxSizing: 'border-box',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ flex: '1 1 250px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                    Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    placeholder="e.g. healthy-oils"
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 16px',
                      borderRadius: '8px',
                      border: '1px solid #D0D5DD',
                      boxSizing: 'border-box',
                      fontSize: '15px',
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#0A6738',
                      color: '#ffffff',
                      border: 'none',
                      height: '46px',
                      padding: '0 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#08532d'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#0A6738'}
                  >
                    {editingCategoryId ? 'Update' : 'Add Category'}
                  </button>
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={cancelEditCategory}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#344054',
                        border: '1px solid #D0D5DD',
                        height: '46px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Categories Table List */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #EAECF0',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
              overflow: 'hidden'
            }}>
              {categoriesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <img src="/assets/imgs/theme/loader.gif" alt="Loading..." style={{ width: '80px' }} />
                </div>
              ) : categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#667085' }}>
                  <i className="fi-rs-settings" style={{ fontSize: '32px', display: 'block', marginBottom: '12px', color: '#98A2B3' }}></i>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>No categories created yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #EAECF0' }}>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#475467', textTransform: 'uppercase' }}>ID</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#475467', textTransform: 'uppercase' }}>Category Name</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#475467', textTransform: 'uppercase' }}>Slug</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#475467', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ divideY: '1px solid #EAECF0' }}>
                      {categories.map((cat) => (
                        <tr key={cat.id} style={{ borderBottom: '1px solid #EAECF0' }}>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#667085' }}>
                            {cat.id}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#101828' }}>
                            {cat.name}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475467', fontFamily: 'monospace' }}>
                            {cat.slug}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => startEditCategory(cat)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  color: '#0A6738',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCategoryDelete(cat.id)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  color: '#F04438',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create / Edit View */}
        {(activeTab === 'create' || activeTab === 'edit') && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              {/* Form Fields Column */}
              <div style={{
                flex: '2 1 600px',
                backgroundColor: '#ffffff',
                padding: '32px',
                borderRadius: '12px',
                border: '1px solid #EAECF0',
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter blog title"
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 16px',
                      borderRadius: '8px',
                      border: '1px solid #D0D5DD',
                      boxSizing: 'border-box',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. healthy-groundnut-oil"
                      required
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '15px',
                        outline: 'none',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '15px',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      {categories.length === 0 ? (
                        <option value="">No categories available - please add one first</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                    Short Description (SEO / Card Preview)
                  </label>
                  <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Provide a brief summary of the blog post to attract readers..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #D0D5DD',
                      boxSizing: 'border-box',
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#667085' }}>
                      Brief summary to attract readers (SEO & blog card preview).
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: getWordCount(description) >= 25 ? '#b42318' : '#667085' 
                    }}>
                      {getWordCount(description)} / 25 words
                    </span>
                  </div>
                </div>

                {/* Rich text WYSIWYG Editor section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#344054', margin: 0 }}>
                      Blog Content *
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="htmlMode"
                        checked={isHtmlMode}
                        onChange={(e) => setIsHtmlMode(e.target.checked)}
                        style={{ 
                          width: '14px', 
                          height: '14px', 
                          minWidth: '14px', 
                          minHeight: '14px', 
                          cursor: 'pointer',
                          margin: 0,
                          padding: 0,
                          verticalAlign: 'middle',
                          WebkitAppearance: 'checkbox',
                          appearance: 'checkbox'
                        }}
                      />
                      <label htmlFor="htmlMode" style={{ fontSize: '12px', fontWeight: '600', color: '#667085', cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center' }}>
                        View HTML Source Code
                      </label>
                    </div>
                  </div>

                  {/* WYSIWYG Editor Toolbar */}
                  {!isHtmlMode && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#F3F4F6',
                      border: '1px solid #D0D5DD',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      borderBottom: 'none',
                      padding: '8px 12px 6px 12px',
                      fontFamily: 'Segoe UI, system-ui, sans-serif',
                      boxSizing: 'border-box'
                    }}>
                      {/* Ribbon Stylesheets */}
                      <style dangerouslySetInnerHTML={{ __html: `
                        .ribbon-btn {
                          height: 28px;
                          min-width: 28px;
                          border: 1px solid transparent;
                          background: none;
                          border-radius: 3px;
                          cursor: pointer;
                          font-size: 13px;
                          display: inline-flex;
                          align-items: center;
                          justify-content: center;
                          color: #333333;
                          padding: 0 6px;
                          transition: all 0.1s ease;
                        }
                        .ribbon-btn:hover {
                          background-color: #E4E7EC !important;
                          border-color: #D0D5DD !important;
                        }
                        .ribbon-btn:active {
                          background-color: #D0D5DD !important;
                        }
                        
                        .ribbon-select {
                          height: 28px;
                          padding: 0 4px;
                          border-radius: 3px;
                          border: 1px solid #D0D5DD;
                          font-size: 12px;
                          background-color: #ffffff;
                          cursor: pointer;
                          outline: none;
                          color: #333333;
                          transition: all 0.1s ease;
                        }
                        .ribbon-select:hover {
                          border-color: #98A2B3;
                        }

                        .word-style-card {
                          height: 38px;
                          min-width: 80px;
                          background-color: #ffffff;
                          border: 1px solid #D0D5DD;
                          border-radius: 3px;
                          display: inline-flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          cursor: pointer;
                          padding: 0 8px;
                          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                          transition: all 0.1s ease;
                          user-select: none;
                        }
                        .word-style-card:hover {
                          background-color: #F8F9FA !important;
                          border-color: #98A2B3 !important;
                        }
                        .word-style-card:active {
                          background-color: #F2F4F7 !important;
                        }
                      `}} />

                      {/* The Ribbon Items Layout */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'stretch' }}>
                        
                        {/* Group 1: Undo & Clean */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '60px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('undo')} title="Undo (Ctrl+Z)">↶</button>
                            <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('redo')} title="Redo (Ctrl+Y)">↷</button>
                            <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('removeFormat')} title="Clear Formatting">🧹</button>
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: '600', color: '#8c95a5', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.5px' }}>Undo</span>
                        </div>
                        
                        <div style={{ width: '1px', backgroundColor: '#D0D5DD', margin: '0 4px', alignSelf: 'stretch' }}></div>

                        {/* Group 2: Font */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '60px' }}>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Font Select */}
                            <select 
                              onChange={(e) => execEditorCommand('fontName', e.target.value)}
                              defaultValue="Poppins"
                              className="ribbon-select"
                              title="Font Family"
                            >
                              <option value="Poppins">Poppins</option>
                              <option value="Inter">Inter</option>
                              <option value="Arial">Arial</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Courier New">Courier New</option>
                              <option value="Times New Roman">Times New Roman</option>
                            </select>

                            {/* Font Size Select */}
                            <select 
                              onChange={(e) => execEditorCommand('fontSize', e.target.value)}
                              defaultValue="3"
                              className="ribbon-select"
                              style={{ width: '60px' }}
                              title="Font Size"
                            >
                              <option value="1">8pt</option>
                              <option value="2">10pt</option>
                              <option value="3">12pt</option>
                              <option value="4">14pt</option>
                              <option value="5">18pt</option>
                              <option value="6">24pt</option>
                              <option value="7">36pt</option>
                            </select>

                            {/* Stylings */}
                            <div style={{ display: 'flex', gap: '1px' }}>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('bold')} title="Bold" style={{ fontWeight: 'bold' }}>B</button>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('italic')} title="Italic" style={{ fontStyle: 'italic' }}>I</button>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('underline')} title="Underline" style={{ textDecoration: 'underline' }}>U</button>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('strikeThrough')} title="Strikethrough" style={{ textDecoration: 'line-through' }}>ab</button>
                            </div>

                            {/* Colors */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '4px' }}>
                              {/* Font Color */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '9px', color: '#667085', fontWeight: 'bold', lineHeight: '1' }}>Text</span>
                                <input 
                                  type="color" 
                                  onChange={(e) => execEditorCommand('foreColor', e.target.value)}
                                  style={{ width: '22px', height: '14px', padding: 0, border: '1px solid #D0D5DD', cursor: 'pointer', backgroundColor: 'transparent' }}
                                  title="Font Color"
                                />
                              </div>

                              {/* Highlight Color */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '9px', color: '#667085', fontWeight: 'bold', lineHeight: '1' }}>Highlight</span>
                                <input 
                                  type="color" 
                                  defaultValue="#ffff00"
                                  onChange={(e) => execEditorCommand('hiliteColor', e.target.value)}
                                  style={{ width: '22px', height: '14px', padding: 0, border: '1px solid #D0D5DD', cursor: 'pointer', backgroundColor: 'transparent' }}
                                  title="Text Highlight"
                                />
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: '600', color: '#8c95a5', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.5px' }}>Font</span>
                        </div>

                        <div style={{ width: '1px', backgroundColor: '#D0D5DD', margin: '0 4px', alignSelf: 'stretch' }}></div>

                        {/* Group 3: Paragraph */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '60px' }}>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {/* Lists */}
                            <div style={{ display: 'flex', gap: '1px' }}>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('insertUnorderedList')} title="Bullet List">• List</button>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('insertOrderedList')} title="Numbered List">1. List</button>
                            </div>

                            {/* Indents */}
                            <div style={{ display: 'flex', gap: '1px' }}>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('outdent')} title="Decrease Indent">⇤</button>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('indent')} title="Increase Indent">⇥</button>
                            </div>

                            {/* Alignments */}
                            <div style={{ display: 'flex', gap: '1px' }}>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('justifyLeft')} title="Align Left">Left</button>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('justifyCenter')} title="Align Center">Center</button>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('justifyRight')} title="Align Right">Right</button>
                              <button type="button" className="ribbon-btn" onClick={() => execEditorCommand('justifyFull')} title="Justify">Justify</button>
                            </div>
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: '600', color: '#8c95a5', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.5px' }}>Paragraph</span>
                        </div>

                        <div style={{ width: '1px', backgroundColor: '#D0D5DD', margin: '0 4px', alignSelf: 'stretch' }}></div>

                        {/* Group 4: Styles */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '60px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button 
                              type="button" 
                              className="word-style-card" 
                              onClick={() => execEditorCommand('formatBlock', '<p>')}
                              title="Normal Text"
                            >
                              <span style={{ fontWeight: 'normal', fontSize: '11px', color: '#333' }}>Normal</span>
                            </button>
                            <button 
                              type="button" 
                              className="word-style-card" 
                              onClick={() => execEditorCommand('formatBlock', '<h1>')}
                              style={{ borderTop: '3px solid #0056b3' }}
                              title="Heading 1"
                            >
                              <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#0056b3' }}>Heading 1</span>
                            </button>
                            <button 
                              type="button" 
                              className="word-style-card" 
                              onClick={() => execEditorCommand('formatBlock', '<h2>')}
                              style={{ borderTop: '3px solid #2e7d32' }}
                              title="Heading 2"
                            >
                              <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#2e7d32' }}>Heading 2</span>
                            </button>
                            <button 
                              type="button" 
                              className="word-style-card" 
                              onClick={() => execEditorCommand('formatBlock', '<h3>')}
                              style={{ borderTop: '3px solid #c62828' }}
                              title="Heading 3"
                            >
                              <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#c62828' }}>Heading 3</span>
                            </button>
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: '600', color: '#8c95a5', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.5px' }}>Styles</span>
                        </div>

                        <div style={{ width: '1px', backgroundColor: '#D0D5DD', margin: '0 4px', alignSelf: 'stretch' }}></div>

                        {/* Group 5: Insert */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '60px' }}>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="ribbon-btn"
                              onClick={() => {
                                const url = prompt('Enter the link URL:');
                                if (url) execEditorCommand('createLink', url);
                              }}
                              title="Insert Link"
                              style={{ color: '#0288d1', fontWeight: '600' }}
                            >
                              🔗 Link
                            </button>
                            <button
                              type="button"
                              className="ribbon-btn"
                              onClick={() => execEditorCommand('unlink')}
                              title="Remove Link"
                              style={{ color: '#d32f2f', fontWeight: '600' }}
                            >
                              🔗❌ Unlink
                            </button>
                            <button
                              type="button"
                              className="ribbon-btn"
                              onClick={() => fileInputRef.current && fileInputRef.current.click()}
                              title="Insert Image inside content"
                              style={{ color: '#2e7d32', fontWeight: '600' }}
                            >
                              🖼️ Image
                            </button>
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: '600', color: '#8c95a5', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.5px' }}>Insert</span>
                        </div>

                        <div style={{ width: '1px', backgroundColor: '#D0D5DD', margin: '0 4px', alignSelf: 'stretch' }}></div>

                        {/* Group 6: Word Import */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '60px' }}>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="ribbon-btn"
                              onClick={() => wordInputRef.current && wordInputRef.current.click()}
                              title="Import from MS Word (.docx)"
                              style={{ color: '#185abd', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              📄 Import Word (.docx)
                            </button>
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: '600', color: '#8c95a5', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.5px' }}>Import</span>
                        </div>

                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleEditorImageUpload}
                        style={{ display: 'none' }}
                      />
                      <input
                        type="file"
                        ref={wordInputRef}
                        accept=".docx"
                        onChange={handleWordImportUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}

                  {/* Style override to support default layouts in editor while allowing pasted inline formatting to be preserved */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    .blog-editor-content h1 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 28px; line-height: 1.3; margin-top: 24px; margin-bottom: 12px; }
                    .blog-editor-content h2 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 24px; line-height: 1.3; margin-top: 24px; margin-bottom: 12px; }
                    .blog-editor-content h3 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 20px; line-height: 1.4; margin-top: 20px; margin-bottom: 10px; }
                    .blog-editor-content h4 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 18px; line-height: 1.4; margin-top: 18px; margin-bottom: 8px; }
                    .blog-editor-content h5 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 16px; line-height: 1.4; margin-top: 16px; margin-bottom: 8px; }
                    .blog-editor-content h6 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px; line-height: 1.4; margin-top: 14px; margin-bottom: 6px; }

                    .blog-editor-content p {
                      color: #1a1a1a;
                      font-family: 'Poppins', sans-serif;
                      font-size: 16px;
                      line-height: 1.8;
                      margin-bottom: 15px;
                    }

                    .blog-editor-content ul {
                      list-style-type: disc !important;
                      padding-left: 20px !important;
                      margin-top: 15px !important;
                      margin-bottom: 25px !important;
                    }
                    .blog-editor-content ol {
                      list-style-type: decimal !important;
                      padding-left: 20px !important;
                      margin-top: 15px !important;
                      margin-bottom: 25px !important;
                    }
                    .blog-editor-content ul li {
                      list-style-type: disc !important;
                      margin-bottom: 10px;
                      font-family: 'Poppins', sans-serif;
                      font-size: 16px;
                      color: #4A4A4A;
                      line-height: 28px;
                    }
                    .blog-editor-content ol li {
                      list-style-type: decimal !important;
                      margin-bottom: 10px;
                      font-family: 'Poppins', sans-serif;
                      font-size: 16px;
                      color: #4A4A4A;
                      line-height: 28px;
                    }
                    .blog-editor-content i, .blog-editor-content em {
                      font-style: italic !important;
                    }
                  `}} />

                  {/* Content Editable Area or Plain Text Area depending on Mode */}
                  {!isHtmlMode ? (
                    <div
                      ref={editorRef}
                      contentEditable
                      className="blog-editor-content"
                      onInput={handleEditorInput}
                      onPaste={handleEditorPaste}
                      style={{
                        minHeight: '360px',
                        border: '1px solid #D0D5DD',
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '0px',
                        borderTopRightRadius: '0px',
                        padding: '20px',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        overflowY: 'auto',
                        fontSize: '15px',
                        lineHeight: '1.7',
                        color: '#344054',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Write your blog content here..."
                    />
                  ) : (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your raw HTML content here..."
                      rows={18}
                      style={{
                        width: '100%',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        fontFamily: 'monospace',
                        outline: 'none',
                        resize: 'vertical',
                        backgroundColor: '#F9FAFB',
                        color: '#101828'
                      }}
                    />
                  )}
                </div>
              </div>

              <div style={{
                flex: '1 1 300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                {/* Blog Status */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#101828', margin: 0 }}>
                    Blog Status
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                      <input 
                        type="radio" 
                        name="blogStatus" 
                        value="active" 
                        checked={status === 'active'} 
                        onChange={() => setStatus('active')} 
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      Active
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                      <input 
                        type="radio" 
                        name="blogStatus" 
                        value="inactive" 
                        checked={status === 'inactive'} 
                        onChange={() => setStatus('inactive')} 
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      Inactive
                    </label>
                  </div>
                </div>

                {/* Author details */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#101828', margin: '0 0 4px 0' }}>
                    Author Details
                  </h3>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. ProWIn"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                      Author Date
                    </label>
                    <input
                      type="text"
                      value={authorDate}
                      onChange={(e) => setAuthorDate(e.target.value)}
                      placeholder="e.g. 20th May 2026"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                      Author Profile Image
                    </label>
                    {authorAvatar ? (
                      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #EAECF0', marginBottom: '10px' }}>
                        <img src={getAssetUrl(authorAvatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setAuthorAvatar('')}
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'rgba(240, 68, 56, 0.9)',
                            color: '#ffffff',
                            border: 'none',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '12px',
                            lineHeight: '20px',
                            textAlign: 'center',
                            padding: 0
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => authorAvatarRef.current && authorAvatarRef.current.click()}
                        style={{
                          height: '80px',
                          width: '80px',
                          border: '2px dashed #D0D5DD',
                          borderRadius: '50%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          color: '#667085',
                          marginBottom: '10px'
                        }}
                      >
                        <i className="fi-rs-add" style={{ fontSize: '16px' }}></i>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={authorAvatarRef}
                      accept="image/*"
                      onChange={handleAuthorAvatarUpload}
                      style={{ display: 'none' }}
                    />
                    <input
                      type="text"
                      value={authorAvatar}
                      onChange={(e) => setAuthorAvatar(e.target.value)}
                      placeholder="Or paste profile image URL"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Tags Settings */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#101828', margin: 0 }}>
                    Tags
                  </h3>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                      Comma-separated Tags
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. groundnut oil, cold pressed, health"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Archives Selection */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#101828', margin: 0 }}>
                    Select Archives (Sidebar)
                  </h3>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Search archives by name, author, slug, category..."
                      value={archiveSearchQuery}
                      onChange={(e) => setArchiveSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #EAECF0',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {(() => {
                      const filteredArchives = blogs.filter(b => {
                        if (b.id === editingId) return false;
                        
                        const query = (archiveSearchQuery || '').trim().toLowerCase();
                        if (!query) return true;
                        
                        const titleMatch = (b.title || '').toLowerCase().includes(query);
                        const authorMatch = (b.authorName || '').toLowerCase().includes(query);
                        const slugMatch = (b.slug || '').toLowerCase().includes(query);
                        const categoryMatch = (b.category || '').toLowerCase().includes(query);
                        
                        return titleMatch || authorMatch || slugMatch || categoryMatch;
                      });
                      
                      return filteredArchives.length === 0 ? (
                        <span style={{ fontSize: '13px', color: '#667085' }}>No matching blog posts available</span>
                      ) : (
                        filteredArchives.map(b => {
                          const isChecked = (archiveBlogIds || '').split(',').map(s => s.trim()).includes(String(b.id));
                          return (
                            <label key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#344054', lineHeight: '1.4' }}>
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                style={{ width: '15px', height: '15px', marginTop: '2px', cursor: 'pointer' }}
                                onChange={(e) => {
                                  let idsArr = (archiveBlogIds || '').split(',').map(s => s.trim()).filter(Boolean);
                                  if (e.target.checked) {
                                    idsArr.push(String(b.id));
                                  } else {
                                    idsArr = idsArr.filter(idStr => idStr !== String(b.id));
                                  }
                                  setArchiveBlogIds(idsArr.join(','));
                                }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '500' }}>{b.title}</span>
                                <span style={{ fontSize: '11px', color: '#667085' }}>
                                  Slug: {b.slug} | Author: {b.authorName} | Cat: {b.category}
                                </span>
                              </div>
                            </label>
                          );
                        })
                      );
                    })()}
                  </div>
                </div>

                {/* Sidebar Promo Banner */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#101828', margin: 0 }}>
                    Sidebar Promo Banner
                  </h3>

                  {sidebarImage ? (
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #EAECF0' }}>
                      <img src={getAssetUrl(sidebarImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setSidebarImage('')}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(240, 68, 56, 0.9)',
                          color: '#ffffff',
                          border: 'none',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          lineHeight: '28px',
                          textAlign: 'center',
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => sidebarImageRef.current && sidebarImageRef.current.click()}
                      style={{
                        height: '160px',
                        border: '2px dashed #D0D5DD',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: '8px',
                        color: '#667085'
                      }}
                    >
                      <i className="fi-rs-add" style={{ fontSize: '20px' }}></i>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>Upload Sidebar Banner</span>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={sidebarImageRef}
                    accept="image/*"
                    onChange={handleSidebarImageUpload}
                    style={{ display: 'none' }}
                  />

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                      Or Banner Image URL
                    </label>
                    <input
                      type="text"
                      value={sidebarImage}
                      onChange={(e) => setSidebarImage(e.target.value)}
                      placeholder="Paste image URL directly"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                      Redirect URL Link
                    </label>
                    <input
                      type="text"
                      value={sidebarLink}
                      onChange={(e) => setSidebarLink(e.target.value)}
                      placeholder="e.g. /shop/sunflower-oil"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Featured image settings */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#101828', margin: 0 }}>
                    Featured Image (Card)
                  </h3>

                  {image ? (
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #EAECF0' }}>
                      <img src={getAssetUrl(image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(240, 68, 56, 0.9)',
                          color: '#ffffff',
                          border: 'none',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          lineHeight: '28px',
                          textAlign: 'center',
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => featuredImageRef.current && featuredImageRef.current.click()}
                      style={{
                        height: '160px',
                        border: '2px dashed #D0D5DD',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: '8px',
                        color: '#667085'
                      }}
                    >
                      <i className="fi-rs-add" style={{ fontSize: '20px' }}></i>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>Upload Card Image</span>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={featuredImageRef}
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    style={{ display: 'none' }}
                  />

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                      Or Image URL
                    </label>
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Paste image URL directly"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Hero section banner image settings */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#101828', margin: 0 }}>
                    Hero Image (Banner)
                  </h3>

                  {bannerImage ? (
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #EAECF0' }}>
                      <img src={getAssetUrl(bannerImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setBannerImage('')}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(240, 68, 56, 0.9)',
                          color: '#ffffff',
                          border: 'none',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          lineHeight: '28px',
                          textAlign: 'center',
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerImageRef.current && bannerImageRef.current.click()}
                      style={{
                        height: '160px',
                        border: '2px dashed #D0D5DD',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: '8px',
                        color: '#667085'
                      }}
                    >
                      <i className="fi-rs-add" style={{ fontSize: '20px' }}></i>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>Upload Banner Image</span>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={bannerImageRef}
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    style={{ display: 'none' }}
                  />

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#344054' }}>
                      Or Banner Image URL
                    </label>
                    <input
                      type="text"
                      value={bannerImage}
                      onChange={(e) => setBannerImage(e.target.value)}
                      placeholder="Paste banner image URL directly"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              borderTop: '1px solid #EAECF0',
              paddingTop: '24px',
              marginBottom: '40px'
            }}>
              <button
                type="button"
                onClick={() => { setActiveTab('list'); resetForm(); }}
                style={{
                  height: '46px',
                  padding: '0 20px',
                  borderRadius: '8px',
                  border: '1px solid #D0D5DD',
                  backgroundColor: '#ffffff',
                  color: '#344054',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  height: '46px',
                  padding: '0 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0A6738',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {activeTab === 'edit' ? 'Save Changes' : 'Publish Blog'}
              </button>
            </div>
          </form>
        )}

        {/* SEO Settings View */}
        {activeTab === 'seo' && (
          seoView === 'list' ? (
            /* Manage SEO List View */
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Header and Add Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#101828', margin: 0 }}>
                  Manage SEO Settings
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSeoPage('home');
                    setSeoTitle('');
                    setSeoDesc('');
                    setSeoKeywords('');
                    setSeoOgImage('');
                    setIsConfiguringSpecificBlog(false);
                    setIsConfiguringSpecificProduct(false);
                    setIsEditingSeo(false);
                    setSeoView('form');
                  }}
                  style={{
                    backgroundColor: '#0A6738',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 2px rgba(10, 103, 56, 0.05)',
                    transition: 'background-color 0.2s'
                  }}
                >
                  + Configure Page SEO
                </button>
              </div>

              {/* Filters Panel */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #EAECF0',
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                marginBottom: '24px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Search Input */}
                  <div style={{ flex: '1 1 250px', position: 'relative' }}>
                    <input 
                      type="text"
                      placeholder="Search by page name, title, keywords..."
                      value={seoSearch}
                      onChange={(e) => setSeoSearch(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 16px 0 40px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                    <i className="fi-rs-search" style={{ position: 'absolute', left: '14px', top: '12px', color: '#667085', fontSize: '16px' }}></i>
                  </div>

                  {/* Filter Dropdown */}
                  <div style={{ width: '180px' }}>
                    <select
                      value={seoTypeFilter}
                      onChange={(e) => {
                        setSeoPageNum(1);
                        setSeoTypeFilter(e.target.value);
                      }}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">All Page Types</option>
                      <option value="static">Static Pages</option>
                      <option value="blog">Blog Posts</option>
                      <option value="product">Product Pages</option>
                    </select>
                  </div>

                  {/* Date Range Inputs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#475467' }}>Modified Date:</span>
                    <input
                      type="date"
                      value={seoStartDate}
                      onChange={(e) => {
                        setSeoPageNum(1);
                        setSeoStartDate(e.target.value);
                      }}
                      style={{
                        height: '40px',
                        padding: '0 10px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#344054'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#667085' }}>to</span>
                    <input
                      type="date"
                      value={seoEndDate}
                      onChange={(e) => {
                        setSeoPageNum(1);
                        setSeoEndDate(e.target.value);
                      }}
                      style={{
                        height: '40px',
                        padding: '0 10px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#344054'
                      }}
                    />
                    {(seoStartDate || seoEndDate) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSeoStartDate('');
                          setSeoEndDate('');
                          setSeoPageNum(1);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #D0D5DD',
                          backgroundColor: '#F9FAFB',
                          color: '#344054',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Clear Dates
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table List */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #EAECF0',
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #EAECF0' }}>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#475467', textTransform: 'uppercase' }}>Page Route</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#475467', textTransform: 'uppercase' }}>Type</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#475467', textTransform: 'uppercase' }}>Meta Title</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#475467', textTransform: 'uppercase' }}>Last Modified</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#475467', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seoListLoading ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#667085' }}>
                            Loading SEO configurations...
                          </td>
                        </tr>
                      ) : seoList.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#667085' }}>
                            No custom SEO configurations found. Click "+ Configure Page SEO" to add one.
                          </td>
                        </tr>
                      ) : (
                        seoList.map((item, idx) => {
                          let friendlyName = item.page;
                          if (item.page === 'home') friendlyName = '/ (Home Page)';
                          else if (item.page === 'about') friendlyName = '/about-us (About)';
                          else if (item.page === 'contact') friendlyName = '/contact-us (Contact)';
                          else if (item.page === 'shop') friendlyName = '/shop (Shop)';
                          else if (item.page === 'blogs') friendlyName = '/blogs (Blogs List)';
                          else if (item.page === 'cart') friendlyName = '/cart (Cart)';
                          else if (item.page === 'checkout') friendlyName = '/checkout (Checkout)';
                          else if (item.page === 'wishlist') friendlyName = '/wishlist (Wishlist)';
                          else if (item.page.startsWith('blogs/')) friendlyName = `/blogs/${item.page.replace('blogs/', '')} (Blog Post)`;
                          else if (item.page.startsWith('product/')) friendlyName = `/product/${item.page.replace('product/', '')} (Product Page)`;

                          let badgeBg = '#F2F4F7';
                          let badgeColor = '#344054';
                          if (item.type === 'static') {
                            badgeBg = '#ECFDF3';
                            badgeColor = '#027A48';
                          } else if (item.type === 'blog') {
                            badgeBg = '#EFF8FF';
                            badgeColor = '#175CD3';
                          } else if (item.type === 'product') {
                            badgeBg = '#FFFAEB';
                            badgeColor = '#B54708';
                          }

                          return (
                            <tr key={item.page} style={{ borderBottom: idx < seoList.length - 1 ? '1px solid #EAECF0' : 'none' }}>
                              <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#101828' }}>
                                {friendlyName}
                              </td>
                              <td style={{ padding: '16px 24px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  backgroundColor: badgeBg,
                                  color: badgeColor,
                                  textTransform: 'capitalize'
                                }}>
                                  {item.type}
                                </span>
                              </td>
                              <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475467' }}>
                                {item.title ? (item.title.length > 45 ? `${item.title.substring(0, 45)}...` : item.title) : <em style={{ color: '#98A2B3' }}>None</em>}
                              </td>
                              <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475467' }}>
                                {new Date(item.updatedAt).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </td>
                              <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSeoPage(item.page);
                                      setIsEditingSeo(true);
                                      if (item.page.startsWith('blogs/')) {
                                        setIsConfiguringSpecificBlog(true);
                                      } else if (item.page.startsWith('product/')) {
                                        setIsConfiguringSpecificProduct(true);
                                      } else {
                                        setIsConfiguringSpecificBlog(false);
                                        setIsConfiguringSpecificProduct(false);
                                      }
                                      setSeoView('form');
                                    }}
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: '1px solid #D0D5DD',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      color: '#344054',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSeoDelete(item.page)}
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: '1px solid #FECDCA',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      color: '#D92D20',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                {seoTotalPages > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderTop: '1px solid #EAECF0',
                    backgroundColor: '#FDFDFD'
                  }}>
                    <span style={{ fontSize: '14px', color: '#475467' }}>
                      Showing Page <strong style={{ color: '#101828' }}>{seoPageNum}</strong> of <strong style={{ color: '#101828' }}>{seoTotalPages}</strong> ({seoTotalCount} total items)
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        disabled={seoPageNum === 1 || seoListLoading}
                        onClick={() => setSeoPageNum(prev => prev - 1)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #D0D5DD',
                          backgroundColor: seoPageNum === 1 ? '#F9FAFB' : '#ffffff',
                          color: seoPageNum === 1 ? '#8c95a5' : '#344054',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: seoPageNum === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={seoPageNum === seoTotalPages || seoListLoading}
                        onClick={() => setSeoPageNum(prev => prev + 1)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #D0D5DD',
                          backgroundColor: seoPageNum === seoTotalPages ? '#F9FAFB' : '#ffffff',
                          color: seoPageNum === seoTotalPages ? '#8c95a5' : '#344054',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: seoPageNum === seoTotalPages ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Configure SEO Form View */
            <form onSubmit={handleSeoSubmit} style={{
              backgroundColor: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #EAECF0',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '800px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EAECF0', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#101828', margin: 0 }}>
                  {isEditingSeo ? 'Edit SEO Settings' : 'Configure New Page SEO'}
                </h3>
                <button
                  type="button"
                  onClick={() => setSeoView('list')}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #D0D5DD',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#344054',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to List
                </button>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                  Select Website Page
                </label>
                
                {isEditingSeo ? (
                  /* Read-only field when editing to prevent key changing */
                  <input
                    type="text"
                    readOnly
                    value={
                      seoPage === 'home' ? '/ (Home Page)' :
                      seoPage === 'about' ? '/about-us (About)' :
                      seoPage === 'contact' ? '/contact-us (Contact)' :
                      seoPage === 'shop' ? '/shop (Shop)' :
                      seoPage === 'blogs' ? '/blogs (Blogs List)' :
                      seoPage === 'cart' ? '/cart (Cart)' :
                      seoPage === 'checkout' ? '/checkout (Checkout)' :
                      seoPage === 'wishlist' ? '/wishlist (Wishlist)' :
                      seoPage.startsWith('blogs/') ? `/blogs/${seoPage.replace('blogs/', '')} (Blog Post)` :
                      seoPage.startsWith('product/') ? `/product/${seoPage.replace('product/', '')} (Product Page)` :
                      seoPage
                    }
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 16px',
                      borderRadius: '8px',
                      border: '1px solid #D0D5DD',
                      boxSizing: 'border-box',
                      fontSize: '15px',
                      outline: 'none',
                      backgroundColor: '#F9FAFB',
                      color: '#475467',
                      cursor: 'not-allowed'
                    }}
                  />
                ) : (
                  /* Interactive dropdown/search selectors when creating */
                  (isConfiguringSpecificBlog || seoPage.startsWith('blogs/')) ? (
                    <div style={{
                      backgroundColor: '#F9FAFB',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #EAECF0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                          Configuring SEO for: <span style={{ color: '#0A6738' }}>{
                            seoPage.startsWith('blogs/') 
                              ? (blogs.find(b => `blogs/${b.slug || b.id}` === seoPage)?.title || 'Specific Blog')
                              : 'Please choose a blog below'
                          }</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSeoPage('blogs');
                            setIsConfiguringSpecificBlog(false);
                            setSeoBlogSearch('');
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #D0D5DD',
                            backgroundColor: '#ffffff',
                            color: '#344054',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Back to Blogs List Page
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Type to search blogs..."
                          value={seoBlogSearch}
                          onChange={(e) => setSeoBlogSearch(e.target.value)}
                          style={{
                            flex: 1,
                            height: '40px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            border: '1px solid #D0D5DD',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />

                        <select
                          value={seoPage.startsWith('blogs/') ? seoPage : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              setSeoPage(e.target.value);
                            }
                          }}
                          style={{
                            flex: 1,
                            height: '40px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            border: '1px solid #D0D5DD',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">-- Select Blog --</option>
                          {blogs && blogs
                            .filter(b => 
                              (b.title || '').toLowerCase().includes(seoBlogSearch.toLowerCase()) ||
                              (b.slug || '').toLowerCase().includes(seoBlogSearch.toLowerCase())
                            )
                            .map(b => (
                              <option key={b.id} value={`blogs/${b.slug || b.id}`}>
                                {b.title}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  ) : (isConfiguringSpecificProduct || seoPage.startsWith('product/')) ? (
                    <div style={{
                      backgroundColor: '#F9FAFB',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #EAECF0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                          Configuring SEO for: <span style={{ color: '#0A6738' }}>{
                            seoPage.startsWith('product/') 
                              ? (products.find(p => `product/${p.slug || p.id}` === seoPage)?.name || 'Specific Product')
                              : 'Please choose a product below'
                          }</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSeoPage('shop');
                            setIsConfiguringSpecificProduct(false);
                            setSeoProductSearch('');
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #D0D5DD',
                            backgroundColor: '#ffffff',
                            color: '#344054',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Back to Shop Page
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Type to search products..."
                          value={seoProductSearch}
                          onChange={(e) => setSeoProductSearch(e.target.value)}
                          style={{
                            flex: 1,
                            height: '40px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            border: '1px solid #D0D5DD',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />

                        <select
                          value={seoPage.startsWith('product/') ? seoPage : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              setSeoPage(e.target.value);
                            }
                          }}
                          style={{
                            flex: 1,
                            height: '40px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            border: '1px solid #D0D5DD',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">-- Select Product --</option>
                          {products && products
                            .filter(p => 
                              (p.name || '').toLowerCase().includes(seoProductSearch.toLowerCase()) ||
                              (p.slug || '').toLowerCase().includes(seoProductSearch.toLowerCase())
                            )
                            .map(p => (
                              <option key={p.id} value={`product/${p.slug || p.id}`}>
                                {p.name}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <select
                        value={seoPage}
                        onChange={(e) => {
                          setSeoPage(e.target.value);
                          setIsConfiguringSpecificBlog(false);
                          setIsConfiguringSpecificProduct(false);
                        }}
                        style={{
                          width: '100%',
                          height: '46px',
                          padding: '0 16px',
                          borderRadius: '8px',
                          border: '1px solid #D0D5DD',
                          fontSize: '15px',
                          outline: 'none',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="home">Home Page (/)</option>
                        <option value="about">About Us (/about-us)</option>
                        <option value="contact">Contact Us (/contact-us)</option>
                        <option value="shop">Shop (/shop)</option>
                        <option value="blogs">Blogs List (/blogs)</option>
                        <option value="cart">Cart Page (/cart)</option>
                        <option value="checkout">Checkout (/checkout)</option>
                        <option value="wishlist">Wishlist (/wishlist)</option>
                      </select>

                      {seoPage === 'blogs' && (
                        <button
                          type="button"
                          onClick={() => setIsConfiguringSpecificBlog(true)}
                          style={{
                            alignSelf: 'flex-start',
                            height: '38px',
                            padding: '0 16px',
                            borderRadius: '8px',
                            border: '1px solid #0A6738',
                            backgroundColor: '#ffffff',
                            color: '#0A6738',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#0A6738';
                            e.target.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.color = '#0A6738';
                          }}
                        >
                          Configure SEO for a Specific Blog Post
                        </button>
                      )}

                      {seoPage === 'shop' && (
                        <button
                          type="button"
                          onClick={() => setIsConfiguringSpecificProduct(true)}
                          style={{
                            alignSelf: 'flex-start',
                            height: '38px',
                            padding: '0 16px',
                            borderRadius: '8px',
                            border: '1px solid #0A6738',
                            backgroundColor: '#ffffff',
                            color: '#0A6738',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#0A6738';
                            e.target.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.color = '#0A6738';
                          }}
                        >
                          Configure SEO for a Specific Product Page
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>

              {seoLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#667085', fontSize: '14px' }}>Loading SEO settings for this page...</p>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Enter SEO title tag"
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                      Meta Description
                    </label>
                    <textarea
                      value={seoDesc}
                      onChange={(e) => setSeoDesc(e.target.value)}
                      placeholder="Enter meta description for search results..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '15px',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="e.g. organic oils, groundnut oil, yogis farms (comma separated)"
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                      Open Graph Image URL (og:image)
                    </label>
                    <input
                      type="text"
                      value={seoOgImage}
                      onChange={(e) => setSeoOgImage(e.target.value)}
                      placeholder="e.g. https://example.com/image.jpg (absolute URL recommended)"
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        border: '1px solid #D0D5DD',
                        boxSizing: 'border-box',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #EAECF0', paddingTop: '20px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSeoView('list')}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #D0D5DD',
                        color: '#344054',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#0A6738',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 32px',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      Save SEO Settings
                    </button>
                  </div>
                </>
              )}
            </form>
          )
        )}
      </main>
    </div>
  );
};

export default BlogAdminDashboard;
