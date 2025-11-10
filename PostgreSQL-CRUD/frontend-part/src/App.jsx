import React, { useState } from "react";
import UserForm from "./component/userForm";
import UserList from "./component/userList";

const App = () => {
  const [showUserList, setShowUserList] = useState(false);

  const handleUserAdded = () => {
    setShowUserList(true);
  };

  const handleCancel = () => {
    setShowUserList(false);
  };

  const handleShowList = () => {
    setShowUserList(true);
  };

  return (
    <div className="min-h-screen p-6 relative font-sans">
      {showUserList && (
        <div className="absolute inset-0 z-20  bg-opacity-95 flex flex-col items-center justify-start p-6 backdrop-blur-2xl">
          <button
            onClick={handleCancel}
            className="self-end text-2xl font-bold transition cursor-pointer border rounded-3xl px-2 py-1 hover:bg-gray-700"
            title="Close"
          >
            ❌
          </button>
          <div className="">
            <UserList />
          </div>
        </div>
      )}

      <div
        className={`${
          showUserList ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        <div className="max-w-xl mx-auto">
          <UserForm onUserAdded={handleUserAdded} />

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleShowList}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition cursor-pointer"
            >
              📋 Show User List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
