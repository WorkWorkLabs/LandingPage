import { ref, reactive } from 'vue'

type ValidationRule<T = any> = (value: T) => string | null
type ValidationRules = Record<string, ValidationRule>

export function useFormValidation(rules: ValidationRules) {
  const errors = ref<Record<string, string | null>>({})
  
  const validateField = (fieldName: string, value: any): boolean => {
    const rule = rules[fieldName]
    if (rule) {
      const error = rule(value)
      errors.value[fieldName] = error
      return !error
    }
    return true
  }
  
  const validateAllFields = (formData: Record<string, any>): boolean => {
    let isValid = true
    
    for (const fieldName in rules) {
      const fieldValid = validateField(fieldName, formData[fieldName])
      if (!fieldValid) {
        isValid = false
      }
    }
    
    return isValid
  }
  
  const clearErrors = () => {
    for (const field in errors.value) {
      errors.value[field] = null
    }
  }
  
  const clearFieldError = (fieldName: string) => {
    errors.value[fieldName] = null
  }
  
  return {
    errors,
    validateField,
    validateAllFields,
    clearErrors,
    clearFieldError
  }
}