import logo from './logo.svg';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import {Routes, Route, HashRouter} from "react-router-dom";
import HomePage from "./pages/HomePage";
import theme from "./theme";
import DevicePage from "./pages/DevicePage";

function App() {
  return (
      <ThemeProvider theme={theme}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/devices" element={<DevicePage/>}/>

          </Routes>
        </HashRouter>
      </ThemeProvider>
  );
}

export default App;