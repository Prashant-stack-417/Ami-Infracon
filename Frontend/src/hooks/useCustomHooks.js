import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Debounce a value.
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Detect clicks outside a ref'd element.
 */
export const useClickOutside = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
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
 * Fire a callback when a specific key is pressed.
 */
export const useKeyPress = (key, callback, options = {}) => {
  const { enabled = true, preventDefault = false } = options;

  useEffect(() => {
    if (!enabled) return;
    const handler = (event) => {
      if (event.key === key) {
        if (preventDefault) event.preventDefault();
        callback(event);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, enabled, preventDefault]);
};

/**
 * Handle form state (values, errors, touched).
 */
export const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleBlur = useCallback((e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
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

  return { values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldError, setErrors, reset };
};

/**
 * Manage modal open/close state with Escape-key support.
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  useKeyPress("Escape", close, { enabled: isOpen });
  return { isOpen, open, close, toggle };
};

/**
 * Track if a component is mounted. Useful for preventing state updates after unmount.
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
