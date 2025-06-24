import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './updateProduct.module.css';
import { FaBoxArchive, FaMoneyCheckDollar } from 'react-icons/fa6';
import { FaUsers } from "react-icons/fa";
import { jwtDecode } from 'jwt-decode';

import axiosInstance from '../../interceptor';
import { useAuth } from "../../context/AuthContext";


function UpdateProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        name: '',
        startingPrice: '',
        auctionTime: '',
        category: '',
        description: ''
    });
    const [showModal, setShowModal] = useState(false);
    const { authToken } = useAuth();
    const [uid, setUid] = useState(null);
    const [user, setuser] = useState(null);

    useEffect(() => {
        axiosInstance.get(`${process.env.REACT_APP_APP_API_URL}/api/v1/products/${id}`)
            .then(res => {
                const data = res.data.data;
                const date = new Date(data.auctionTime);
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                setProduct({
                    ...data,
                    auctionTime: localDate,
                    startingPrice: data.startingPrice.toString()
                });
            })
            .catch(err => console.error('Error fetching product data', err));
    }, [id]);




    const formatCurrency = (value) => {
        if (!value) return "";
        return new Intl.NumberFormat("vi-VN").format(value) + " VND";
    };

    const parseCurrency = (value) => {
        return value.replace(/\D/g, "");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "startingPrice") {
            const numericValue = parseCurrency(value);
            setProduct(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setProduct(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!product.name || !product.startingPrice || !product.auctionTime || !product.category) {
            toast.error('All fields must be filled out!', {
                position: 'bottom-right',
                autoClose: 1500
            });
            return;
        }
        setShowModal(true);
    };

    const confirmChange = () => {
        if (Number(product.startingPrice) < 0) {
            toast.error('Starting Price must be a valid positive number!', {
                position: 'bottom-right',
                autoClose: 1100
            });
            return;
        }
        const rawDate = new Date(product.auctionTime);
        const formattedTime = rawDate.toISOString().slice(0, 19).replace("T", " ");


        const updatedProduct = {
            ...product,
            startingPrice: Number(product.startingPrice),
            auctionTime: formattedTime
        };
        axiosInstance.put(`${process.env.REACT_APP_APP_API_URL}/api/v1/products/${id}`, updatedProduct)
            .then(() => {
                toast.success('Product information updated successfully!', {
                    position: 'bottom-right',
                    autoClose: 1000,
                    onClose: () => navigate('/admin-product')
                });
            })
            .catch(error => {
                console.error('Error updating product', error);
                toast.error('Failed to update product.', {
                    position: 'bottom-right',
                    autoClose: 1100
                });
            });

        setShowModal(false);
    };

    const cancelChange = () => setShowModal(false);

    const handleCancel = () => {
        toast.error('Update Canceled', {
            position: 'bottom-right',
            autoClose: 1100,
            onClose: () => navigate("/admin-product")
        });
    };

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

    const { logout } = useAuth();
    const handleNavigation = (path) => navigate(path);

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

            <div className={styles.mainBox}>
                <div className={styles.title}><h1>Update Products</h1></div>
                <div className={styles.contentBox}>
                    <form className={styles.form__updateProduct} onSubmit={handleUpdate}>
                        <div className={styles.inforBox}>
                            <div className={styles.field}>
                                <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" autoComplete="off" />
                            </div>
                            <div className={styles.field}>
                                <input type="text" name="startingPrice" value={product.startingPrice} onChange={handleChange} placeholder="Starting Price" autoComplete="off" />
                            </div>
                            <div className={styles.field}>
                                <input
                                    type="datetime-local"
                                    name="auctionTime"
                                    value={product.auctionTime}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.cateField}>
                                <select name="category" value={product.category} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                                    <option value="Luxury Watches & Jewelry">Luxury Watches & Jewelry</option>
                                    <option value="Art & Collectibles">Art & Collectibles</option>
                                    <option value="Fashion & Accessories">Fashion & Accessories</option>
                                    <option value="Cars & Vehicles">Cars & Vehicles</option>
                                    <option value="Real Estate">Real Estate </option>
                                    <option value="Sports Memorabilia">Sports Memorabilia</option>
                                    <option value="Music & Entertainment">Music & Entertainment</option>
                                    <option value="Home & Furniture">Home & Furniture</option>
                                    <option value="Toys & Collectibles">Toys & Collectibles</option>
                                </select>
                            </div>
                            <div>
                                <textarea value={product.description} className={styles.tarea} name="description" onChange={handleChange} placeholder="Product description"></textarea>
                            </div>
                        </div>
                        <div className={styles.btn}>
                            <div className={styles.cancelBtn} onClick={handleCancel}>Cancel</div>
                            <button type="button" className={styles.uploadBtn} onClick={handleUpdate}>Upload</button>
                        </div>
                    </form>
                </div>
            </div>

            {showModal && (
                <div className={styles.notificationAlert}>
                    <div className={styles.notification}>
                        <p>Are you sure you want to change the information?</p>
                        <div className={styles.notificationButton}>
                            <button className={styles.btnConfirm} onClick={confirmChange}>Confirm</button>
                            <button className={styles.btnCancel} onClick={cancelChange}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
}

export default UpdateProduct;
