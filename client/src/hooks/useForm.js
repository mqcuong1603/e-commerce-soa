import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for handling form state, validation, and submission
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.initialValues - Initial form values
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Function} options.validate - Form validation function
 * @param {boolean} options.validateOnChange - Whether to validate on change (default: true)
 * @param {boolean} options.validateOnBlur - Whether to validate on blur (default: true)
 * @param {boolean} options.validateOnSubmit - Whether to validate on submit (default: true)
 * @returns {Object} - Form state and handlers
 */
const useForm = ({
  initialValues = {},
  onSubmit,
  validate,
  validateOnChange = true,
  validateOnBlur = true,
  validateOnSubmit = true,
}) => {
  // Form state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Validate form values
  const validateForm = useCallback(() => {
    if (typeof validate !== "function") return {};

    const validationErrors = validate(values);
    setErrors(validationErrors || {});
    setIsValid(Object.keys(validationErrors || {}).length === 0);

    return validationErrors || {};
  }, [values, validate]);

  // Run validation when values change if validateOnChange is true
  useEffect(() => {
    if (validateOnChange && submitCount > 0) {
      validateForm();
    }
  }, [values, validateOnChange, submitCount, validateForm]);

  // Handle form field change
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;

    // Handle different input types
    const inputValue = type === "checkbox" ? checked : value;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: inputValue,
    }));
  }, []);

  // Handle manual value setting
  const setValue = useCallback((name, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  // Handle multiple values at once
  const setMultipleValues = useCallback((newValues) => {
    setValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
  }, []);

  // Handle form field blur
  const handleBlur = useCallback(
    (event) => {
      const { name } = event.target;

      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));

      if (validateOnBlur) {
        validateForm();
      }
    },
    [validateOnBlur, validateForm]
  );

  // Mark a field as touched
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: isTouched,
    }));
  }, []);

  // Mark all fields as touched
  const setAllTouched = useCallback(() => {
    const touchedFields = {};

    Object.keys(values).forEach((key) => {
      touchedFields[key] = true;
    });

    setTouched(touchedFields);
  }, [values]);

  // Handle form submission
  const handleSubmit = useCallback(
    (event) => {
      if (event) {
        event.preventDefault();
      }

      setSubmitCount((count) => count + 1);

      // Validate form before submission if validateOnSubmit is true
      let formErrors = {};
      if (validateOnSubmit) {
        formErrors = validateForm();

        // Mark all fields as touched on submit
        setAllTouched();
      }

      // If there are no errors or validation is not required on submit, call onSubmit
      if (!validateOnSubmit || Object.keys(formErrors).length === 0) {
        setIsSubmitting(true);

        if (typeof onSubmit === "function") {
          Promise.resolve(onSubmit(values, { setValues, setErrors })).finally(
            () => {
              setIsSubmitting(false);
            }
          );
        } else {
          setIsSubmitting(false);
        }
      }
    },
    [values, validateOnSubmit, validateForm, setAllTouched, onSubmit]
  );

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitCount(0);
  }, [initialValues]);

  // Set a specific error message
  const setFieldError = useCallback((name, errorMessage) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  }, []);

  // Set multiple errors at once
  const setMultipleErrors = useCallback((errorMessages) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      ...errorMessages,
    }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    submitCount,

    // Form handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Helper methods
    setValue,
    setMultipleValues,
    setFieldTouched,
    setAllTouched,
    resetForm,
    setFieldError,
    setMultipleErrors,
    clearErrors,

    // Form fields getter for easier binding
    getFieldProps: (name) => ({
      name,
      value: values[name] || "",
      onChange: handleChange,
      onBlur: handleBlur,
    }),
  };
};

export default useForm;
