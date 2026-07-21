import { useEffect, useState, useCallback, useMemo } from "react";
import anime from "animejs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../utils/apiClient";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import {
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconUserPlus,
  IconMail,
  IconPhone,
  IconCalendar,
  IconSearch,
  IconFilter,
  IconShieldOff,
  IconShieldCheck,
  IconX,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
];

const AVATAR_GRADIENTS = [
  "from-blue-500 to-blue-600",
  "from-violet-500 to-violet-600",
  "from-emerald-500 to-emerald-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
  "from-teal-500 to-teal-600",
  "from-indigo-500 to-indigo-600",
  "from-rose-500 to-rose-600",
];

const getAvatarGradient = (name = "") => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const UserManagement = () => {
  const navigate = useNavigate();
  const isMounted = useIsMounted();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { userId, userName, action: 'block'|'unblock' }
  const [actionLoading, setActionLoading] = useState(false);

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
      const usersRes = await apiClient
        .get("/admin/users")
        .catch(() => ({ data: { data: { users: [] } } }));
      if (!isMounted.current) return;
      setUsers(usersRes.data?.data?.users || []);
    } catch (error) {
      if (!isMounted.current) return;
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        handleApiError(error, { fallbackMessage: "Failed to load users" });
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [isMounted, navigate]);

  useEffect(() => {
    if (checkAuth()) loadUsers();
  }, [checkAuth, loadUsers]);

  useEffect(() => {
    if (!loading) {
      anime({
        targets: ".user-mgt-main",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: "easeOutCubic",
      });
      anime({
        targets: ".user-stat-card",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(80),
        duration: 500,
        easing: "easeOutCubic",
      });
    }
  }, [loading]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: users.length,
      active: users.filter((u) => u.isActive !== false).length,
      blocked: users.filter((u) => u.isActive === false).length,
      newThisMonth: users.filter((u) => {
        const d = new Date(u.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }).length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search) ||
        u.phone?.includes(search);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.isActive !== false) ||
        (statusFilter === "blocked" && u.isActive === false);
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  useEffect(() => {
    if (!loading && filteredUsers.length > 0) {
      anime({
        targets: ".user-row",
        opacity: [0, 1],
        translateX: [-16, 0],
        delay: anime.stagger(40),
        duration: 320,
        easing: "easeOutCubic",
      });
    }
  }, [loading, filteredUsers]);

  const handleToggleStatus = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const isActive = confirmAction.action === "unblock";
      await apiClient.patch(
        `/admin/users/${confirmAction.userId}/status`,
        { isActive }
      );
      toast.success(
        isActive
          ? `${confirmAction.userName} has been unblocked`
          : `${confirmAction.userName} has been blocked`
      );
      if (isMounted.current) {
        // Optimistic update — no full reload needed
        setUsers((prev) =>
          prev.map((u) =>
            u._id === confirmAction.userId ? { ...u, isActive } : u
          )
        );
        if (selectedUser?._id === confirmAction.userId) {
          setSelectedUser((prev) => ({ ...prev, isActive }));
        }
      }
    } catch (error) {
      handleApiError(error, { fallbackMessage: "Failed to update user status" });
    } finally {
      if (isMounted.current) {
        setActionLoading(false);
        setConfirmAction(null);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadUsers();
    if (isMounted.current) setIsRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 bg-linear-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-7xl mx-auto space-y-6 user-mgt-main opacity-0">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Monitor, manage and moderate registered customers
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <IconRefresh size={17} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 user-stat-card opacity-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <IconUsers size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 user-stat-card opacity-0 cursor-pointer hover:border-emerald-200 transition-colors"
            onClick={() => setStatusFilter("active")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <IconUserCheck size={24} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 user-stat-card opacity-0 cursor-pointer hover:border-red-200 transition-colors"
            onClick={() => setStatusFilter("blocked")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Blocked</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.blocked}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <IconUserOff size={24} className="text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 user-stat-card opacity-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">This Month</p>
                <p className="text-3xl font-bold text-violet-600 mt-1">{stats.newThisMonth}</p>
              </div>
              <div className="p-3 bg-violet-50 rounded-xl">
                <IconUserPlus size={24} className="text-violet-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Controls */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <IconSearch
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, email or phone…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>
            <div className="relative">
              <IconFilter
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result count bar */}
          <div className="px-5 py-2.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{users.length}</span>{" "}
              users
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <IconX size={11} /> Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconUsers size={30} className="text-gray-400" />
                </div>
                <p className="text-gray-600 font-semibold text-lg">
                  {searchQuery || statusFilter !== "all"
                    ? "No users match your filters"
                    : "No users yet"}
                </p>
                {(searchQuery || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="mt-3 text-sm text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-170">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50/60 transition-colors user-row"
                    >
                      {/* User cell */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarGradient(user.name)} flex items-center justify-center text-white text-sm font-semibold shrink-0 select-none`}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                              <IconMail size={11} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          <IconPhone size={13} className="text-gray-400 shrink-0" />
                          {user.phone || <span className="text-gray-400">—</span>}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-4">
                        {user.isActive !== false ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Blocked
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <IconCalendar size={13} className="text-gray-400 shrink-0" />
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View profile"
                          >
                            <IconEye size={17} />
                          </button>

                          {user.isActive !== false ? (
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  userId: user._id,
                                  userName: user.name,
                                  action: "block",
                                })
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                              title="Block user"
                            >
                              <IconShieldOff size={13} />
                              Block
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  userId: user._id,
                                  userName: user.name,
                                  action: "unblock",
                                })
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                              title="Unblock user"
                            >
                              <IconShieldCheck size={13} />
                              Unblock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table footer */}
          {filteredUsers.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 text-center">
                {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""} displayed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── User Detail Modal ── */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-100">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconX size={20} className="text-gray-500" />
              </button>
              <h3 className="text-xl font-bold text-gray-900">User Profile</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Account details &amp; management
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-linear-to-br ${getAvatarGradient(selectedUser.name)} flex items-center justify-center text-white text-2xl font-bold select-none`}
                >
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedUser.name}
                  </p>
                  {selectedUser.isActive !== false ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Blocked
                    </span>
                  )}
                </div>
              </div>

              {/* Detail rows */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                  <IconMail size={17} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Email</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                  <IconPhone size={17} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Phone</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {selectedUser.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                  <IconCalendar size={17} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      Member Since
                    </p>
                    <p className="text-sm text-gray-800 font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="px-6 pb-6">
              {selectedUser.isActive !== false ? (
                <button
                  onClick={() => {
                    setConfirmAction({
                      userId: selectedUser._id,
                      userName: selectedUser.name,
                      action: "block",
                    });
                    setSelectedUser(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <IconShieldOff size={17} />
                  Block This User
                </button>
              ) : (
                <button
                  onClick={() => {
                    setConfirmAction({
                      userId: selectedUser._id,
                      userName: selectedUser.name,
                      action: "unblock",
                    });
                    setSelectedUser(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <IconShieldCheck size={17} />
                  Unblock This User
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Block / Unblock Confirmation ── */}
      {confirmAction && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
          onClick={() => !actionLoading && setConfirmAction(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                confirmAction.action === "block"
                  ? "bg-red-100"
                  : "bg-emerald-100"
              }`}
            >
              {confirmAction.action === "block" ? (
                <IconShieldOff size={28} className="text-red-600" />
              ) : (
                <IconShieldCheck size={28} className="text-emerald-600" />
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {confirmAction.action === "block"
                ? "Block User?"
                : "Unblock User?"}
            </h3>

            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              {confirmAction.action === "block" ? (
                <>
                  Are you sure you want to block{" "}
                  <strong className="text-gray-800">
                    {confirmAction.userName}
                  </strong>
                  ? They will be immediately logged out and will not be able to
                  log in until unblocked.
                </>
              ) : (
                <>
                  Are you sure you want to unblock{" "}
                  <strong className="text-gray-800">
                    {confirmAction.userName}
                  </strong>
                  ? They will be able to log in and use the platform again.
                </>
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 ${
                  confirmAction.action === "block"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {actionLoading
                  ? "Please wait…"
                  : confirmAction.action === "block"
                  ? "Yes, Block"
                  : "Yes, Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
