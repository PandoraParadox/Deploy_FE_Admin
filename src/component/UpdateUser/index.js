import styles from "./updateUser.module.css";
import { FaUsers } from "react-icons/fa";
import { FaBoxArchive, FaMoneyCheckDollar } from "react-icons/fa6";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getDatabase, ref, get, update } from "firebase/database";
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../interceptor';

const UpdateUser = () => {
  const { uid } = useParams();
  console.log("uid: ", uid);
  const navigate = useNavigate();
  const { logout } = useAuth();


  const [users, setUsers] = useState({
    name: "",
    email: "",
    role: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [dateError, setDateError] = useState("");

  const { authToken } = useAuth();
  const [uids, setUid] = useState(null);
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
        const userRes = await axiosInstance.get(`${process.env.REACT_APP_APP_API_URL}/api/v1/user/${uids}`);
        setuser(userRes.data);
      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
      }
    };

    if (uids) {
      fetchUser();
    }
  }, [uids]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsers((prev) => ({ ...prev, [name]: value }));

  };


  const handleUpdate = async (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmChange = async () => {
    try {
      console.log("Role being updated:", users.role);

      const response = await fetch(`${process.env.REACT_APP_APP_API_URL}/api/v1/user/update/${uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: users.email,
          displayName: users.name,
          role: users.role,
        }),
      });

      if (!response.ok) throw new Error("Update failed");

      toast.success("User updated successfully!", {
        position: "bottom-right",
        autoClose: 1000,
        onClose: () => navigate("/admin-user"),
      });
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update user.", {
        position: "bottom-right",
        autoClose: 1000,
      });
    }

    setShowModal(false);
  };




  const cancelChange = () => setShowModal(false);
  const handleCancel = () => {
    toast.info("User update canceled.", { position: "bottom-right", autoClose: 1000 });
    navigate("/admin-user");
  };
  const handleNavigation = (path) => navigate(path);
  const handleToLogOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={styles.app}>

      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.adminTitle}>Admin Panel</h2>
        </div>

        <nav className={styles.navMenu}>
          <div
            className={`${styles.navItem} ${styles.active}`}
            onClick={() => handleNavigation("/admin-user")}
          >
            <FaUsers className={styles.navIcon} />
            <span>User Management</span>
          </div>
          <div
            className={styles.navItem}
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

        <div className={styles.userProfile} onClick={handleToLogOut}>
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
        <header className={styles.header}><h1>Update User</h1></header>

        <div className={styles.userUpdate}>
          <form className="form__updateUser" onSubmit={handleUpdate}>
            <div className={styles.userDetails}>
              <div className={styles.userColumn}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={users.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={users.email}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="role">Role</label>
                  <select name="role" value={users.role} onChange={handleChange}>
                    <option >Select role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.userActions}>
              <button type="button" onClick={handleCancel}>Cancel</button>
              <button type="submit">Update</button>
            </div>
          </form>


          {showModal && (
            <div className={styles.notificationAlert}>
              <div className={styles.notification}>
                <p>Are you sure you want to update the information?</p>
                <div className={styles.notificationButton}>
                  <button className={styles.btnConfirm} onClick={confirmChange}>Confirm</button>
                  <button className={styles.btnCancel} onClick={cancelChange}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default UpdateUser;
