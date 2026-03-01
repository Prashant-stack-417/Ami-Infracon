import { useEffect, useState, useCallback, useMemo } from "react";
import anime from "animejs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import {
  IconUsers,
  IconTrash,
  IconMail,
  IconPhone,
  IconCalendar,
  IconSearch,
} from "@tabler/icons-react";

const UserManagement = () => {
  const navigate = useNavigate();
  const isMounted = useIsMounted();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const checkAuth = useCallback(() => {
    const storedAdmin = localStorage.getItem("admin");
    const token = localStorage.getItem("adminToken");

    if (!storedAdmin || !token) {
      navigate("/login");
      return false;
    }
    return true;
  }, [navigate]);

  const loadUsers = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const usersRes = await axiosInstance
        .get("/admin/users")
        .catch(() => ({ data: { data: { users: [] } } }));

      if (!isMounted.current) return;

      const usersData = usersRes.data?.data?.users || [];
      setUsers(usersData);
    } catch (error) {
      if (!isMounted.current) return;
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        handleApiError(error, {
          fallbackMessage: "Failed to load users",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isMounted, navigate]);

  useEffect(() => {
    if (checkAuth()) {
      loadUsers();
    }
  }, [checkAuth, loadUsers]);

  useEffect(() => {
    if (!loading) {
      anime({
        targets: ".user-mgt-main",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".user-mgt-stat",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 500,
        easing: "easeOutCubic"
      });
    }
  }, [loading]);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  }), [users, searchQuery]);

  useEffect(() => {
    if (!loading && filteredUsers.length > 0) {
      anime({
        targets: ".user-mgt-row",
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: anime.stagger(50),
        duration: 400,
        easing: "easeOutCubic"
      });
    }
  }, [loading, filteredUsers]);

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      if (isMounted.current) {
        loadUsers();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to delete user",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center pt-20">
        <div className="text-xl font-semibold text-primary-content">
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 bg-linear-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 user-mgt-main opacity-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-content mb-1">
                User Management
              </h1>
              <p className="text-gray-600">
                Manage registered users and their accounts
              </p>
            </div>
            <div className="relative flex-1 max-w-md">
              <IconSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 user-mgt-stat opacity-0">
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">{users.length}</p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 user-mgt-stat opacity-0">
              <p className="text-sm text-green-600 font-medium">Active Today</p>
              <p className="text-2xl font-bold text-green-900">
                {users.filter((u) => {
                  const today = new Date().toDateString();
                  return new Date(u.createdAt).toDateString() === today;
                }).length}
              </p>
            </div>
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 user-mgt-stat opacity-0">
              <p className="text-sm text-purple-600 font-medium">
                This Month
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {users.filter((u) => {
                  const thisMonth = new Date().getMonth();
                  const thisYear = new Date().getFullYear();
                  const userDate = new Date(u.createdAt);
                  return (
                    userDate.getMonth() === thisMonth &&
                    userDate.getFullYear() === thisYear
                  );
                }).length}
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Joined
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-100 hover:bg-gray-50 user-mgt-row opacity-0"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <IconMail size={16} className="text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <IconPhone size={16} className="text-gray-400" />
                        {user.phone || "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <IconCalendar size={16} className="text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <IconTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <IconUsers className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 text-lg">
                  {searchQuery ? "No users found matching your search" : "No users found"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
