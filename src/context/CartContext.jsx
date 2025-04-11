import React, { createContext, useContext, useEffect, useState } from 'react';
import { Account } from 'appwrite'; // Make sure to import Account if needed
import { client } from '../api/appwriteConfig';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Initialize account if needed
  const account = new Account(client); // Make sure client is defined

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await account.get();
        setUserId(currentUser.$id);
        setUser({
          name: currentUser.name,
          email: currentUser.email
        });
      } catch (error) {
        setUserId('');
        setUser(null);
      }
    };
    
    checkAuth();
  }, []);

  const increment = () => {
    setQuantity(prev => prev + 1);
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const updateSelectedTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  return (
    <CartContext.Provider 
      value={{
        quantity,
        selectedTicket,
        increment,
        decrement,
        updateSelectedTicket,
        userId,
        user, // Don't forget to include user in the context value
        setUserId
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);