import SignUpPage from "./SignUpPage/SignUpPage";
import SignInPage from "./SignInPage/SignInPage";
import Welcome from "./Welcome/Welcome";
import Vegetables from "./vegetables/vegetables";
import { BrowserRouter,Routes,Route } from "react-router-dom";
import { CartProvider } from "./CartContext/CartContext";
import CheckOutPage from "./CheckOutPage/CheckOutPage";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminProducts from "./Admin/AdminProducts";
import AdminOrders from "./Admin/AdminOrders";
import AdminCustomers from "./Admin/AdminCustomers";
import UserDashboard from "./UserDashboard/UserDashboard";
import AdminRoute from "./Admin/AdminRoute";

function App(){
  return (
    <div>
      <CartProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUpPage/>}/>
        <Route path="/signin" element={<SignInPage/>}/>
        <Route path="/signup" element={<SignUpPage/>}/>
        <Route path="/welcome" element={<Welcome/>}/>
        <Route path="/vegetables" element={<Vegetables/>} />
        <Route path="/checkout" element={<CheckOutPage/>}/>
        
        {/* User Routes */}
        <Route path="/user/dashboard" element={<UserDashboard/>}/>
        
        {/* Admin Routes - Protected */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard/></AdminRoute>}/>
        <Route path="/admin/products" element={<AdminRoute><AdminProducts/></AdminRoute>}/>
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders/></AdminRoute>}/>
        <Route path="/admin/customers" element={<AdminRoute><AdminCustomers/></AdminRoute>}/>
      </Routes>
      </BrowserRouter>
      </CartProvider>
      </div>
  )
}
export default App;