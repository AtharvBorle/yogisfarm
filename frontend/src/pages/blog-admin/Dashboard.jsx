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
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoBlogSearch, setSeoBlogSearch] = useState('');
  const [isConfiguringSpecificBlog, setIsConfiguringSpecificBlog] = useState(false);
  
  // Product SEO States
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [seoProductSearch, setSeoProductSearch] = useState('');
  const [isConfiguringSpecificProduct, setIsConfiguringSpecificProduct] = useState(false);
  
  // Editor State
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
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

    const payload = {
      title,
      slug,
      category,
      description,
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
  const fetchSeoSettings = async (page) => {
    setSeoLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.status && res.data.settings) {
        const settings = res.data.settings;
        setSeoTitle(settings[`seo_${page}_title`] || '');
        setSeoDesc(settings[`seo_${page}_description`] || '');
        setSeoKeywords(settings[`seo_${page}_keywords`] || '');
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
          [`seo_${seoPage}_keywords`]: seoKeywords
        }
      };
      const res = await api.put('/settings', payload);
      if (res.data.status) {
        toast.success('SEO settings saved successfully!');
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

  useEffect(() => {
    if (activeTab === 'seo') {
      fetchSeoSettings(seoPage);
      if (products.length === 0) {
        fetchProducts();
      }
    }
  }, [activeTab, seoPage]);

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
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '0.5px' }}>Yogi's Farms</h2>
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
                    onChange={(e) => setDescription(e.target.value)}
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
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor="htmlMode" style={{ fontSize: '12px', fontWeight: '600', color: '#667085', cursor: 'pointer' }}>
                        View HTML Source Code
                      </label>
                    </div>
                  </div>

                  {/* WYSIWYG Editor Toolbar */}
                  {!isHtmlMode && (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      backgroundColor: '#F2F4F7',
                      padding: '8px',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      border: '1px solid #D0D5DD',
                      borderBottom: 'none',
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}>
                      {/* Basic styles */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button type="button" onClick={() => execEditorCommand('bold')} title="Bold" style={{ width: '32px', height: '32px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>B</button>
                        <button type="button" onClick={() => execEditorCommand('italic')} title="Italic" style={{ width: '32px', height: '32px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>I</button>
                        <button type="button" onClick={() => execEditorCommand('underline')} title="Underline" style={{ width: '32px', height: '32px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'underline', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>U</button>
                      </div>

                      <div style={{ width: '1px', backgroundColor: '#D0D5DD', height: '24px' }}></div>

                      {/* Font Family & Size & Color */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select 
                          onChange={(e) => execEditorCommand('fontName', e.target.value)}
                          defaultValue="Poppins"
                          style={{ height: '32px', padding: '0 8px', borderRadius: '4px', border: '1px solid #D0D5DD', fontSize: '13px', backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none' }}
                          title="Font Family"
                        >
                          <option value="Poppins">Poppins</option>
                          <option value="Inter">Inter</option>
                          <option value="Arial">Arial</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Times New Roman">Times New Roman</option>
                        </select>

                        <select 
                          onChange={(e) => execEditorCommand('fontSize', e.target.value)}
                          defaultValue="3"
                          style={{ height: '32px', padding: '0 8px', borderRadius: '4px', border: '1px solid #D0D5DD', fontSize: '13px', backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none' }}
                          title="Font Size"
                        >
                          <option value="1">Smallest</option>
                          <option value="2">Small</option>
                          <option value="3">Normal</option>
                          <option value="4">Large</option>
                          <option value="5">Larger</option>
                          <option value="6">Very Large</option>
                          <option value="7">Largest</option>
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#667085' }}>Color:</span>
                          <input 
                            type="color" 
                            onChange={(e) => execEditorCommand('foreColor', e.target.value)}
                            style={{ width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                            title="Text Color"
                          />
                        </div>
                      </div>

                      <div style={{ width: '1px', backgroundColor: '#D0D5DD', height: '24px' }}></div>

                      {/* Headings */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button type="button" onClick={() => execEditorCommand('formatBlock', '<h3>')} title="Heading 3" style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>H3</button>
                        <button type="button" onClick={() => execEditorCommand('formatBlock', '<h4>')} title="Heading 4" style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>H4</button>
                        <button type="button" onClick={() => execEditorCommand('formatBlock', '<p>')} title="Paragraph" style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>P</button>
                      </div>

                      <div style={{ width: '1px', backgroundColor: '#D0D5DD', height: '24px' }}></div>

                      {/* Alignments */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button type="button" onClick={() => execEditorCommand('justifyLeft')} title="Align Left" style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Left</button>
                        <button type="button" onClick={() => execEditorCommand('justifyCenter')} title="Align Center" style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Center</button>
                        <button type="button" onClick={() => execEditorCommand('justifyRight')} title="Align Right" style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Right</button>
                      </div>

                      <div style={{ width: '1px', backgroundColor: '#D0D5DD', height: '24px' }}></div>

                      {/* Rich inserts */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button type="button" onClick={() => execEditorCommand('insertUnorderedList')} title="Bullet List" style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>• List</button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt('Enter the link URL:');
                            if (url) execEditorCommand('createLink', url);
                          }}
                          title="Insert Link"
                          style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          Link
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                          title="Insert Image inside content"
                          style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A6738', fontWeight: 'bold' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          Insert Image
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleEditorImageUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}

                  {/* Content Editable Area or Plain Text Area depending on Mode */}
                  {!isHtmlMode ? (
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorInput}
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
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #EAECF0',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {blogs.filter(b => b.id !== editingId).length === 0 ? (
                      <span style={{ fontSize: '13px', color: '#667085' }}>No other blog posts available</span>
                    ) : (
                      blogs.filter(b => b.id !== editingId).map(b => {
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
                            {b.title}
                          </label>
                        );
                      })
                    )}
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
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#344054' }}>
                Select Website Page
              </label>
              
              {/* If configuring a specific blog */}
              {(isConfiguringSpecificBlog || seoPage.startsWith('blogs/')) ? (
                /* Specific blog configuration panel with search and select */
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
                    {/* Search Field */}
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

                    {/* Filtered Dropdown */}
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
                /* Specific product configuration panel with search and select */
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
                    {/* Search Field */}
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

                    {/* Filtered Dropdown */}
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
                /* Main Page Selection Dropdown */
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

                  {/* Give specific blog button only if the admin selects blogs list from the dropdown */}
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

                  {/* Give specific product button only if the admin selects shop from the dropdown */}
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
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
        )}
      </main>
    </div>
  );
};

export default BlogAdminDashboard;
