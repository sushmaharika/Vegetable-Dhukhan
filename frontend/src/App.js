import SignUpPage from "./SignUpPage/SignUpPage";
import SignInPage from "./SignInPage/SignInPage";
import Welcome from "./Welcome/Welcome";
import { BrowserRouter,Routes,Route } from "react-router-dom";
function App(){
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUpPage/>}/>
        <Route path="/signin" element={<SignInPage/>}/>
        <Route path="/signup" element={<SignUpPage/>}/>
        <Route path="/welcome" element={<Welcome/>}/>
      </Routes>
      </BrowserRouter>
      </div>
  )
}
export default App;