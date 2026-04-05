import { createContext, useContext, useReducer, useCallback } from "react";
import { useToast } from "@chakra-ui/react";

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, size, quantity = 1 } = action.payload;
      const key = `${product.id}-${size}`;
      const existing = state.items.find((i) => i.key === key);

      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i
          ),
          lastAdded: { product, size, quantity },
        };
      }

      return {
        ...state,
        items: [...state.items, { key, product, size, quantity }],
        lastAdded: { product, size, quantity },
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.key !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      const { key, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.key !== key) };
      }
      return {
        ...state,
        items: state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
      };
    }

    case "CLEAR_CART":
      return { ...initialState };

    case "CLEAR_LAST_ADDED":
      return { ...state, lastAdded: null };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  lastAdded: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const toast = useToast();

  const addItem = useCallback((product, size, quantity = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { product, size, quantity } });
    toast({
      title: "Producto agregado",
      description: `${product.name} (Talle ${size}) x${quantity} agregado al carrito.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, []);

  const removeItem = useCallback((key) => {
    dispatch({ type: "REMOVE_ITEM", payload: key });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { key, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const clearLastAdded = useCallback(() => {
    dispatch({ type: "CLEAR_LAST_ADDED" });
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + (i.product.salePrice || i.product.price) * i.quantity, 0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        lastAdded: state.lastAdded,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearLastAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
