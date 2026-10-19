import { useEffect, useMemo, useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    Route,
    Routes,
    useLocation,
    useNavigate,
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

function getSavedCart() {
    try {
        const savedCart = localStorage.getItem("delivery-cart");
        return savedCart ? JSON.parse(savedCart) : initialCart;
    } catch {
        return initialCart;
    }
}

function Header({ role, cartCount }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const isStaffPage =
        location.pathname === "/courier-orders" ||
        location.pathname === "/operator-orders";

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

                            <Link className="cart-link" to="/cart">
                                <span aria-hidden="true">▢</span>
                                <span>Корзина ({cartCount})</span>
                            </Link>

                            {role === "client" ? (
                                <button className="profile-button" onClick={logout}>
                                    Профиль <span aria-hidden="true">⌄</span>
                                </button>
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

    const [role, setRole] = useState(
        () => localStorage.getItem("delivery-role") || "guest"
    );
    const [cart, setCart] = useState(getSavedCart);
    const [orders, setOrders] = useState(initialOrders);
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
        if (!toast) return undefined;

        const timer = window.setTimeout(() => {
            setToast("");
            setRemovedCartItem(null);
        }, 4000);

        return () => window.clearTimeout(timer);
    }, [toast]);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        navigate("/client-orders");
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

            <nav className="debug-nav" aria-label="Навигация для отладки">
                <span className="debug-nav__label">Отладка</span>
                <Link to="/">Каталог</Link>
                <Link to="/login">Вход</Link>
                <Link to="/register">Регистрация</Link>
                <Link to="/cart">Корзина</Link>
                <Link to="/checkout">Оформление</Link>
                <Link to="/client-orders">Мои заказы</Link>
                <Link to="/courier-orders">Доставки</Link>
                <Link to="/operator-orders">Все заказы</Link>
            </nav>
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
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/client-orders" element={<ClientOrders />} />
                <Route path="/courier-orders" element={<CourierOrders />} />
                <Route path="/operator-orders" element={<OperatorOrders />} />
                <Route path="*" element={<Catalog />} />
            </Route>
        </Routes>
    );
}