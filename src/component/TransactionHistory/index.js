import styles from "./transaction.module.css";
import { FaMoneyCheckDollar, FaBoxArchive } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { formatCurrency } from "../../util/format";
import { get } from "firebase/database";
import axiosInstance from "../../interceptor";
import { jwtDecode } from 'jwt-decode';

function TransactionHistory() {
    const [originalData, setOriginalData] = useState([]);
    const [data, setData] = useState([]);
    const [date, setDate] = useState("");
    const [search, setSearch] = useState("");
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
        const fetchTransactionsWithUsers = async () => {
            try {
                const transactionsRes = await axiosInstance.get(`${process.env.REACT_APP_APP_API_URL}/api/v1/wallet/gettrans/all`);
                const transactions = transactionsRes.data;
                const userIds = [...new Set(transactions.map(t => t.user_id))];

                const userRequests = userIds.map(uid => axiosInstance.get(`${process.env.REACT_APP_APP_API_URL}/api/v1/user/${uid}`)
                    .then(res => ({ uid, displayName: res.data.displayName || "Unknown" }))
                    .catch(() => ({ uid, displayName: "Unknown" }))
                );
                const userResults = await Promise.all(userRequests);
                const userMap = Object.fromEntries(
                    userResults.map(({ uid, displayName }) => [uid, displayName])
                );
                const transactionsWithNames = transactions.map(t => ({
                    ...t,
                    displayName: userMap[t.user_id] || "Unknown",
                    formattedDate: new Date(t.created_at).toLocaleString()
                }));

                setData(transactionsWithNames);
                setOriginalData(transactionsWithNames);

            } catch (err) {
                console.error("Lỗi fetch dữ liệu:", err);
            }
        };

        fetchTransactionsWithUsers();

    }, []);

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


    function formatCurrency(amount) {
        return Math.trunc(amount).toLocaleString("vi-VN");
    }


    const handleSearch = (e) => {
        e.preventDefault();

        const filtered = originalData.filter((item) => {
            const matchDate = date ? item.date === date : true;
            const matchSearch =
                search === "" ||
                item.type.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase()) ||
                item.displayName.toLowerCase().includes(search.toLowerCase());
            return matchDate && matchSearch;
        });

        setData(filtered);
    };
    const handleNavigation = (path) => navigate(path);

    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
        navigate("/");
    }


    return (
        <div className={styles.ui}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.adminTitle}>Admin Panel</h2>
                </div>

                <nav className={styles.navMenu}>
                    <div
                        className={`${styles.navItem}`}
                        onClick={() => handleNavigation("/admin-user")}
                    >
                        <FaUsers className={styles.navIcon} />
                        <span>User Management</span>
                    </div>
                    <div
                        className={`${styles.navItem} `}
                        onClick={() => handleNavigation("/admin-product")}
                    >
                        <FaBoxArchive className={styles.navIcon} />
                        <span>Product Management</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${styles.active}`}
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

            <main className={styles.mainBox}>
                <h1 className={styles.title}><h1>Transaction History</h1></h1>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <h3 className={styles.infor}>Total Payments</h3>
                        <p className={styles.infor}>{data.length}</p>
                    </div>
                </div>


                <form className={styles.searchBar} onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by Email or Content"
                    />
                    <form className={styles.searchForm} onSubmit={handleSearch}>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Select Date" />
                    </form>
                    <button type="submit" className={styles.addProductIcon}>
                        <IoSearch />
                    </button>
                </form>

                <div className={styles.scrollableDiv}>
                    <table className={styles.userTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Action</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((t, index) => (
                                <tr key={t.id}>
                                    <td className={styles.uidCell}>{t.id}</td>
                                    <td>{t.displayName}</td>
                                    <td>{t.type}</td>
                                    <td>{formatCurrency(t.amount)} VND</td>
                                    <td>{t.description}</td>
                                    <td>{new Date(t.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </main>
        </div>
    );
}

export default TransactionHistory;
