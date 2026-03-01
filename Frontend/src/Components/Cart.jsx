import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import useUserStore from "../app/userStore";
import { resolveImage } from "../utils/imageUtils";
import { useKeyPress } from "../hooks/useCustomHooks";
import { trapFocus, focusManager } from "../utils/focusManager";
import useAnimeCartFx from "../hooks/useAnimeCartFx";

const Cart = ({ onClose }) => {
  const navigate = useNavigate();
  const cart = useUserStore((s) => s.cart);
  const removeFromCart = useUserStore((s) => s.removeFromCart);
  const updateCartQuantity = useUserStore((s) => s.updateCartQuantity);
  const getCartTotal = useUserStore((s) => s.getCartTotal);
  const cartRef = useRef(null);
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const handleCloseRef = useRef(null);
  const itemRefs = useRef({});
  const [isClosing, setIsClosing] = useState(false);
  const { playRemoveSlide } = useAnimeCartFx();

  // Close cart on Escape key — use a ref so handleClose is never accessed before declaration
  useKeyPress("Escape", () => handleCloseRef.current?.())

  // Animate cart in on mount
  useEffect(() => {
    focusManager.store();
    document.body.style.overflow = "hidden";

    const cleanup = cartRef.current ? trapFocus(cartRef.current) : () => { };

    // Overlay fade-in
    if (overlayRef.current) {
      anime({
        targets: overlayRef.current,
        opacity: [0, 1],
        duration: 350,
        easing: "easeOutCubic",
      });
    }

    // Panel slide-in from right with spring
    if (panelRef.current) {
      anime({
        targets: panelRef.current,
        translateX: ["100%", "0%"],
        duration: 600,
        easing: "easeOutExpo",
      });
    }

    // Cart header fade-in
    anime({
      targets: ".cart-header",
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 400,
      delay: 200,
      easing: "easeOutCubic",
    });

    // Cart items stagger in
    if (cart.length > 0) {
      anime({
        targets: ".cart-item",
        opacity: [0, 1],
        translateX: [40, 0],
        scale: [0.95, 1],
        duration: 500,
        delay: anime.stagger(80, { start: 300 }),
        easing: "easeOutExpo",
      });
    }

    // Cart footer slide up
    anime({
      targets: ".cart-footer",
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 500,
      delay: 400,
      easing: "easeOutCubic",
    });

    return () => {
      document.body.style.overflow = "unset";
      cleanup();
      focusManager.restore();
    };
  }, [cart.length]);

  // Animated close
  const handleClose = async () => {
    if (isClosing) return;
    setIsClosing(true);

    const promises = [];

    if (panelRef.current) {
      promises.push(
        new Promise((resolve) => {
          anime({
            targets: panelRef.current,
            translateX: ["0%", "100%"],
            duration: 400,
            easing: "easeInCubic",
            complete: resolve
          });
        })
      );
    }

    if (overlayRef.current) {
      promises.push(
        new Promise((resolve) => {
          anime({
            targets: overlayRef.current,
            opacity: [1, 0],
            duration: 350,
            easing: "easeInCubic",
            complete: resolve
          });
        })
      );
    }

    await Promise.all(promises);
    onClose();
  };

  // Keep ref in sync after every render so Escape handler always calls the latest version
  useEffect(() => {
    handleCloseRef.current = handleClose;
  });

  // Animated item removal
  const handleRemove = async (productId) => {
    const rowEl = itemRefs.current[productId];
    if (rowEl) {
      await playRemoveSlide(rowEl);
    }
    removeFromCart(productId);
  };

  // Quantity change micro-animation
  const handleQuantityChange = (itemId, newQuantity, minQ) => {
    updateCartQuantity(itemId, Number(newQuantity) || minQ || 1);
    const rowEl = itemRefs.current[itemId];
    if (rowEl) {
      anime({
        targets: rowEl,
        scale: [
          { value: 1.02, duration: 80, easing: "easeOutCubic" },
          { value: 1, duration: 200, easing: "spring(1, 80, 10, 0)" },
        ],
      });
    }
  };

  return (
    <div
      ref={cartRef}
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <div
        ref={overlayRef}
        className="flex-1 bg-black/40 backdrop-blur-sm opacity-0"
        onClick={handleClose}
        aria-label="Close cart"
      />
      <div
        ref={panelRef}
        className="w-full sm:w-96 bg-white p-4 shadow-2xl overflow-auto"
        style={{ transform: "translateX(100%)" }}
      >
        <div className="cart-header flex items-center justify-between mb-4 opacity-0">
          <h3 id="cart-title" className="text-lg font-semibold">
            Your Cart
          </h3>
          <button
            onClick={handleClose}
            className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1"
            aria-label="Close cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
        </div>

        {cart.length === 0 && (
          <div className="py-8 text-center text-gray-600" role="status">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Your cart is empty.
          </div>
        )}

        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item._id}
              ref={(el) => {
                itemRefs.current[item._id] = el;
              }}
              className="cart-item flex items-start justify-between py-2 opacity-0"
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
              <div className="flex flex-col items-end gap-2">
                {/* Quantity stepper */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => {
                      const min = item.minOrderQuantity || 1;
                      const next = Math.max(min, item.quantity - 1);
                      if (next !== item.quantity) handleQuantityChange(item._id, next, min);
                    }}
                    disabled={item.quantity <= (item.minOrderQuantity || 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Decrease quantity of ${item.chemicalname || item.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                    </svg>
                  </button>
                  <span
                    className="w-9 text-center text-sm font-semibold text-gray-800 select-none tabular-nums"
                    aria-live="polite"
                    aria-label={`Quantity: ${item.quantity}`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.minOrderQuantity)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
                    aria-label={`Increase quantity of ${item.chemicalname || item.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="text-xs text-red-500 hover:text-red-700 transition flex items-center gap-1"
                  aria-label={`Remove ${item.chemicalname || item.name} from cart`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-footer mt-4 border-t pt-4 opacity-0">
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
                handleClose();
                setTimeout(() => navigate("/checkout"), 420);
              }}
              className="flex-1 btn-primary px-3 py-2 rounded text-white hover:opacity-90 transition"
              aria-label="Proceed to checkout"
              disabled={cart.length === 0}
            >
              Checkout
            </button>
            <button
              onClick={handleClose}
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
