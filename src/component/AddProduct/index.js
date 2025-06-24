import styles from "./addProduct.module.css";
import { FaUsers } from "react-icons/fa";
import { FaMoneyCheckDollar, FaBoxArchive } from "react-icons/fa6";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import axiosInstance from "../../interceptor";
import { jwtDecode } from 'jwt-decode';


function AddProduct() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [files, setFiles] = useState([]);
    const [prevFiles, setPrevFiles] = useState([]);
    const [id, setId] = useState(0);
    const [prod, setProd] = useState({
        "name": "",
        "startingPrice": "",
        "auctionTime": "",
        "category": "",
        "description": "",
    });
    const { authToken } = useAuth();
    const [uid, setUid] = useState(null);
    const [user, setuser] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        clearTimeout(window.priceValidationTimeout);

        if (name === "startingPrice") {
            const numericValue = value.replace(/\D/g, '');

            window.priceValidationTimeout = setTimeout(() => {
                if (!/^\d*$/.test(numericValue) || Number(numericValue) < 0) {
                    toast.error('Please enter a valid number!', {
                        position: 'bottom-right',
                        autoClose: 1000``
                    });
                    return;
                }
            }, 700);

            setProd((prevProd) => ({
                ...prevProd,
                [name]: numericValue ? new Intl.NumberFormat('vi-VN').format(numericValue) + ' VND' : '',
            }));
        } else {
            setProd((prevProd) => ({
                ...prevProd,
                [name]: value,
            }));
        }
    };


    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length + files.length > 4) {
            toast.error('Bạn chỉ có thể chọn tối đa 4 ảnh!', {
                position: 'bottom-right',
                autoClose: 2000
            });
            return;
        }
        console.log("Files selected:", newFiles);
        const filePreviews = newFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setPrevFiles(newFiles => [...newFiles, ...filePreviews]);
        setFiles(prevFiles => [
            ...prevFiles,
            ...newFiles.map(file => file)
        ]);
    };

    const handleShowModal = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const confirmChange = async () => {
        if (!files || files.length === 0) {
            toast.error("Vui lòng chọn ít nhất một ảnh!", {
                position: "bottom-right",
                autoClose: 2000
            });
            return;
        }

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append("images", file);
            });

            const plainPrice = prod.startingPrice.replace(/[^\d]/g, '');
            const localTime = new Date(prod.auctionTime);
            const vnTime = new Date(localTime.getTime() - localTime.getTimezoneOffset() * 60000);
            const formattedTime = vnTime.toISOString().slice(0, 19).replace("T", " ");

            formData.append("name", prod.name);
            formData.append("startingPrice", plainPrice);
            formData.append("auctionTime", formattedTime);
            formData.append("category", prod.category);
            formData.append("description", prod.description);

            const response = await axios.post(`${process.env.REACT_APP_APP_API_URL}/api/v1/products`, formData);
            console.log("Response status:", response.status);
            if (response.status >= 200 && response.status < 300) {
                setShowModal(false);
                setFiles([]);
                setPrevFiles([]);
                toast.success("Thêm sản phẩm thành công!", {
                    position: "bottom-right",
                    autoClose: 1500,
                    onClose: () => navigate("/admin-product")
                });
            }

        } catch (error) {
            console.error("Lỗi khi gửi sản phẩm:", error);
            toast.error("Thêm sản phẩm thất bại!", {
                position: 'bottom-right',
                autoClose: 2000
            });
        }
    };

    const cancelChange = () => {
        setShowModal(false);
    };

    const handleCancel = () => {
        toast.error('Add Product Canceled', {
            position: 'bottom-right',
            autoClose: 1500,
            onClose: () => navigate('/admin-product')
        });
    };

    const handleRefresh = () => {
        setFiles([]);
        setPrevFiles([]);
    }

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

    const handleNavigation = (path) => navigate(path);
    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
        navigate("/");
    }

    return (
        <>
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
                    <div className={styles.title}><h1>Add Product</h1></div>
                    <div className={styles.contentBox}>
                        <form className={styles.form__updateProduct}>
                            <div className={styles.inforBox}>
                                <div className={styles.field}>
                                    <input type="text" name="name" placeholder="Name product" onChange={handleChange} autoComplete="off" />
                                </div>
                                <div className={styles.field}>
                                    <input type="text" name="startingPrice" placeholder="Starting price" onChange={handleChange} autoComplete="off" />
                                </div>
                                <div className={styles.field}>
                                    <input type="datetime-local" name="auctionTime" onChange={handleChange} autoComplete="off" />
                                </div>
                                <div className={styles.cateField}>

                                    <select className={styles.cateSelect} name="category" onChange={handleChange}>
                                        <option value="" >Category</option>
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
                                    <textarea className={styles.tarea} name="description" onChange={handleChange} placeholder="Product description"></textarea>
                                </div>
                            </div>
                        </form>

                        <div className={styles.imageBox}>
                            <div className={styles.imgArea}>
                                {prevFiles.length > 0 ? (
                                    prevFiles.map((img, index) => (
                                        <div key={index} className={styles.previewImg}>
                                            <img src={img.preview} alt={`Preview ${index + 1}`} />
                                        </div>
                                    ))
                                ) : (
                                    <label className={styles.fileUpload}>+
                                        <input className={styles.uploadImg} type="file" multiple id="fileInput" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                            <div className={styles.refreBtn} onClick={handleRefresh}>Refresh</div>
                        </div>
                    </div>

                    <div className={styles.btn}>
                        <div className={styles.cancelBtn} onClick={handleCancel}>Cancel</div>
                        <div className={styles.uploadBtn} onClick={handleShowModal}>Add</div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className={styles.notificationAlert}>
                    <div className={styles.notification}>
                        <p>Are you sure you want to add the product?</p>
                        <div className={styles.notificationButton}>
                            <button className={styles.btnConfirm} onClick={confirmChange}>Confirm</button>
                            <button className={styles.btnCancel} onClick={cancelChange}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </>
    );
}

export default AddProduct;
