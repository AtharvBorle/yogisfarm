import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import api from '../api';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            api.get('/wishlist')
                .then(res => {
                    if (res.data.status) {
                        setWishlist(res.data.items.map(i => i.productId));
                    }
                })
                .catch(err => console.error("Failed to load wishlist", err));
        } else {
            setWishlist([]); // Clear if logged out
        }
    }, [user]);

    const toggleWishlist = async (productId) => {
        if (!user) {
            // Trigger customized bottom-left stackable Auth Toast matching mockups
            toast.custom((t) => (
                <div style={{ 
                    background: '#FDC040', // Theme yellow
                    padding: '12px 24px', 
                    color: '#fff', 
                    borderRadius: '5px', 
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                }}>
                    Please Login First..!
                </div>
            ), { position: 'bottom-left', duration: 3000 });
            return;
        }

        try {
            const res = await api.post('/wishlist/toggle', { productId });
            if (res.data.status) {
                if (res.data.inWishlist) {
                    toast.success("Added to wishlist");
                    setWishlist(prev => [...prev, productId]);
                } else {
                    toast.success("Removed from wishlist");
                    setWishlist(prev => prev.filter(id => id !== productId));
                }
            } else {
                toast.error(res.data.message || "Failed to update wishlist");
            }
        } catch (error) {
            toast.error("Error updating wishlist");
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.includes(productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
