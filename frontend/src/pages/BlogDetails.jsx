import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import img26 from '../assets/figma/img_26.png';
import img11 from '../assets/figma/img_11.png';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [blogsList, setBlogsList] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

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
            author: {
              name: post.authorName || "ProWIn",
              date: post.authorDate || "20th May 2026",
              avatar: "/assets/imgs/theme/avatar.png"
            }
          }));
          setBlogsList(list);
        }

        const res = await api.get(`/blogs/${id}`);
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
            author: {
              name: post.authorName || "ProWIn",
              date: post.authorDate || "20th May 2026",
              avatar: "/assets/imgs/theme/avatar.png"
            }
          };
          setBlog(currentBlog);

          const filtered = list.filter(b => 
            b.category && currentBlog.category &&
            b.category.trim().toLowerCase() === currentBlog.category.trim().toLowerCase() && 
            b.id !== currentBlog.id
          );
          setRelatedBlogs(filtered.slice(0, 3));
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


  return (
    <main className="main pages" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Top Hero Banner Section */}
      <div style={{
        backgroundImage: `linear-gradient(rgba(10, 103, 56, 0.65), rgba(10, 103, 56, 0.65)), url(${blog.bannerImage || blog.image || ''})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '180px',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '20px',
        paddingLeft: '8%',
        position: 'relative',
        marginBottom: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          color: '#ffffff',
          fontSize: '13px',
          fontFamily: 'Poppins, sans-serif',
          textTransform: 'lowercase',
          letterSpacing: '0.5px',
          fontWeight: '400',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Link to="/" style={{ color: '#ffffff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ACD140'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
            <i className="fi-rs-home" style={{ fontSize: '11px', marginRight: '6px' }}></i>
            home
          </Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>&gt;</span>
          <Link to="/blogs" style={{ color: '#ffffff', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ACD140'} onMouseLeave={(e) => e.target.style.color = '#ffffff'}>page</Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>&gt;</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>blogs</span>
        </div>
      </div>


      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
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
              {blogsList.map(post => {
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

            {/* Sunflower Oil Product Banner Image in Sidebar */}
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
              <img 
                src={img11} 
                alt="Lakdi Ghana Sunflower Oil" 
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px', maxWidth: '200px' }} 
              />
            </div>

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

            {/* Meta row */}
            <div style={{
              fontSize: '12px',
              fontWeight: '400',
              color: '#7E7E7E',
              marginBottom: '30px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              By <span style={{ fontWeight: '600', color: '#0A6738' }}>{blog.author.name}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;Last Updated On - {blog.author.date}
            </div>

            {/* Style override to force HTML bullet points to show since reset CSS overrides it */}
            <style dangerouslySetInnerHTML={{ __html: `
              .blog-content-body ul {
                list-style-type: disc !important;
                padding-left: 20px !important;
                margin-top: 15px !important;
                margin-bottom: 25px !important;
              }
              .blog-content-body li {
                list-style-type: disc !important;
                margin-bottom: 10px !important;
                font-family: 'Poppins', sans-serif !important;
                font-size: 16px !important;
                color: #4A4A4A !important;
                line-height: 28px !important;
              }
              .blog-content-body h3, .blog-content-body h4 {
                font-family: 'Poppins', sans-serif !important;
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
                        {related.description.length > 80 ? `${related.description.substring(0, 80)}...` : related.description}
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

          </article>
          
        </div>
      </div>
    </main>
  );
};

export default BlogDetails;
