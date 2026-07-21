import { useState, useEffect } from "react";
import { useUserContext } from "../app/UserContext";
import toast from "react-hot-toast";
import { IconUser, IconPhone, IconHome, IconMapPin, IconBuilding, IconMail, IconCheck, IconX } from "@tabler/icons-react";
import anime from "animejs";

const UserProfile = () => {
  const { user } = useUserContext();
  const { updateProfile } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        addressLine1: user.defaultAddress?.addressLine1 || "",
        addressLine2: user.defaultAddress?.addressLine2 || "",
        city: user.defaultAddress?.city || "",
        state: user.defaultAddress?.state || "",
        postalCode: user.defaultAddress?.postalCode || "",
      });
    }
  }, [user]);

  useEffect(() => {
    anime({
      targets: ".profile-card",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      easing: "easeOutCubic"
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData.name, formData.phone, {
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-4">
      <div className="max-w-4xl mx-auto profile-card opacity-0">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
            <p className="text-gray-500">Manage your personal information and default shipping address.</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary px-5 py-2 rounded-lg text-white font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <IconUser className="text-primary" size={24} />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!isEditing ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"}`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!isEditing ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"}`}
                      />
                    </div>
                  </div>

                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Shipping Address */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <IconMapPin className="text-primary" size={24} />
                  Default Shipping Address
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Address Line 1 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1</label>
                    <div className="relative">
                      <IconHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!isEditing ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"}`}
                        placeholder="House/Flat No., Building Name, Street"
                      />
                    </div>
                  </div>

                  {/* Address Line 2 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!isEditing ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"}`}
                      placeholder="Locality, Landmark"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <div className="relative">
                      <IconBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!isEditing ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"}`}
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!isEditing ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"}`}
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!isEditing ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-white border-gray-300"}`}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                    <input
                      type="text"
                      value="India"
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                    />
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <IconCheck size={20} />
                    )}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form
                      setFormData({
                        name: user.name || "",
                        phone: user.phone || "",
                        addressLine1: user.defaultAddress?.addressLine1 || "",
                        addressLine2: user.defaultAddress?.addressLine2 || "",
                        city: user.defaultAddress?.city || "",
                        state: user.defaultAddress?.state || "",
                        postalCode: user.defaultAddress?.postalCode || "",
                      });
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    <IconX size={20} />
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
