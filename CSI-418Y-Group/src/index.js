import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import HomePage from './HomePage.js'; 
import MenuManagement from './MenuManagement.js';
import MakeOrder from './MakeOrder.js';
import CheckoutPage from './CheckOutPage';
import EmployeeHomePage from './EmployeeHomePage'; // Import EmployeeHomePage
import EmployeeShifts from './EmployeeShifts'; // Import EmployeeShifts component
import InventoryPage from './InventoryPage.js';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path = "/" element = {<Login/>}/>
    <Route path = "/Login" element = {<Login/>}/>
    <Route path = "/Signup" element = {<Signup/>}/>
    <Route path = "/HomePage" element = {<HomePage/>}/>
    <Route path="/menu" element={<MenuManagement />} />
    <Route path="/makeOrder" element={<MakeOrder />} />
    <Route path="/CheckOutPage/:orderId" element={<CheckoutPage />} />
    <Route path="/EmployeeHomePage" element={<EmployeeHomePage />} /> {/* Route for EmployeeHomePage */}
    <Route path="/EmployeeShifts" element={<EmployeeShifts />} /> {/* Route for EmployeeShifts */}
    <Route path="/InventoryPage" element={<InventoryPage/>}/>
    </>
  )
)
root.render(
  <React.StrictMode>
    <RouterProvider router = {router}>
        <App />
    </RouterProvider>
  </React.StrictMode>
);

reportWebVitals();


reportWebVitals();