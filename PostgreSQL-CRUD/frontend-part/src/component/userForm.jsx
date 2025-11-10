import React, { useState } from "react";
import { createUser } from "../services/api";

const UserForm = ({ onUserAdded }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    image: null,
    availableDays: [],
  });
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
      setFileName(files[0]?.name || "");
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleDayChange = (e) => {
    const day = e.target.value;
    const updatedDays = form.availableDays.includes(day)
      ? form.availableDays.filter((d) => d !== day)
      : [...form.availableDays, day];
    setForm({ ...form, availableDays: updatedDays });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    if (form.image) formData.append("image", form.image);
    formData.append("availableDays", JSON.stringify(form.availableDays));

    await createUser(formData);
    onUserAdded();
    setForm({ name: "", email: "", image: null, availableDays: [] });
    setFileName("");
  };

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-5 bg-gray-900 text-white shadow-2xl rounded-xl space-y-5 border border-gray-700"
      style={{ minHeight: "fit-content" }}
    >
      <h2 className="text-2xl font-bold text-center underline decoration-blue-500">
        Add New User
      </h2>

      <input
        name="name"
        placeholder="Enter name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full px-3 py-2.5 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
      />

      <input
        name="email"
        type="email"
        placeholder="Enter email address"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full px-3 py-2.5 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
      />

      {/* Availability Days */}
      <div>
        <p className="font-semibold mb-2 text-base">Available Days:</p>
        <div className="grid grid-cols-2 gap-3">
          {weekdays.map((day) => (
            <label
              key={day}
              className="flex items-center space-x-2 cursor-pointer select-none text-base"
            >
              <input
                type="checkbox"
                value={day}
                checked={form.availableDays.includes(day)}
                onChange={handleDayChange}
                className="accent-blue-500 cursor-pointer"
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="block text-base">
        <span className="block mb-2 font-semibold">Upload Image</span>
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition select-none text-base">
            Choose File
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>
          <span className="text-sm text-gray-400 truncate max-w-xs">
            {fileName || "No file chosen"}
          </span>
        </div>
      </label>

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-md text-white font-medium text-base transition-colors cursor-pointer"
      >
        ➕ Add User
      </button>
    </form>
  );
};

export default UserForm;
