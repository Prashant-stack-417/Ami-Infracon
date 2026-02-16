import { useNavigate } from "react-router-dom";
import useUserStore from "../app/userStore";
import { resolveImage } from "../utils/imageUtils";

const Cart = ({ onClose }) => {
  const navigate = useNavigate();
  const cart = useUserStore((s) => s.cart);
  const removeFromCart = useUserStore((s) => s.removeFromCart);
  const updateCartQuantity = useUserStore((s) => s.updateCartQuantity);
  const getCartTotal = useUserStore((s) => s.getCartTotal);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full sm:w-96 bg-white p-4 shadow-xl overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Cart</h3>
          <button onClick={onClose} className="text-sm text-gray-600">
            Close
          </button>
        </div>

        {cart.length === 0 && (
          <div className="py-8 text-center text-gray-600">
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
                  alt={item.chemicalname || item.name}
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
                />
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between font-semibold">
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
              className="flex-1 btn-primary px-3 py-2 rounded text-white"
            >
              Checkout
            </button>
            <button onClick={onClose} className="px-3 py-2 border rounded">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
