import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import useUserStore from "../app/userStore";
import { resolveImage } from "../utils/imageUtils";
import { useKeyPress } from "../hooks/useCustomHooks";
import { trapFocus, focusManager } from "../utils/focusManager";

const Cart = ({ onClose }) => {
  const navigate = useNavigate();
  const cart = useUserStore((s) => s.cart);
  const removeFromCart = useUserStore((s) => s.removeFromCart);
  const updateCartQuantity = useUserStore((s) => s.updateCartQuantity);
  const getCartTotal = useUserStore((s) => s.getCartTotal);
  const cartRef = useRef(null);

  // Close cart on Escape key
  useKeyPress("Escape", onClose);

  // Lock body scroll and trap focus when cart is open
  useEffect(() => {
    focusManager.store();
    document.body.style.overflow = "hidden";

    // Trap focus within cart
    const cleanup = cartRef.current ? trapFocus(cartRef.current) : () => {};

    return () => {
      document.body.style.overflow = "unset";
      cleanup();
      focusManager.restore();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
        aria-label="Close cart"
      />
      <div
        ref={cartRef}
        className="w-full sm:w-96 bg-white p-4 shadow-xl overflow-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="cart-title" className="text-lg font-semibold">
            Your Cart
          </h3>
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-900 transition"
            aria-label="Close cart"
          >
            Close
          </button>
        </div>

        {cart.length === 0 && (
          <div className="py-8 text-center text-gray-600" role="status">
            Your cart is empty.
          </div>
        )}

        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center">
                <img
                  src={resolveImage(item.image)}
                  alt={`${item.chemicalname || item.name} product image`}
                  className="w-12 h-12 object-cover rounded mr-3"
                />
                <div>
                  <div className="font-medium truncate max-w-40">
                    {item.chemicalname || item.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    ₹{item.price}/{item.unit || "unit"}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor={`quantity-${item._id}`} className="sr-only">
                  Quantity for {item.chemicalname || item.name}
                </label>
                <input
                  id={`quantity-${item._id}`}
                  name={`quantity-${item._id}`}
                  type="number"
                  min={item.minOrderQuantity || 1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateCartQuantity(
                      item._id,
                      Number(e.target.value) || item.minOrderQuantity || 1,
                    )
                  }
                  className="w-16 px-2 py-1 border rounded"
                  aria-label={`Quantity for ${item.chemicalname || item.name}`}
                />
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-sm text-red-600 hover:text-red-800 transition"
                  aria-label={`Remove ${item.chemicalname || item.name} from cart`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-4">
          <div
            className="flex items-center justify-between font-semibold"
            role="status"
            aria-live="polite"
          >
            <div>Total</div>
            <div className="text-lg">
              {cart[0]?.currency || "₹"}
              {getCartTotal().toFixed(2)}
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
              className="flex-1 btn-primary px-3 py-2 rounded text-white hover:opacity-90 transition"
              aria-label="Proceed to checkout"
              disabled={cart.length === 0}
            >
              Checkout
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 border rounded hover:bg-gray-50 transition"
              aria-label="Continue shopping"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
