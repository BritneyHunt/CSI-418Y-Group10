

import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from './Login';
import SignUp from './Signup.js';
import HomePage from "./HomePage.js";
import EmployeeHomePage from './EmployeeHomePage'; // Add EmployeeHomePage component
import EmployeeShifts from './EmployeeShifts'; // Import your EmployeeShifts component



function App() {
  return ( 
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/"element= {<Login/>}></Route>
      <Route path="/Login" element={<Login/>}></Route>
      <Route path="/Signup" element={<SignUp/>}></Route>
      <Route path = "/HomePage" element = {<HomePage/>}/>
      {/* Employee routes */}
      <Route path="/EmployeeHomePage" element={<EmployeeHomePage />} /> {/* Employee HomePage */}
      <Route path="/EmployeeShifts" element={<EmployeeShifts />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;