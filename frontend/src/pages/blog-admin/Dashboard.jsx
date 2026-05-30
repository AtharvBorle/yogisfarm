import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

const BlogAdminDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'edit'
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Healthy Oils');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [authorName, setAuthorName] = useState('ProWIn');
  const [authorDate, setAuthorDate] = useState('');
  
  // Editor State
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const featuredImageRef = useRef(null);
  const navigate = useNavigate();

  const categories = [
    'Healthy Oils',
    'Nutrition',
    'Lifestyle',
    'Cooking',
    'Agriculture',
    'Recipes',
    'Health'
  ];

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
      const res = await api.get('/blogs');
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

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Sync editor content editable value when editing starts or changes
  useEffect(() => {
    if ((activeTab === 'create' || activeTab === 'edit') && editorRef.current && !isHtmlMode) {
      editorRef.current.innerHTML = content;
    }
  }, [activeTab, content, isHtmlMode]);

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

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setCategory('Healthy Oils');
    setDescription('');
    setContent('');
    setImage('');
    setAuthorName('ProWIn');
    setAuthorDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
    setIsHtmlMode(false);
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
    setAuthorName(blog.authorName || 'ProWIn');
    setAuthorDate(blog.authorDate || '');
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
      authorName,
      authorDate
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
            </h1>
            <p style={{ color: '#667085', margin: 0, fontSize: '14px' }}>
              {activeTab === 'list' && 'Manage your live posts, view counts, and update blogs.'}
              {activeTab === 'create' && 'Publish a new dynamic blog post with rich HTML elements.'}
              {activeTab === 'edit' && 'Modify the properties, layout, or content of an existing post.'}
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
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <img src="/assets/imgs/theme/loader.gif" alt="Loading..." style={{ width: '60px' }} />
                <p style={{ color: '#667085', marginTop: '15px' }}>Loading blogs list...</p>
              </div>
            ) : blogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#344054', marginBottom: '8px' }}>No blog posts yet</h3>
                <p style={{ color: '#667085', fontSize: '14px', marginBottom: '24px' }}>Click the button below to add your first dynamic blog post.</p>
                <button
                  onClick={() => { setActiveTab('create'); resetForm(); }}
                  style={{
                    backgroundColor: '#0A6738',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Create Your First Blog
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #EAECF0' }}>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase' }}>Blog Details</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase' }}>Author / Date</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase' }}>Slug</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#667085', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog) => (
                      <tr key={blog.id} style={{ borderBottom: '1px solid #EAECF0', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img
                              src={blog.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
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
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
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
                      gap: '4px',
                      backgroundColor: '#F2F4F7',
                      padding: '6px',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      border: '1px solid #D0D5DD',
                      borderBottom: 'none',
                      flexWrap: 'wrap'
                    }}>
                      <button type="button" onClick={() => execEditorCommand('bold')} title="Bold" style={{ width: '32px', height: '32px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>B</button>
                      <button type="button" onClick={() => execEditorCommand('italic')} title="Italic" style={{ width: '32px', height: '32px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>I</button>
                      <button type="button" onClick={() => execEditorCommand('underline')} title="Underline" style={{ width: '32px', height: '32px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'underline', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>U</button>
                      
                      <div style={{ width: '1px', backgroundColor: '#D0D5DD', margin: '4px 6px' }}></div>

                      <button type="button" onClick={() => execEditorCommand('formatBlock', '<h3>')} title="Heading 3" style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>H3</button>
                      <button type="button" onClick={() => execEditorCommand('formatBlock', '<h4>')} title="Heading 4" style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>H4</button>
                      <button type="button" onClick={() => execEditorCommand('formatBlock', '<p>')} title="Paragraph" style={{ height: '32px', padding: '0 8px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#EAECF0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>P</button>

                      <div style={{ width: '1px', backgroundColor: '#D0D5DD', margin: '4px 6px' }}></div>

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

              {/* Sidebar Settings Column */}
              <div style={{
                flex: '1 1 300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                {/* Meta details */}
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
                    Publishing Meta
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
                    Featured Image
                  </h3>

                  {image ? (
                    <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #EAECF0' }}>
                      <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>Upload image</span>
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
      </main>
    </div>
  );
};

export default BlogAdminDashboard;
