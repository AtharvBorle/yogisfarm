import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import useSEO from '../hooks/useSEO';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [blogsList, setBlogsList] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Call useSEO dynamically with blog details
  useSEO({
    key: blog ? `blogs/${blog.slug || blog.id}` : null,
    title: blog ? blog.title : 'Blog Details',
    description: blog ? blog.description : '',
    keywords: blog ? blog.tags : ''
  });

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        const listRes = await api.get('/blogs');
        let list = [];
        if (listRes.data.status && listRes.data.blogs) {
          list = listRes.data.blogs.map(post => ({
            id: post.id,
            category: post.category,
            title: post.title,
            slug: post.slug,
            description: post.description,
            image: post.image ? getAssetUrl(post.image) : "",
            bannerImage: post.bannerImage ? getAssetUrl(post.bannerImage) : null,
            content: post.content,
            tags: post.tags || "",
            archiveBlogIds: post.archiveBlogIds || "",
            sidebarImage: post.sidebarImage ? getAssetUrl(post.sidebarImage) : null,
            sidebarLink: post.sidebarLink || "",
            author: {
              name: post.authorName || "ProWIn",
              date: post.authorDate || "20th May 2026",
              avatar: getAssetUrl(post.authorAvatar || "assets/imgs/feedback_avatar.svg")
            }
          }));
          setBlogsList(list);
        }

        const res = await api.get(`/blogs/${id}?admin=true`);
        if (res.data.status && res.data.blog) {
          const post = res.data.blog;
          const currentBlog = {
            id: post.id,
            category: post.category,
            title: post.title,
            slug: post.slug,
            description: post.description,
            image: post.image ? getAssetUrl(post.image) : "",
            bannerImage: post.bannerImage ? getAssetUrl(post.bannerImage) : null,
            content: post.content,
            tags: post.tags || "",
            archiveBlogIds: post.archiveBlogIds || "",
            archivedBlogs: post.archivedBlogs || [],
            sidebarImage: post.sidebarImage ? getAssetUrl(post.sidebarImage) : null,
            sidebarLink: post.sidebarLink || "",
            author: {
              name: post.authorName || "ProWIn",
              date: post.authorDate || "20th May 2026",
              avatar: getAssetUrl(post.authorAvatar || "assets/imgs/feedback_avatar.svg")
            }
          };
          setBlog(currentBlog);

          // Related blogs matching logic:
          // 1. Filter out current blog
          let matches = list.filter(b => b.id !== currentBlog.id);

          // 2. Parse tags of current blog
          const currentTags = currentBlog.tags
            ? currentBlog.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
            : [];

          // 3. Find posts with overlapping tags
          let matchingBlogs = [];
          if (currentTags.length > 0) {
            matchingBlogs = matches.filter(b => {
              const bTags = b.tags ? b.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
              return currentTags.some(t => bTags.includes(t));
            });
          }

          // 4. Fall back to same category if no overlapping tags found
          if (matchingBlogs.length === 0) {
            matchingBlogs = matches.filter(b => 
              b.category && currentBlog.category &&
              b.category.trim().toLowerCase() === currentBlog.category.trim().toLowerCase()
            );
          }

          setRelatedBlogs(matchingBlogs.slice(0, 3));
        } else {
          setBlog(null);
        }
      } catch (err) {
        console.error('Failed to load blog details:', err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    loadBlogData();
  }, [id, navigate]);

  if (loading || !blog) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <img src="/assets/imgs/theme/loader.gif" alt="Loading Blog..." style={{ width: '150px' }} />
      </div>
    );
  }

  // Parse selected archives for the sidebar.
  // If the admin explicitly selected archives, use the resolved archives list from the database.
  // Otherwise, fallback to showing all active blogs (blogsList).
  const archiveIds = blog.archiveBlogIds
    ? blog.archiveBlogIds.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const archivedBlogs = archiveIds.length > 0
    ? (blog.archivedBlogs || [])
    : blogsList;

  return (
    <main className="main pages" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Hero Banner Section with Overlay Breadcrumbs */}
      {blog.bannerImage || blog.image ? (
        <div style={{
          width: '100%',
          height: '350px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '30px'
        }}>
          {/* Background Image - Cover/Stretched */}
          <img 
            src={blog.bannerImage || blog.image} 
            alt={blog.title} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' // Stretches/expands to fill the 350px height
            }} 
          />

          {/* Breadcrumbs Overlaid on Top of the Image */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '8%',
            zIndex: 10,
            color: '#000000',
            fontSize: '13px',
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '0.5px',
            fontWeight: '400',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textShadow: '1px 1px 3px rgba(255, 255, 255, 0.8)'
          }}>
            <Link to="/" style={{ color: '#000000', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ACD140'} onMouseLeave={(e) => e.target.style.color = '#000000'}>
              <i className="fi-rs-home" style={{ fontSize: '11px', marginRight: '6px' }}></i>
              Home
            </Link>
            <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>&gt;</span>
            <Link to="/blogs" style={{ color: '#000000', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ACD140'} onMouseLeave={(e) => e.target.style.color = '#000000'}>Page</Link>
            <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>&gt;</span>
            <span style={{ color: 'rgba(0, 0, 0, 0.7)' }}>Blogs</span>
          </div>
        </div>
      ) : (
        /* Fallback Standard Breadcrumbs if no image exists */
        <div className="page-header breadcrumb-wrap" style={{ margin: '0', borderBottom: '1px solid #F2F4F7', zIndex: 2, position: 'relative' }}>
          <div className="container">
            <div className="breadcrumb" style={{ fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}>
              <Link to="/" rel="nofollow"><i className="fi-rs-home mr-5"></i>Home</Link>
              <span></span> <Link to="/blogs">Blog</Link>
              <span></span> {blog.title}
            </div>
          </div>
        </div>
      )}


      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px', paddingLeft: '60px', paddingRight: '60px' }}>
        {/* Main Columns Layout */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '40px',
          flexWrap: 'wrap'
        }}>
          
          {/* LEFT COLUMN: Sidebar (Archives) - 22% on desktop */}
          <aside style={{
            flex: '1 1 250px',
            maxWidth: '300px',
            minWidth: '220px'
          }}>
            {archivedBlogs.length > 0 && (
              <>
                <h4 style={{
                  fontSize: '18px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: '#000000',
                  margin: '0 0 10px 0',
                  letterSpacing: '0.5px'
                }}>
                  Archives
                </h4>
                <div style={{
                  backgroundColor: '#ACD140',
                  height: '2px',
                  width: '100%',
                  marginBottom: '20px'
                }} />

                <ul style={{
                  listStyleType: 'none',
                  padding: 0,
                  margin: '0 0 40px 0'
                }}>
                  {archivedBlogs.map(post => {
                    const isActive = post.id === blog.id;
                    return (
                      <li 
                        key={post.id} 
                        style={{ 
                          marginBottom: '14px',
                          fontSize: '14px',
                          fontFamily: 'Poppins, sans-serif',
                          lineHeight: '1.4',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px'
                        }}
                      >
                        <span style={{ color: '#60D669', fontSize: '16px', lineHeight: '20px', userSelect: 'none' }}>•</span>
                        <Link
                          to={`/blogs/${post.slug || post.id}`}
                          style={{
                            color: isActive ? '#0A6738' : '#4A4A4A',
                            fontWeight: isActive ? '700' : '450',
                            textDecoration: 'none',
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) e.target.style.color = '#0A6738';
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.target.style.color = '#4A4A4A';
                          }}
                        >
                          {post.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {/* Sidebar Promo Banner Image */}
            {blog.sidebarImage && (
              <div style={{
                marginTop: '30px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
                border: '1px solid #F0F0F0',
                padding: '10px',
                backgroundColor: '#FDFDFD',
                display: 'flex',
                justifyContent: 'center'
              }}>
                {blog.sidebarLink ? (
                  <a href={blog.sidebarLink} target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
                    <img 
                      src={blog.sidebarImage} 
                      alt="Promo Banner" 
                      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} 
                    />
                  </a>
                ) : (
                  <img 
                    src={blog.sidebarImage} 
                    alt="Promo Banner" 
                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} 
                  />
                )}
              </div>
            )}

          </aside>

          {/* RIGHT COLUMN: Blog Content - 78% on desktop */}
          <article style={{
            flex: '3 1 600px',
            minWidth: '320px'
          }}>
            {/* Title */}
            <h1 style={{
              color: '#0A6738',
              fontSize: '32px',
              fontWeight: '700',
              lineHeight: '1.2',
              margin: '0 0 15px 0',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {blog.title}
            </h1>

            {/* Author Details Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '30px',
              paddingBottom: '15px',
              borderBottom: '1px solid #ECEEEF'
            }}>
              <img 
                src={blog.author.avatar} 
                alt={blog.author.name} 
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0A6738' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0A6738', fontFamily: 'Poppins, sans-serif' }}>
                  {blog.author.name}
                </span>
                <span style={{ fontSize: '12px', color: '#7E7E7E', fontFamily: 'Poppins, sans-serif' }}>
                  Published On - {blog.author.date}
                </span>
              </div>
            </div>

            {/* Style override to support default layouts while allowing pasted inline formatting to be preserved */}
            <style dangerouslySetInnerHTML={{ __html: `
              .blog-content-body h1 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 28px; line-height: 1.3; margin-top: 24px; margin-bottom: 12px; }
              .blog-content-body h2 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 24px; line-height: 1.3; margin-top: 24px; margin-bottom: 12px; }
              .blog-content-body h3 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 20px; line-height: 1.4; margin-top: 20px; margin-bottom: 10px; }
              .blog-content-body h4 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 18px; line-height: 1.4; margin-top: 18px; margin-bottom: 8px; }
              .blog-content-body h5 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 16px; line-height: 1.4; margin-top: 16px; margin-bottom: 8px; }
              .blog-content-body h6 { color: #1a1a1a; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 14px; line-height: 1.4; margin-top: 14px; margin-bottom: 6px; }

              .blog-content-body p {
                color: #1a1a1a;
                font-family: 'Poppins', sans-serif;
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 15px;
              }

              .blog-content-body ul {
                list-style-type: disc !important;
                padding-left: 20px !important;
                margin-top: 15px !important;
                margin-bottom: 25px !important;
              }
              .blog-content-body ol {
                list-style-type: decimal !important;
                padding-left: 20px !important;
                margin-top: 15px !important;
                margin-bottom: 25px !important;
              }
              .blog-content-body ul li {
                list-style-type: disc !important;
                margin-bottom: 10px;
                font-family: 'Poppins', sans-serif;
                font-size: 16px;
                color: #4A4A4A;
                line-height: 28px;
              }
              .blog-content-body ol li {
                list-style-type: decimal !important;
                margin-bottom: 10px;
                font-family: 'Poppins', sans-serif;
                font-size: 16px;
                color: #4A4A4A;
                line-height: 28px;
              }
            `}} />

            {/* HTML Body Content */}
            <div 
              className="blog-content-body"
              style={{
                fontFamily: 'Poppins, sans-serif',
                color: '#4A4A4A',
                fontSize: '16px',
                lineHeight: '1.8'
              }}
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />


            {/* Related Blogs Section */}
            {relatedBlogs.length > 0 && (
              <div style={{ marginTop: '60px', borderTop: '1px solid #ECEEEF', paddingTop: '40px' }}>
                <h3 style={{
                  color: '#000000',
                  fontSize: '24px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  marginBottom: '30px'
                }}>
                  Related Blogs
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '24px',
                  marginBottom: '30px'
                }}>
                  {relatedBlogs.map(related => (
                    <div
                      key={related.id}
                      onClick={() => navigate(`/blogs/${related.slug || related.id}`)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #F2F4F7',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 9px 12px -3px rgba(16, 24, 40, 0.08), 0 3px 4px -1px rgba(16, 24, 40, 0.03)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 20px -3px rgba(16, 24, 40, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 9px 12px -3px rgba(16, 24, 40, 0.08)';
                      }}
                    >
                      {/* Related Image */}
                      <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
                        <img 
                          src={related.image} 
                          alt={related.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>

                      {/* Related Content */}
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ 
                          color: '#40B14C', 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          marginBottom: '8px',
                          fontFamily: 'Inter, sans-serif'
                        }}>
                          {related.category}
                        </span>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: '#101828', 
                            lineHeight: '1.4', 
                            margin: 0,
                            fontFamily: 'Inter, sans-serif'
                          }}>
                            {related.title}
                          </h4>
                          <svg 
                            style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '3px' }} 
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
                          fontSize: '12px', 
                          lineHeight: '1.5', 
                          fontFamily: 'Inter, sans-serif',
                          margin: '0 0 20px 0',
                          flex: 1
                        }}>
                          {related.description && related.description.length > 80 ? `${related.description.substring(0, 80)}...` : related.description}
                        </p>

                        {/* Related Author */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                          <img 
                            src={related.author.avatar} 
                            alt={related.author.name} 
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '11px', fontWeight: '500', color: '#101828', fontFamily: 'Inter, sans-serif' }}>
                              {related.author.name}
                            </span>
                            <span style={{ fontSize: '10px', color: '#667085', fontFamily: 'Inter, sans-serif' }}>
                              {related.author.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slider Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: idx === activeSlide ? '#0A6738' : '#D9D9D9',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'background-color 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

          </article>
          
        </div>
      </div>
    </main>
  );
};

export default BlogDetails;
