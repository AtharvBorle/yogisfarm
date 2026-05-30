import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BLOG_POSTS, CATEGORIES } from '../utils/blogData';
import api from '../api';

const Blogs = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsList, setBlogsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const postsPerPage = 9;

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const res = await api.get('/blogs');
        if (res.data.status && res.data.blogs) {
          const mapped = res.data.blogs.map(post => ({
            id: post.id,
            category: post.category,
            title: post.title,
            slug: post.slug,
            description: post.description,
            image: post.image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
            content: post.content,
            author: {
              name: post.authorName || "ProWIn",
              date: post.authorDate || "20th May 2026",
              avatar: "/assets/imgs/theme/avatar.png"
            }
          }));
          setBlogsList(mapped);
        } else {
          setBlogsList(BLOG_POSTS);
        }
      } catch (err) {
        console.error('Failed to fetch blogs, using static fallback:', err);
        setBlogsList(BLOG_POSTS);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  // Filter and Sort Logic
  const filteredPosts = blogsList.filter(post => {
    let matchesCategory = false;
    if (selectedCategory === "All") {
      matchesCategory = true;
    } else {
      matchesCategory = post.category === selectedCategory;
    }

    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "Newest") {
      return b.id - a.id;
    } else if (sortBy === "Oldest") {
      return a.id - b.id;
    } else if (sortBy === "Alphabetical") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = sortedPosts.slice(startIndex, startIndex + postsPerPage);

  // Reset page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);


  return (
    <main className="main pages" style={{ position: 'relative', overflowX: 'hidden', backgroundColor: '#FFFFFF' }}>
      
      {/* Decorative Angled stripes behind components to match Figma */}
      <div style={{
        position: 'absolute',
        width: '120%',
        height: '110px',
        background: 'linear-gradient(90deg, #F0FDD4 0%, #D8F593 100%)',
        transform: 'rotate(-4deg)',
        top: '420px',
        left: '-10%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '120%',
        height: '130px',
        background: 'linear-gradient(90deg, #D8F593 0%, #A2E23B 100%)',
        transform: 'rotate(-4deg)',
        top: '640px',
        left: '-5%',
        zIndex: 0,
        opacity: 0.8,
        pointerEvents: 'none'
      }} />

      {/* Breadcrumbs */}
      <div className="page-header breadcrumb-wrap" style={{ margin: '0', borderBottom: '1px solid #F2F4F7', zIndex: 2, position: 'relative' }}>
        <div className="container">
          <div className="breadcrumb" style={{ fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}>
            <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
            <span></span> Blog
          </div>
        </div>
      </div>

      {/* Header Banner Section */}
      <div style={{ padding: '50px 0 20px 0', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <h1 style={{ 
          color: '#0A6738', 
          fontFamily: 'Poppins, sans-serif', 
          fontWeight: '700', 
          fontSize: '48px', 
          margin: '0 0 24px 0',
          letterSpacing: '-1px'
        }}>
          Our Blogs
        </h1>

        {/* Centered Search Box */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            padding: '0px 16px',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            maxWidth: '350px',
            height: '50px',
            borderRadius: '8px',
            border: '1px solid #D0D5DD',
            background: '#FFFFFF',
            boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            <svg style={{ overflow: 'hidden', flexShrink: 0 }} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: '1 0 0',
                height: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: '#667085',
                fontFamily: 'Inter, Poppins, sans-serif',
                fontSize: '16px',
                fontWeight: '400',
                lineHeight: '24px',
                padding: 0
              }}
            />
          </div>
        </div>

        {/* Subtitle Description */}
        <p style={{ 
          color: '#667085', 
          fontSize: '15px', 
          fontFamily: 'Poppins, sans-serif', 
          fontWeight: '500', 
          maxWidth: '600px', 
          margin: '0 auto' 
        }}>
          The latest industry news, interviews, technologies, and resources.
        </p>
      </div>

      {/* Main Grid Content */}
      <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '20px 15px 60px 15px', position: 'relative', zIndex: 2 }}>
        
        {/* Filter / Category Selector Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '35px',
          borderBottom: '1px solid #F2F4F7',
          paddingBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(category => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    backgroundColor: isActive ? '#0A6738' : '#ffffff',
                    color: isActive ? '#ffffff' : '#344054',
                    border: isActive ? '1px solid #0A6738' : '1px solid #D0D5DD',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'Poppins, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)'
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              style={{
                backgroundColor: '#ffffff',
                color: '#344054',
                border: '1px solid #D0D5DD',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)'
              }}
            >
              {/* Sort Icon (3 horizontal bars) */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="16" y2="12"></line>
                <line x1="4" y1="18" x2="12" y2="18"></line>
              </svg>
              Sort By: {sortBy}
            </button>

            {/* Custom Sort Dropdown */}
            {isSortDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: '#ffffff',
                boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
                borderRadius: '8px',
                border: '1px solid #F2F4F7',
                marginTop: '6px',
                width: '160px',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                {['Newest', 'Oldest', 'Alphabetical'].map(option => (
                  <div
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setIsSortDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      fontSize: '14px',
                      color: sortBy === option ? '#0A6738' : '#344054',
                      cursor: 'pointer',
                      backgroundColor: sortBy === option ? '#F9FAFB' : '#ffffff',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: sortBy === option ? '600' : '400',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#F2F4F7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = sortBy === option ? '#F9FAFB' : '#ffffff'}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {paginatedPosts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #E5E7EB', borderRadius: '12px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#667085', fontFamily: 'Poppins, sans-serif', margin: '0 0 8px 0' }}>No articles found</h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Try adjusting your search criteria or choosing a different category.</p>
          </div>
        )}

        {/* Blog Post Cards Grid (3 Columns) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
          gap: '32px', 
          marginBottom: '50px' 
        }}>
          {paginatedPosts.map(post => (
            <article 
              key={post.id}
              onClick={() => navigate(`/blogs/${post.slug || post.id}`)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #F2F4F7',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0px 20px 24px -4px rgba(16, 24, 40, 0.12), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)';
              }}
            >
              {/* Blog Image */}
              <div style={{ width: '100%', height: '240px', overflow: 'hidden' }}>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              {/* Card Details */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ 
                  color: '#0A6738', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {post.category}
                </span>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#101828', 
                    lineHeight: '1.4', 
                    margin: 0,
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {post.title}
                  </h3>
                  {/* Up-Right Arrow Icon to match Figma */}
                  <svg 
                    style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '4px' }} 
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#101828"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </div>

                <p style={{ 
                  color: '#667085', 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  marginBottom: '24px',
                  fontFamily: 'Poppins, sans-serif',
                  flex: 1
                }}>
                  {post.description}
                </p>

                {/* Author Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.name} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#101828', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                      {post.author.name}
                    </h5>
                    <span style={{ fontSize: '14px', color: '#667085', fontFamily: 'Poppins, sans-serif' }}>
                      {post.author.date}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '50px' }}>
            {/* Prev button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                opacity: currentPage === 1 ? 0.35 : 1,
                cursor: currentPage === 1 ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '8px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>

            {/* Page Numbers */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: isCurrent ? 'rgba(10, 103, 56, 0.08)' : 'transparent',
                      border: 'none',
                      color: isCurrent ? '#0A6738' : '#667085',
                      fontSize: '14px',
                      fontWeight: isCurrent ? '700' : '500',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      transition: 'all 0.2s'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                opacity: currentPage === totalPages ? 0.35 : 1,
                cursor: currentPage === totalPages ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '8px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        )}

      </div>
    </main>
  );
};

export default Blogs;
