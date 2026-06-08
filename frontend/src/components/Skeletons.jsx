import React from 'react';

export const ProductCardSkeleton = ({ isMobile }) => {
    if (isMobile) {
        return (
            <div className="product-cart-wrap skeleton-pulse" style={{ 
                width: '100%',
                maxWidth: '180px', 
                height: '180px', 
                borderRadius: '5.59px', 
                border: '0.509px solid #EAEAEA', 
                backgroundColor: '#F7F7F7',
                display: 'flex',
                flexDirection: 'column',
                margin: '0 auto',
                padding: '3px'
            }}>
                <div className="skeleton-pulse" style={{ width: '100%', aspectRatio: '160/102', backgroundColor: '#E0E0E0', borderRadius: '4.56px' }}></div>
                <div style={{ padding: '6px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="skeleton-pulse" style={{ height: '10px', width: '80%', backgroundColor: '#E0E0E0', borderRadius: '4px' }}></div>
                    <div className="skeleton-pulse" style={{ height: '8px', width: '50%', backgroundColor: '#E0E0E0', borderRadius: '4px' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <div className="skeleton-pulse" style={{ height: '12px', width: '40px', backgroundColor: '#E0E0E0', borderRadius: '4px' }}></div>
                        <div className="skeleton-pulse" style={{ height: '18px', width: '50px', backgroundColor: '#E0E0E0', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-cart-wrap" style={{ 
            width: '100%',
            maxWidth: '291px', 
            height: '400px', 
            borderRadius: '11px', 
            border: '1px solid #EAEAEA', 
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            margin: '0 auto',
            padding: '5px'
        }}>
            <div className="skeleton-pulse" style={{ width: '100%', aspectRatio: '281/187', backgroundColor: '#F0F0F0', borderRadius: '9px' }}></div>
            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton-pulse" style={{ height: '16px', width: '90%', backgroundColor: '#F0F0F0', borderRadius: '4px' }}></div>
                <div className="skeleton-pulse" style={{ height: '12px', width: '60%', backgroundColor: '#F0F0F0', borderRadius: '4px' }}></div>
                <div className="skeleton-pulse" style={{ height: '12px', width: '40%', backgroundColor: '#F0F0F0', borderRadius: '4px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div className="skeleton-pulse" style={{ height: '24px', width: '80px', backgroundColor: '#F0F0F0', borderRadius: '4px' }}></div>
                    <div className="skeleton-pulse" style={{ height: '32px', width: '70px', backgroundColor: '#F0F0F0', borderRadius: '4px' }}></div>
                </div>
            </div>
        </div>
    );
};

export const BlogCardSkeleton = () => {
    return (
        <article 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #F2F4F7',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
            width: '100%',
            height: '100%'
          }}
        >
          {/* Blog Image */}
          <div className="skeleton-pulse" style={{ width: '100%', height: '240px', backgroundColor: '#F0F0F0' }} />

          {/* Card Details */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
            {/* Category tag */}
            <div className="skeleton-pulse" style={{ width: '80px', height: '14px', borderRadius: '4px', backgroundColor: '#F0F0F0' }} />

            {/* Title */}
            <div className="skeleton-pulse" style={{ width: '90%', height: '24px', borderRadius: '4px', backgroundColor: '#F0F0F0' }} />
            <div className="skeleton-pulse" style={{ width: '60%', height: '24px', borderRadius: '4px', backgroundColor: '#F0F0F0' }} />

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', flex: 1 }}>
              <div className="skeleton-pulse" style={{ width: '100%', height: '14px', borderRadius: '4px', backgroundColor: '#F0F0F0' }} />
              <div className="skeleton-pulse" style={{ width: '95%', height: '14px', borderRadius: '4px', backgroundColor: '#F0F0F0' }} />
              <div className="skeleton-pulse" style={{ width: '80%', height: '14px', borderRadius: '4px', backgroundColor: '#F0F0F0' }} />
            </div>

            {/* Author Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F0F0F0', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="skeleton-pulse" style={{ width: '100px', height: '14px', borderRadius: '4px', backgroundColor: '#F0F0F0' }} />
                <div className="skeleton-pulse" style={{ width: '80px', height: '12px', borderRadius: '4px', backgroundColor: '#F0F0F0' }} />
              </div>
            </div>
          </div>
        </article>
    );
};

export const BestDealsSkeleton = ({ isMobile }) => {
    if (isMobile) {
        return (
            <div style={{ padding: '0 24px' }}>
                <div className="section-title animate__animated animate__fadeIn" style={{ margin: '0 0 12px 0' }}>
                    <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600 }}>Best Deals</h3>
                </div>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '5px' }}>
                    <div className="skeleton-pulse" style={{ width: '312px', height: '159px', flexShrink: 0, borderRadius: '9px', backgroundColor: '#F0F0F0' }}></div>
                    <div className="skeleton-pulse" style={{ width: '312px', height: '159px', flexShrink: 0, borderRadius: '9px', backgroundColor: '#F0F0F0' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1236px', margin: '0 auto', padding: '0 15px' }}>
            <div className="section-title">
                <h3 style={{ color: '#0A6738', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Best Deals</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '26px', marginBottom: '24px', justifyContent: 'center' }}>
                <div className="skeleton-pulse" style={{ flex: '1 1 500px', maxWidth: '605px', height: '303px', borderRadius: '10px', backgroundColor: '#F0F0F0' }}></div>
                <div className="skeleton-pulse" style={{ flex: '1 1 500px', maxWidth: '605px', height: '303px', borderRadius: '10px', backgroundColor: '#F0F0F0' }}></div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                <div className="skeleton-pulse" style={{ flex: '1 1 240px', maxWidth: '291px', height: '346px', borderRadius: '10px', backgroundColor: '#F0F0F0' }}></div>
                <div className="skeleton-pulse" style={{ flex: '2 1 480px', maxWidth: '606px', height: '346px', borderRadius: '10px', backgroundColor: '#F0F0F0' }}></div>
                <div className="skeleton-pulse" style={{ flex: '1 1 240px', maxWidth: '291px', height: '346px', borderRadius: '10px', backgroundColor: '#F0F0F0' }}></div>
            </div>
        </div>
    );
};
