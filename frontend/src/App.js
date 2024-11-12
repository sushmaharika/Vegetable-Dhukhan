import SignUpPage from "./SignUpPage/SignUpPage";
import SignInPage from "./SignInPage/SignInPage";
import Welcome from "./Welcome/Welcome";
import Vegetables from "./vegetables/vegetables";
import { BrowserRouter,Routes,Route } from "react-router-dom";
import { CartProvider } from "./CartContext/CartContext";
import CheckOutPage from "./CheckOutPage/CheckOutPage";
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
      </Routes>
      </BrowserRouter>
      </CartProvider>
      </div>
  )
}
export default App;