import styles from "./adminUser.module.css";
import { FaUsers, FaTrash, FaSignOutAlt } from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";
import { BiSolidEditAlt } from "react-icons/bi";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../interceptor";
import { jwtDecode } from 'jwt-decode';
import { getAuth } from 'firebase/auth';

function AdminUser() {
    const [data, setData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { authToken, logout } = useAuth();
    const [uid, setUid] = useState(null);
    const [user, setUser] = useState(null);
    const auth = getAuth();

    const handleDeleteUser = (uid) => {
        setUserToDelete(uid);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setIsLoading(true);
        try {
            await axiosInstance.delete(`${process.env.REACT_APP_APP_API_URL}/api/v1/user/delete/${userToDelete}`);
            setData(data.filter(user => user.uid !== userToDelete));
            toast.success("User deleted successfully!", {
                position: "top-center",
                autoClose: 2000,
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user", {
                position: "top-center",
                autoClose: 2000,
            });
        } finally {
            setIsLoading(false);
            setShowModal(false);
        }
    };

    const cancelDelete = () => {
        setShowModal(false);
    };

    const handleNavigation = (path) => navigate(path);
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get(`${process.env.REACT_APP_APP_API_URL}/api/v1/user/get/all`);
                setData(res.data.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };


        fetchUsers();
    }, []);

    useEffect(() => {
        if (authToken) {
            const { sub } = jwtDecode(authToken);
            setUid(sub);
        }
    }, [authToken]);

    useEffect(() => {
        const fetchUser = async () => {
            if (uid) {
                try {
                    const userRes = await axiosInstance.get(`${process.env.REACT_APP_APP_API_URL}/api/v1/user/${uid}`);
                    setUser(userRes.data);
                } catch (err) {
                    console.error("Error fetching user data:", err);
                }
            }
        };

        fetchUser();
    }, [uid]);

    return (
        <div className={styles.adminDashboard}>
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
                <header className={styles.contentHeader}>
                    <h1>User Management</h1>
                </header>

                <div className={styles.statsCard}>
                    <div className={styles.statItem}>
                        <h3>Total Users</h3>
                        <p>{data.length}</p>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>UID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((user) => (
                                <tr key={user.uid}>
                                    <td className={styles.uidCell}>{user.uid}</td>
                                    <td>{user.displayName}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.adminBadge : styles.userBadge
                                            }`}>
                                            {user.role || "none"}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => navigate(`/update-user/${user.uid}`)}
                                        >
                                            <BiSolidEditAlt />
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDeleteUser(user.uid)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={cancelDelete}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmBtn}
                                onClick={confirmDelete}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
}

export default AdminUser;   