import "./App.css";
import MapView from "../src/components/MapView";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <MapView />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
