const { z } = require("zod");

const userSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .nonempty("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(10, "Name must not exceed 10 characters")
    .refine((val) => /^[A-Za-z\s]+$/.test(val), {
      message: "Name can only contain letters and spaces",
    })
    .refine((val) => /[aeiouAEIOU]/.test(val), {
      message: "Name must contain at least one vowel (a, e, i, o, u)",
    })
    .refine((val) => !/([a-zA-Z])\1{2,}/.test(val), {
      message: "Name cannot contain repeating letters (e.g. aaa, ddd)",
    }),

  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .nonempty("Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(20, "Password must not exceed 20 characters")
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must include at least one lowercase letter",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must include at least one uppercase letter",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must include at least one number",
    })
    .refine((val) => /[@$!%*?&]/.test(val), {
      message:
        "Password must include at least one special character (e.g. @, $, !, %)",
    }),
});

exports.validateWithZod = (data) => {
  const result = userSchema.safeParse(data);

  if (!result.success) {
    const errors = {};
    if (Array.isArray(result.error.issues)) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      });
    }

    return {
      isValid: false,
      message: "Validation failed",
      errors,
    };
  }

  return { isValid: true, errors: {} };
};
