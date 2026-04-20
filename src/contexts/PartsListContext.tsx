import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Part } from "../types";
import { useAuth } from "./AuthContext";

interface CartItem {
  part: Part;
  quantity: number;
}

interface PartsListContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToList: (part: Part) => void;
  removeFromList: (partId: string) => void;
  updateQuantity: (partId: string, quantity: number) => void;
  clearList: () => void;
  getTotalItems: () => number;
}

const PartsListContext = createContext<PartsListContextType | undefined>(undefined);

export const PartsListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedCart = localStorage.getItem(`parts_list_${user.id}`);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error("Error loading parts list:", error);
          setCartItems([]);
        }
      }
    }
  }, [user?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`parts_list_${user.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id]);

  const addToList = (part: Part) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.part.id === part.id);
      if (existingItem) {
        // If part already exists, increment quantity
        return prev.map((item) =>
          item.part.id === part.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Otherwise add new part with quantity 1
      return [...prev, { part, quantity: 1 }];
    });
  };

  const removeFromList = (partId: string) => {
    setCartItems((prev) => prev.filter((item) => item.part.id !== partId));
  };

  const updateQuantity = (partId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromList(partId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.part.id === partId ? { ...item, quantity } : item
      )
    );
  };

  const clearList = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const cartCount = getTotalItems();

  return (
    <PartsListContext.Provider
      value={{
        cartItems,
        cartCount,
        addToList,
        removeFromList,
        updateQuantity,
        clearList,
        getTotalItems,
      }}
    >
      {children}
    </PartsListContext.Provider>
  );
};

export const usePartsList = () => {
  const context = useContext(PartsListContext);
  if (!context) {
    throw new Error("usePartsList must be used within PartsListProvider");
  }
  return context;
};
