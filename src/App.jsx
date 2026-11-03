import { useEffect, useMemo, useState } from "react";
import {
    Link,
    Navigate,
    NavLink,
    Outlet,
    Route,
    Routes,
    useLocation,
    useNavigate,
    useOutletContext,
} from "react-router-dom";

import { initialCart, initialOrders, products } from "./data";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ClientOrders from "./pages/ClientOrders";
import CourierOrders from "./pages/CourierOrders";
import OperatorOrders from "./pages/OperatorOrders";
import OrderTracking from "./pages/OrderTracking";
import OperatorOrderDetail from "./pages/OperatorOrderDetail";
import Payment from "./pages/Payment";

function RequireRole({ allowed, children }) {
    const { role } = useOutletContext();
    return allowed.includes(role) ? children : <Navigate to={role === "guest" ? "/login" : "/"} replace />;
}

function getSavedCart() {
    try {
        const savedCart = localStorage.getItem("delivery-cart");
        return savedCart ? JSON.parse(savedCart) : initialCart;
    } catch {
        return initialCart;
    }
}

function getSavedOrders() {
    try {
        const saved = localStorage.getItem("delivery-orders");
        return saved ? JSON.parse(saved).map((order) => ({ ...order, status: order.status === "Новый" ? "Принят" : order.status })) : initialOrders;
    } catch {
        return initialOrders;
    }
}

function Header({ role, cartCount }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);

    const isStaffPage =
        location.pathname.startsWith("/courier-orders") ||
        location.pathname.startsWith("/operator-orders");

    function handleSearch(event) {
        event.preventDefault();
        navigate(`/?search=${encodeURIComponent(search.slice(0, 50))}`);
    }

    function logout() {
        localStorage.removeItem("delivery-role");
        window.location.href = "/login";
    }

    return (
        <header className="site-header">
            <div className="site-header__inner">
                <Link className="brand" to="/" aria-label="ДоставкаПлюс — каталог">
                    <span className="brand__mark">Д</span>
                    <span className="brand__copy">
            <span className="brand__name">ДоставкаПлюс</span>
            <span className="brand__caption">Продукты у вашей двери</span>
          </span>
                </Link>

                {isStaffPage ? (
                    <div className="staff-heading">
            <span className="staff-heading__label">
              {role === "operator" ? "Кабинет оператора" : "Кабинет курьера"}
            </span>
                    </div>
                ) : (
                    <>
                        <form className="site-search" onSubmit={handleSearch}>
                            <span className="site-search__icon" aria-hidden="true">⌕</span>
                            <input
                                type="search"
                                aria-label="Поиск товаров"
                                placeholder="Поиск товаров…"
                                maxLength={50}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </form>

                        <div className="site-header__actions">
                            {role === "client" && (
                                <nav className="desktop-nav" aria-label="Основная навигация">
                                    <NavLink
                                        className={({ isActive }) =>
                                            `nav-link${isActive ? " nav-link--active" : ""}`
                                        }
                                        to="/client-orders"
                                    >
                                        Мои заказы
                                    </NavLink>
                                </nav>
                            )}

                            {role === "client" && <Link className="cart-link" to="/cart">
                                <svg className="cart-link__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M3.5 4.5h2l2.1 10.1a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4l1.4-6.3H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="19.5" r="1.25" fill="currentColor"/><circle cx="17" cy="19.5" r="1.25" fill="currentColor"/></svg>
                                <span>Корзина ({cartCount})</span>
                            </Link>}

{role === "client" ? (
                                <div className="profile-menu">
                                    <button className="profile-button" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}>
                                        Профиль <svg className={`profile-chevron${profileOpen ? " profile-chevron--open" : ""}`} aria-hidden="true" viewBox="0 0 12 8" fill="none"><path d="m2 2 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>
                                    {profileOpen && <button className="profile-menu__logout" onClick={logout}>Выйти</button>}
                                </div>
                            ) : (
                                <Link className="login-link" to="/login">
                                    Войти
                                </Link>
                            )}
                        </div>
                    </>
                )}

                {isStaffPage && (
                    <div className="staff-actions">
                        {role === "courier" && <span className="online-label">На линии</span>}
                        <button className="profile-button" onClick={logout}>Выйти</button>
                    </div>
                )}
            </div>

            {role === "client" && !isStaffPage && (
                <nav className="mobile-nav" aria-label="Разделы клиента">
                    <Link to="/client-orders">Мои заказы</Link>
                    <Link to="/cart">Корзина</Link>
                    <button onClick={logout}>Выйти</button>
                </nav>
            )}
        </header>
    );
}

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [role, setRole] = useState(
        () => localStorage.getItem("delivery-role") || "guest"
    );
    const [cart, setCart] = useState(getSavedCart);
    const [orders, setOrders] = useState(getSavedOrders);
    const [courierOnline, setCourierOnline] = useState(true);
    const [toast, setToast] = useState("");
    const [removedCartItem, setRemovedCartItem] = useState(null);

    useEffect(() => {
        localStorage.setItem("delivery-cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem("delivery-role", role);
    }, [role]);

    useEffect(() => {
        localStorage.setItem("delivery-orders", JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        if (!toast) return undefined;

        const timer = window.setTimeout(() => {
            setToast("");
            setRemovedCartItem(null);
        }, 4000);

        return () => window.clearTimeout(timer);
    }, [toast]);

    const cartCount = Math.min(99, cart.length);

    const cartTotal = cart.reduce((sum, item) => {
        const product = products.find((entry) => entry.id === item.productId);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    function addToCart(productId) {
        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (item) => item.productId === productId
            );

            if (existingItem) {
                return currentCart.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: Math.min(99, item.quantity + 1) }
                        : item
                );
            }

            return [...currentCart, { productId, quantity: 1 }];
        });

        setToast("Товар добавлен в корзину");
    }

    function setQuantity(productId, quantity) {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item.productId === productId
                    ? {
                        ...item,
                        quantity: Math.max(1, Math.min(99, quantity)),
                    }
                    : item
            )
        );
    }

    function removeFromCart(productId) {
        const itemToRemove = cart.find((item) => item.productId === productId);

        setCart((currentCart) =>
            currentCart.filter((item) => item.productId !== productId)
        );

        setRemovedCartItem(itemToRemove || null);
        setToast("Товар удалён из корзины");
    }

    function undoRemoveFromCart() {
        if (!removedCartItem) return;

        setCart((currentCart) => {
            const alreadyExists = currentCart.some(
                (item) => item.productId === removedCartItem.productId
            );

            if (alreadyExists) {
                return currentCart.map((item) =>
                    item.productId === removedCartItem.productId
                        ? {
                            ...item,
                            quantity: Math.min(99, item.quantity + removedCartItem.quantity),
                        }
                        : item
                );
            }

            return [...currentCart, removedCartItem];
        });

        setRemovedCartItem(null);
        setToast("Товар возвращён в корзину");
    }

    function placeOrder(details) {
        const nextId =
            Math.max(1023, ...orders.map((order) => Number(order.id) || 0)) + 1;

        const nextOrder = {
            id: nextId,
            customer: "Анна С.",
            phone: details.phone,
            address: details.address,
            shortAddress: details.address,
            date: details.date,
            time: details.time,
            total: details.total,
            status: "Принят",
            payment: details.payment,
            courier: "",
            items: cart.map((item) => ({ ...item })),
        };

        setOrders((currentOrders) => [nextOrder, ...currentOrders]);
        setCart([]);
        setRole("client");
        setToast("Заказ оформлен");
        navigate(`/payment/${nextId}`);
    }

    const contextValue = useMemo(
        () => ({
            role,
            setRole,
            cart,
            setCart,
            cartCount,
            cartTotal,
            orders,
            setOrders,
            courierOnline,
            setCourierOnline,
            toast,
            setToast,
            addToCart,
            setQuantity,
            removeFromCart,
            undoRemoveFromCart,
            placeOrder,
        }),
        [role, cart, cartCount, cartTotal, orders, courierOnline, toast]
    );

    return (
        <div className="app-shell">
            <Header role={role} cartCount={cartCount} />

            <main className="site-main">
                <Outlet context={contextValue} />
            </main>

            {toast && (
                <div className="toast-message" role="status">
                    <span>{toast}</span>
                    {removedCartItem && (
                        <button onClick={undoRemoveFromCart}>Отменить</button>
                    )}
                </div>
            )}

        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Catalog />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<RequireRole allowed={["client"]}><Cart /></RequireRole>} />
                <Route path="/checkout" element={<RequireRole allowed={["client"]}><Checkout /></RequireRole>} />
                <Route path="/client-orders" element={<RequireRole allowed={["client"]}><ClientOrders /></RequireRole>} />
                <Route path="/track/:orderId" element={<RequireRole allowed={["client"]}><OrderTracking /></RequireRole>} />
                <Route path="/payment/:orderId" element={<RequireRole allowed={["client"]}><Payment /></RequireRole>} />
                <Route path="/courier-orders" element={<RequireRole allowed={["courier"]}><CourierOrders /></RequireRole>} />
                <Route path="/operator-orders" element={<RequireRole allowed={["operator"]}><OperatorOrders /></RequireRole>} />
                <Route path="/operator-orders/:orderId" element={<RequireRole allowed={["operator"]}><OperatorOrderDetail /></RequireRole>} />
                <Route path="*" element={<Catalog />} />
            </Route>
        </Routes>
    );
}
