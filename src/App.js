import { Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import LayoutDefault from './LayoutDefault/index';
import AdminUser from './component/AdminUser/index';
import AdminProduct from './component/AdminProduct/index';
import UpdateProduct from './component/UpdateProduct';
import UpdateUser from './component/UpdateUser/index';
import AddProduct from './component/AddProduct/index';
import Login from './component/Login';
import TransactionHistory from './component/TransactionHistory/index';

const PrivateRoute = ({ children }) => {
  const { authToken } = useAuth();
  return authToken ? children : <Navigate to="/" />;
};

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>

          <Route path="/" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <LayoutDefault />
              </PrivateRoute>
            }
          >

            <Route path='admin-user' element={<AdminUser />} />
            <Route path='add-product' element={<AddProduct />} />
            <Route path='admin-product' element={<AdminProduct />} />
            <Route path='update-product/:id' element={<UpdateProduct />} />
            <Route path='update-user/:uid' element={<UpdateUser />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
            <Route path="transaction-history" element={<TransactionHistory />} />

          </Route>
        </Routes>
      </AuthProvider>

    </>
  )
}
export default App;
