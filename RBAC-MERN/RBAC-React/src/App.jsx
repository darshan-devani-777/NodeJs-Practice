import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; 
import Header from "./components/header";
import Register from "./components/register"; 

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/register" element={<Register />} /> 
        <Route path="/" element={<Navigate to="/register" />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
