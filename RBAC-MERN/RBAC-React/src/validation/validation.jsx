import * as Yup from "yup";

// REGISTER 
export const registerValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().min(6, "Password should be at least 6 characters").required("Password is required"),

  role: Yup.string().required("Role is required"),

  contact: Yup.object({
    phone: Yup.string().required("Phone number is required"),
  }),

  address: Yup.object({
    street: Yup.string().required("Street is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    country: Yup.string().required("Country is required"),
  }),
});

// LOGIN 
export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address.")
    .required("Email is required."),
    password: Yup.string()
    .min(6, "Password must be at least 6 characters long.")
    .matches(/[a-z]/, "Include at least one lowercase letter.")
    .matches(/[A-Z]/, "Include at least one uppercase letter.")
    .matches(/\d/, "Include at least one number.")
    .required("Please choose a secure password.")
});

// USER - CREATE / UPDATE
export const userValidationSchema = Yup.object({
  name: Yup.string()
  .required("Please enter your full name."),

  email: Yup.string()
  .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address.")
  .required("Email is required."),  

password: Yup.string()
  .min(6, "Password must be at least 6 characters long.")
  .matches(/[a-z]/, "Include at least one lowercase letter.")
  .matches(/[A-Z]/, "Include at least one uppercase letter.")
  .matches(/\d/, "Include at least one number.")
  .required("Please choose a secure password."),

role: Yup.string().required("Please select a role."),
});

// PRODUCT - CREATE / UPDATE
export const productValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters.")
    .required("Product name is required."),
  description: Yup.string()
    .min(5, "Description must be at least 5 characters.")
    .required("Product description is required."),
  price: Yup.number()
    .typeError("Price must be a number.")
    .min(0, "Price cannot be negative.")
    .required("Product price is required."),
    categories: Yup.array()
    .of(Yup.string().required())
    .min(1, "Select at least one category")
    .required("Product category is required."),  
  quantity: Yup.number()
    .typeError("Quantity must be a number.")
    .integer("Quantity must be an integer.")
    .min(0, "Quantity cannot be negative.")
    .required("Product quantity is required."),
});

