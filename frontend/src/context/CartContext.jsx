import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const [cartRes, countRes] = await Promise.all([
        api.get('/cart'),
        api.get('/cart/count')
      ]);
      if (cartRes.data.status) {
        setCartItems(cartRes.data.items);
      }
      if (countRes.data.status) {
        setCartCount(countRes.data.count);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, variantId = null, quantity = 1) => {
    try {
      const response = await api.post('/cart/add', { productId, variantId, quantity });
      if (response.data.status) {
        toast.success(response.data.message);
        setCartCount(response.data.count);
        fetchCart(); // Refresh items
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    try {
      const response = await api.put('/cart/update', { cartId, quantity });
      if (response.data.status) {
        fetchCart();
      }
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      const response = await api.delete(`/cart/remove/${cartId}`);
      if (response.data.status) {
        toast.success(response.data.message);
        fetchCart();
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  // derived state for cart total
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.variant ? parseFloat(item.variant.salePrice || item.variant.price) : parseFloat(item.product.salePrice || item.product.price);
    return total + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, loading, cartTotal, fetchCart, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
