import styles from "./adminproduct.module.css";
import { FaUsers, FaTrash } from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";
import { BiSolidInbox } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axiosInstance from "../../interceptor";
import { url } from "../../util/Url";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from './../../util/format';
import { jwtDecode } from 'jwt-decode';
import { BiSolidEditAlt } from "react-icons/bi";


function AdminProduct() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [uid, setUid] = useState(null);
  const [user, setuser] = useState(null);

  useEffect(() => {
    if (authToken) {
      const { sub } = jwtDecode(authToken);
      setUid(sub);
    }
  }, [authToken]);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await axiosInstance.get(`${process.env.REACT_APP_APP_API_URL}/api/v1/user/${uid}`);
        setuser(userRes.data);
      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
      }
    };

    if (uid) {
      fetchUser();
    }
  }, [uid]);


  useEffect(() => {
    console.log("Get all product")
    axiosInstance.get(`${process.env.REACT_APP_APP_API_URL}/api/v1/products`)
      .then((res) => {
        console.log(res.data.data);
        setData(res.data.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDeleteProduct = (id) => {
    setProductToDelete(id);
    setShowModal(true);
  };

  const confirmChange = (id) => {
    axiosInstance.delete(`${process.env.REACT_APP_APP_API_URL}/api/v1/products/${id}`)
      .then(() => {
        setData(data.filter((product) => product.id !== id));
        setShowModal(false);
        toast.success("Product has been successfully deleted!", {
          position: "bottom-right",
          autoClose: 1500,
        });
      })
      .catch((err) => {
        console.error("Error deleting product:", err);
        toast.error("Failed to delete product.");
      });
  };
  const handleSearch = async (e) => {
    const search = e.target.value;
    try {
      const response = await axiosInstance.get(
        `${process.env.REACT_APP_APP_API_URL}/api/v1/search?query=${encodeURIComponent(search)}`
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  function formatCurrency(amount) {
    return Math.trunc(amount).toLocaleString("vi-VN");
  }
  const cancelChange = () => {
    setShowModal(false);
  };

  const handleNavigation = (path) => navigate(path);
  const handleToAddProduct = () => {
    navigate("/add-product");
  };
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/");
  }

  return (
    <>
      <div className={styles.app}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.adminTitle}>Admin Panel</h2>
          </div>

          <nav className={styles.navMenu}>
            <div
              className={`${styles.navItem} `}
              onClick={() => handleNavigation("/admin-user")}
            >
              <FaUsers className={styles.navIcon} />
              <span>User Management</span>
            </div>
            <div
              className={`${styles.navItem} ${styles.active}`}
              onClick={() => handleNavigation("/admin-product")}
            >
              <FaBoxArchive className={styles.navIcon} />
              <span>Product Management</span>
            </div>
            <div
              className={styles.navItem}
              onClick={() => handleNavigation("/transaction-history")}
            >
              <FaMoneyCheckDollar className={styles.navIcon} />
              <span>Transaction History</span>
            </div>
          </nav>

          <div className={styles.userProfile} onClick={handleLogout}>
            <img
              src={"/user.png"}
              alt="User"
              className={styles.profileImage}
            />
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user?.displayName || "Admin"}</p>
              <p className={styles.profileEmail}>{user?.email || "admin@example.com"}</p>
            </div>
          </div>

        </div>


        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1>Products</h1>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <h3>Total Products</h3>
              <p>{data.length}</p>
            </div>
          </div>

          <div className={styles.searchBar}>
            <input onChange={handleSearch} type="text" placeholder="Search Products" />
            <button className={styles.addProductIcon} onClick={handleToAddProduct}>Add product</button>
          </div>

          <div className={styles.scrollableDiv}>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Categories</th>
                  <th>Price</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((product) => (
                  <tr key={product.id}>
                    <td className={styles.uidCell}>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{formatCurrency(product.startingPrice)} VND</td>
                    <td>{new Date(product.auctionTime).toLocaleString()}</td>
                    <td>
                      <div className={styles.buttonAdmin}>
                        <button onClick={() => navigate(`/update-product/${product.id}`)} className={styles.edit}><BiSolidEditAlt /></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className={styles.delete}><FaTrash /></button>
                      </div>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <div className={styles.notificationAlert}>
          <div className={styles.notification}>
            <p>Are you sure you want to delete this product?</p>
            <div className={styles.notificationButton}>
              <button className={styles.btnConfirm} onClick={() => confirmChange(productToDelete)}>Confirm</button>

              <button className={styles.btnCancel} onClick={cancelChange}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
}

export default AdminProduct;
