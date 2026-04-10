import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        // Load wishlist from local storage on mount
        const saved = localStorage.getItem('yogisfarm_wishlist');
        if (saved) {
            try {
                setWishlist(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse wishlist from local storage");
            }
        }
    }, []);

    const toggleWishlist = (productId) => {
        setWishlist(prev => {
            const isWishlisted = prev.includes(productId);
            const newWishlist = isWishlisted 
                ? prev.filter(id => id !== productId)
                : [...prev, productId];
            
            localStorage.setItem('yogisfarm_wishlist', JSON.stringify(newWishlist));
            
            if (isWishlisted) {
                toast.success("Removed from wishlist");
            } else {
                toast.success("Added to wishlist");
            }
            
            return newWishlist;
        });
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
