import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for handling click outside of element
 * @param {Function} handler - Function to call when clicked outside
 * @returns {React.RefObject} Ref to attach to the element
 */
export const useClickOutside = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler]);

  return ref;
};

/**
 * Custom hook for keyboard event handling
 * @param {string} key - Key to listen for
 * @param {Function} callback - Function to call when key is pressed
 * @param {Object} options - Options for event listener
 */
export const useKeyPress = (key, callback, options = {}) => {
  const { enabled = true, preventDefault = false } = options;

  useEffect(() => {
    if (!enabled) return;

    const handler = (event) => {
      if (event.key === key) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [key, callback, enabled, preventDefault]);
};

/**
 * Custom hook for local storage with JSON serialization
 * @param {string} key - Local storage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {[any, Function]} Stateful value and setter function
 */
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
};

/**
 * Custom hook for handling async operations with loading and error states
 * @returns {Object} Object with execute function and state
 */
export const useAsync = () => {
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction) => {
    setStatus("pending");
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus("success");
      return response;
    } catch (error) {
      setError(error);
      setStatus("error");
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  return {
    execute,
    reset,
    status,
    data,
    error,
    isIdle: status === "idle",
    isPending: status === "pending",
    isSuccess: status === "success",
    isError: status === "error",
  };
};

/**
 * Custom hook for handling form state
 * @param {Object} initialValues - Initial form values
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setErrors,
    reset,
  };
};

/**
 * Custom hook for managing modal/dialog state
 * @param {boolean} initialState - Initial open/closed state
 * @returns {Object} Modal state and handlers
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Close on Escape key
  useKeyPress("Escape", close, { enabled: isOpen });

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

/**
 * Custom hook to check if component is mounted
 * Useful for preventing state updates on unmounted components
 * @returns {React.RefObject} Ref that indicates if component is mounted
 */
export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
};

/**
 * Custom hook for throttling values
 * @param {any} value - The value to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {any} Throttled value
 */
export const useThrottle = (value, limit = 300) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(null);

  // Initialize lastRan on mount
  useEffect(() => {
    if (lastRan.current === null) {
      lastRan.current = Date.now();
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};
