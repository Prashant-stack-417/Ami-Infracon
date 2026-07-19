import toast from "react-hot-toast";

/**
 * Get user-friendly error message from an axios error object.
 */
export const getErrorMessage = (error, fallbackMessage = "An error occurred") => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request && !error.response) return "Network error. Please check your connection.";
  if (error.message) return error.message;
  if (typeof error === "string") return error;
  return fallbackMessage;
};

/**
 * Handle API errors with toast notifications.
 */
export const handleApiError = (error, options = {}) => {
  const { showToast = true, fallbackMessage = "An error occurred" } = options;

  const message = getErrorMessage(error, fallbackMessage);
  const status = error.response?.status;

  console.error("API Error:", { status, message, error });

  if (!showToast) return;

  if (!error.response) {
    toast.error("Network error. Please check your connection.");
  } else if (status === 401) {
    toast.error("Please login to continue.");
  } else if (status === 403) {
    toast.error("You don't have permission to perform this action.");
  } else if (status === 404) {
    toast.error("Requested resource not found.");
  } else if (status >= 500) {
    toast.error("Server error. Please try again later.");
  } else {
    toast.error(message);
  }
};
