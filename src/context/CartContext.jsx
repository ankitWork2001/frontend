import React, { createContext, useContext, useEffect, useState } from 'react';


const CartContext = createContext();

// Update CartContext to only handle cart-related state
export const CartProvider = ({ children }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : prev));
  
  const updateSelectedTicket = (ticket) => setSelectedTicket(ticket);

  return (
    <CartContext.Provider value={{
      quantity,
      selectedTicket,
      increment,
      decrement,
      updateSelectedTicket
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);