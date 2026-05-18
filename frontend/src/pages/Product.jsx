import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import SliderComponent from 'react-slick';
const Slider = SliderComponent.default ? SliderComponent.default : SliderComponent;
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import { 
    Heart, 
    ShoppingCart, 
    ShoppingBag, 
    Plus, 
    Minus, 
    Star, 
    Clock, 
    CheckCircle2, 
    Leaf, 
    ShieldCheck, 
    History,
    IndianRupee,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { CorePillars, Testimonials, PartnerLogos } from '../components/FeatureBanners';
import FloatingSidebar from '../components/FloatingSidebar';

const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <>
            <style>{`
                .slick-next::before, .slick-prev::before {
                    display: none !important;
                }
            `}</style>
            <div
                className={className}
                style={{ 
                    ...style, 
                    display: "flex", 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: "#F5F5F5", 
                    borderRadius: "50%", 
                    width: "50px", 
                    height: "50px",
                    zIndex: 2,
                    right: "-25px",
                    cursor: 'pointer',
                    transition: '0.3s'
                }}
                onClick={onClick}
            >
                <ChevronRight color="#000" size={24} />
            </div>
        </>
    );
};

const Product = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.get(`/products/${slug}`).then(res => {
            if(res.data.status) {
                setProduct(res.data.product);
                setMainImage(res.data.product.image);
                setRelated(res.data.related || []);
                const variants = res.data.product.variants || [];
                if(variants.length > 0) {
                    const firstStocked = variants.find(v => v.stock > 0) || variants[0];
                    setSelectedVariant(firstStocked);
                } else {
                    setSelectedVariant(null);
                }
            }
        }).finally(() => setLoading(false));
    }, [slug]);

    if(loading) return <div className="container mt-5 text-center">Loading...</div>;
    if(!product) return <div className="container mt-5 text-center">Product not found.</div>;

    const variants = product.variants || [];
    const isOutOfStock = variants.length === 0 || (selectedVariant && selectedVariant.stock <= 0) || variants.every(v => v.stock <= 0);

    const price = selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : null;
    const oldPrice = selectedVariant?.salePrice ? selectedVariant.price : null;

    let badge = null;
    if(oldPrice) {
        const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
        badge = `Save ${discount}%`;
    }

    const breadcrumbItems = [];
    if(product.category) {
        breadcrumbItems.push({ label: product.category.name, link: `/shop?category=${product.category.slug}` });
    }
    breadcrumbItems.push({ label: product.name });

    const handleAddToCart = () => {
        addToCart(product.id, selectedVariant?.id, quantity);
    };

    const handleBuyNow = () => {
        addToCart(product.id, selectedVariant?.id, quantity);
        navigate('/checkout');
    };

    const handleWishlist = () => {
        toggleWishlist(product.id);
    };

    const inWishlist = isInWishlist(product?.id);

    const avgRating = product.reviews?.length > 0 
        ? Math.round(product.reviews.reduce((acc, r) => acc + r.rating, 0) / (product.reviews.length || 1)) 
        : 5;

    const renderStars = (rating = avgRating) => {
        const rounded = Math.round(rating);
        return (
            <div className="d-inline-block" title={`${rating * 20}%`} style={{ verticalAlign: 'middle' }}>
                <span style={{ color: '#FDC040', fontSize: '16px', letterSpacing: '2px' }}>
                    {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
                </span>
            </div>
        );
    };

    return (
        <main className="main">
            <Breadcrumb items={breadcrumbItems} />
            <div className="container mb-30">
                <div className="row">
                    <div className="col-xl-10 col-lg-12 m-auto">
                        <div className="product-detail accordion-detail">
                            <div className="row mb-50 mt-30">
                                {/* Product Images */}
                                <div className="col-md-6 col-sm-12 col-xs-12 mb-md-0 mb-sm-5">
                                    <div className="detail-gallery">
                                        <div className="product-image-slider-details">
                                            <figure className="border-radius-10" style={{ border: '1px solid #eee', overflow: 'hidden', position: 'relative' }}>
                                                <img src={getAssetUrl(mainImage)} alt={product.name} style={{ width: '100%', objectFit: 'contain', aspectRatio: '1/1' }} />
                                                {badge && (
                                                    <div style={{ position: 'absolute', top: 0, left: 0, background: '#0A6738', color: '#fff', padding: '8px 15px', borderRadius: '0 0 20px 0', fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins' }}>
                                                        {badge}
                                                    </div>
                                                )}
                                            </figure>
                                        </div>
                                        {/* Gallery Thumbnails */}
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                                            <div 
                                                onClick={() => setMainImage(product.image)}
                                                style={{ border: mainImage === product.image ? '2px solid #3BB77E' : '1px solid #eee', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', minWidth: '80px', height: '80px' }}
                                            >
                                                <img src={getAssetUrl(product.image)} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            {product.images?.map(img => (
                                                <div 
                                                    key={img.id}
                                                    onClick={() => setMainImage(img.image)}
                                                    style={{ border: mainImage === img.image ? '2px solid #3BB77E' : '1px solid #eee', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', minWidth: '80px', height: '80px' }}
                                                >
                                                    <img src={getAssetUrl(img.image)} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="col-md-6 col-sm-12 col-xs-12">
                                    <div className="detail-info pr-30 pl-30" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {/* Countdown Placeholder if it's a deal */}
                                        <div style={{ display: 'flex', alignItems: 'center', background: '#E9FFF4', padding: '8px 15px', borderRadius: '6px', marginBottom: '15px', width: 'fit-content', gap: '8px' }}>
                                            <Clock size={16} color="#0A6738" />
                                            <span style={{ color: '#0A6738', fontWeight: '600', fontSize: '14px' }}>Limited Time Offer!</span>
                                        </div>

                                        <h2 className="title-detail" style={{ color: '#0A6738', fontSize: '32px', fontWeight: '600', textTransform: 'capitalize', marginBottom: '10px' }}>{product.name}</h2>
                                        
                                        <div className="mb-20" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #eee', padding: '4px 10px', borderRadius: '20px' }}>
                                                <Star size={16} fill="#FFCD0F" color="#FFCD0F" />
                                                <span style={{ fontWeight: '600', fontSize: '14px' }}>{avgRating.toFixed(1)}</span>
                                            </div>
                                            <span className="font-small text-muted">({product.reviews?.length || 0} reviews)</span>
                                        </div>

                                        <div className="product-price-cover mb-25">
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                                                {isOutOfStock ? (
                                                    <span style={{ color: '#ea4335', fontSize: '28px', fontWeight: '700' }}>Out of Stock</span>
                                                ) : price !== null ? (
                                                    <>
                                                        <span style={{ color: '#0A6738', fontSize: '36px', fontWeight: '700' }}>₹{parseFloat(price).toFixed(0)}</span>
                                                        {oldPrice && (
                                                            <span style={{ color: '#9B9B9B', fontSize: '18px', fontWeight: '600', textDecoration: 'line-through' }}>₹{parseFloat(oldPrice).toFixed(0)}</span>
                                                        )}
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div style={{ height: '1px', background: '#DCDCDC', width: '100%', marginBottom: '25px' }}></div>

                                        {product.variants && product.variants.length > 0 && (
                                            <div className="mb-25">
                                                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Choose Variant</h4>
                                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                    {product.variants.map(v => (
                                                        <div 
                                                            key={v.id} 
                                                            onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                                                            style={{ 
                                                                padding: '10px 20px', 
                                                                borderRadius: '8px', 
                                                                border: selectedVariant?.id === v.id ? '2px solid #0A6738' : '1px solid #9B9B9B',
                                                                background: selectedVariant?.id === v.id ? '#E9FFF4' : '#fff',
                                                                cursor: 'pointer',
                                                                transition: '0.2s',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            {v.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-25">
                                            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Quantity</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #BABABA', borderRadius: '6px', overflow: 'hidden' }}>
                                                    <button 
                                                        onClick={() => !isOutOfStock && setQuantity(q => Math.max(1, q - 1))}
                                                        style={{ padding: '8px 12px', background: '#0A6738', border: 'none', color: '#fff', cursor: 'pointer' }}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span style={{ width: '45px', textAlign: 'center', fontWeight: '600', fontSize: '18px' }}>{isOutOfStock ? 0 : quantity}</span>
                                                    <button 
                                                        onClick={() => !isOutOfStock && setQuantity(q => Math.min(selectedVariant?.stock || 0, q + 1))}
                                                        style={{ padding: '8px 12px', background: '#0A6738', border: 'none', color: '#fff', cursor: 'pointer' }}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {(() => {
                                            const currentStock = selectedVariant ? selectedVariant.stock : 0;
                                            const cartItem = cartItems?.find(item => item.product?.id === product.id && item.variantId === selectedVariant?.id);
                                            
                                            return (
                                                <div className="detail-extralink mb-30" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                                    {isOutOfStock ? (
                                                        <button disabled style={{ background: '#e0e0e0', color: '#666', border: 'none', padding: '12px 30px', borderRadius: '10px', fontWeight: '600', flex: 1, cursor: 'not-allowed' }}>Out of Stock</button>
                                                    ) : cartItem ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', background: '#0A6738', borderRadius: '10px', flex: 1, overflow: 'hidden' }}>
                                                            <button 
                                                                onClick={(e) => { e.preventDefault(); cartItem.quantity > 1 ? updateQuantity(cartItem.id, cartItem.quantity - 1) : removeFromCart(cartItem.id); }}
                                                                style={{ padding: '12px 20px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            >
                                                                <Minus size={20} />
                                                            </button>
                                                            <span style={{ color: '#fff', fontWeight: '600', fontSize: '18px', padding: '0 10px' }}>{cartItem.quantity} in Cart</span>
                                                            <button 
                                                                onClick={(e) => { e.preventDefault(); cartItem.quantity < currentStock && updateQuantity(cartItem.id, cartItem.quantity + 1); }}
                                                                style={{ padding: '12px 20px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            >
                                                                <Plus size={20} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={handleAddToCart} style={{ background: '#E9FFF4', color: '#0A6738', border: '1px solid #0A6738', padding: '12px 30px', borderRadius: '10px', fontWeight: '600', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                            <ShoppingCart size={20} /> Add to cart
                                                        </button>
                                                    )}
                                                    {!isOutOfStock && (
                                                        <button onClick={handleBuyNow} style={{ background: '#FF1A00', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '10px', fontWeight: '600', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                            <ShoppingBag size={20} /> Buy Now
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        <div 
                                            onClick={handleWishlist}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#0A6738', fontWeight: '600', width: 'fit-content' }}
                                        >
                                            <Heart size={20} fill={inWishlist ? '#FF1A00' : 'none'} color={inWishlist ? '#FF1A00' : '#0A6738'} />
                                            <span>{inWishlist ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Product Description & Information Flow */}
                            <div className="product-info mt-60" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {/* Description Section */}
                                <div id="description" className="mb-50">
                                    <h3 style={{ color: '#0A6738', fontSize: '24px', fontWeight: '700', marginBottom: '20px', borderBottom: '2px solid #F2FFD6', paddingBottom: '10px', display: 'inline-block' }}>Description</h3>
                                    <div style={{ fontSize: '15px', color: '#555', lineHeight: '1.8', textAlign: 'justify' }}>
                                        {product.description || 'No description available.'}
                                    </div>
                                </div>

                                {/* Features Section */}
                                <div id="features" className="mb-50">
                                    <h3 style={{ color: '#0A6738', fontSize: '24px', fontWeight: '700', marginBottom: '20px', borderBottom: '2px solid #F2FFD6', paddingBottom: '10px', display: 'inline-block' }}>Features</h3>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {product.features && product.features.length > 0 && product.features.map((f, i) => (
                                            <li key={i} className="mb-15" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#333' }}>
                                                <span style={{ color: '#0A6738', fontWeight: '900' }}>•</span>
                                                <div>
                                                    <strong style={{ color: '#0A6738' }}>{f.feature} :</strong> {f.description}
                                                </div>
                                            </li>
                                        ))}
                                        {/* Example tags based on image */}
                                        <li className="mb-15" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#333' }}>
                                            <span style={{ color: '#0A6738', fontWeight: '900' }}>•</span>
                                            <div>
                                                <strong style={{ color: '#0A6738' }}>Tags :</strong> {product.category?.name || 'Oil'} , Lakdi Ghana Oil , Cold Pressed Oil , Wood Pressed Oil , Organic Cooking Oil , Healthy Edible Oil , Chemical-Free Oil , Yogi’s Farm
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* Additional Information Section (Core Pillars from Home) */}
                                <div id="additional-info" className="mb-50">
                                    <h3 style={{ color: '#0A6738', fontSize: '24px', fontWeight: '700', marginBottom: '30px', borderBottom: '2px solid #F2FFD6', paddingBottom: '10px', display: 'inline-block' }}>Additional Information</h3>
                                    <CorePillars />
                                </div>

                                {/* Reviews Section */}
                                <div id="reviews" className="mb-60">
                                    <h3 style={{ color: '#0A6738', fontSize: '24px', fontWeight: '700', marginBottom: '40px', borderBottom: '2px solid #F2FFD6', paddingBottom: '10px', display: 'inline-block' }}>Reviews</h3>
                                    <div className="row">
                                        <div className="col-lg-5 mb-40">
                                            <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #eee' }}>
                                                <h4 className="mb-20" style={{ fontSize: '18px', fontWeight: '600', color: '#0A6738' }}>Based On Reviews</h4>
                                                <div className="progress-list mb-10">
                                                    {[5, 4, 3, 2, 1].map(star => {
                                                        const count = product.reviews?.filter(r => r.rating === star).length || 0;
                                                        const total = product.reviews?.length || 1;
                                                        const percent = (count * 100) / (total || 1);
                                                        const displayPercent = product.reviews?.length > 0 ? Math.round(percent) : (star === 5 ? 90 : (star === 4 ? 60 : (star === 3 ? 40 : 20))); // Mock data if no reviews, matching image style
                                                        return (
                                                            <div key={star} className="d-flex align-items-center mb-15" style={{ gap: '15px' }}>
                                                                <div style={{ minWidth: '100px' }}>{renderStars(star)}</div>
                                                                <div className="progress" style={{ flex: 1, height: '6px', background: '#F0F0F0', borderRadius: '10px', overflow: 'hidden' }}>
                                                                    <div className="progress-bar" style={{ width: `${displayPercent}%`, background: '#0A6738', transition: 'width 1s ease-in-out' }}></div>
                                                                </div>
                                                                <span style={{ minWidth: '40px', fontSize: '13px', color: '#666', fontWeight: '600', textAlign: 'right' }}>{displayPercent.toString().padStart(2, '0')}%</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-7">
                                            <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #eee' }}>
                                                <h4 className="mb-15" style={{ fontSize: '18px', fontWeight: '600', color: '#0A6738' }}>Add A Review</h4>
                                                <p className="font-xs text-muted mb-25">Your email address will not be published. Required fields are marked *</p>
                                                <form className="form-contact comment_form" action="#" id="commentForm">
                                                    <div className="row">
                                                        <div className="col-12 mb-20">
                                                            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                Your Rating : <div style={{ display: 'flex', gap: '5px' }}>{[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} color="#ddd" style={{ cursor: 'pointer' }} />)}</div>
                                                            </label>
                                                        </div>
                                                        <div className="col-12 mb-20">
                                                            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Your Review *</label>
                                                            <textarea className="form-control" name="comment" id="comment" cols="30" rows="4" placeholder="Your Review" style={{ padding: '15px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}></textarea>
                                                        </div>
                                                        <div className="col-sm-6 mb-20">
                                                            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Your Name *</label>
                                                            <input className="form-control" name="name" id="name" type="text" placeholder="" style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }} />
                                                        </div>
                                                        <div className="col-sm-6 mb-20">
                                                            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Email *</label>
                                                            <input className="form-control" name="email" id="email" type="email" placeholder="" style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }} />
                                                        </div>
                                                        <div className="col-12 mb-20">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <input type="checkbox" id="save-info" style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FF0000' }} />
                                                                <label htmlFor="save-info" style={{ fontSize: '13px', color: '#666', cursor: 'pointer', margin: 0 }}>Save My Name, Email, And Website In This Browser For The Next Time I Comment.</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <button type="submit" className="button button-contactForm" style={{ background: '#FF0000', color: '#fff', border: 'none', padding: '15px 60px', borderRadius: '8px', fontWeight: '700', fontSize: '16px', textTransform: 'uppercase', width: '100%' }}>Submit</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Related Products Section */}
                            {related.length > 0 && (
                                <div className="mt-60 mb-60" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    <div className="col-12">
                                        <h3 style={{ color: '#0A6738', fontSize: '24px', fontWeight: '700', marginBottom: '30px', borderBottom: '2px solid #F2FFD6', paddingBottom: '10px', display: 'inline-block' }}>Related Products</h3>
                                    </div>
                                    <div className="related-products-slider" style={{ padding: '0 20px' }}>
                                        <Slider
                                            dots={false}
                                            infinite={true}
                                            speed={1000}
                                            autoplay={true}
                                            autoplaySpeed={3000}
                                            slidesToShow={3}
                                            slidesToScroll={1}
                                            arrows={true}
                                            nextArrow={<NextArrow />}
                                            prevArrow={<div style={{ display: 'none' }}></div>}
                                            swipe={true}
                                            draggable={true}
                                            swipeToSlide={true}
                                            pauseOnHover={true}
                                            responsive={[
                                                {
                                                    breakpoint: 1200,
                                                    settings: {
                                                        slidesToShow: 3,
                                                        slidesToScroll: 1,
                                                    }
                                                },
                                                {
                                                    breakpoint: 992,
                                                    settings: {
                                                        slidesToShow: 2,
                                                        slidesToScroll: 1,
                                                    }
                                                },
                                                {
                                                    breakpoint: 576,
                                                    settings: {
                                                        slidesToShow: 1,
                                                        slidesToScroll: 1,
                                                    }
                                                }
                                            ]}
                                        >
                                            {related.map(p => (
                                                <div key={p.id} style={{ padding: '0 15px' }}>
                                                    <ProductCard product={p} />
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials and Partner Logos from Home Page */}
            <Testimonials />
            <PartnerLogos />

            {/* Floating Sidebar attached to right edge */}
            <FloatingSidebar />
        </main>
    );
};

export default Product;
