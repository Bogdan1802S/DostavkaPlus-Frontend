import { useMemo, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { categories, products } from "../data";
import "./styles/Catalog.css";

export default function Catalog() {
    const { cart, cartTotal, addToCart, orders, role } = useOutletContext();
    const [category, setCategory] = useState(categories[0]);
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get("search") || "";

    const shownProducts = useMemo(
        () =>
            products.filter((product) => {
                const matchesCategory = category === "Все товары" || product.category === category;
                const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase());
                return matchesCategory && matchesSearch;
            }),
        [category, query]
    );

    const activeOrder = orders.find((order) => !["Доставлен", "Отменён"].includes(order.status));
    const cartLines = cart.map((item) => ({
        ...item,
        product: products.find((product) => product.id === item.productId),
    }));

    return (
        <div className="catalog-layout">
            <section className="catalog-main">
                <div className="catalog-toolbar">
                    <h1 className="page-title">Каталог</h1>
                    {query && <button className="clear-search" onClick={() => navigate("/")}>Сбросить поиск</button>}
                </div>

                <div className="catalog-content">
                    <aside className="category-card card">
                        <h2>Категории</h2>
                        {categories.map((item) => (
                            <button
                                key={item}
                                className={`category-item ${category === item ? "selected" : ""}`}
                                onClick={() => setCategory(item)}
                            >
                                {item}
                            </button>
                        ))}
                        <button
                            className={`category-item ${category === "Все товары" ? "selected" : ""}`}
                            onClick={() => setCategory("Все товары")}
                        >
                            Все товары
                        </button>
                    </aside>

                    <div className="product-grid">
                        {shownProducts.map((product) => (
                            <article className="product-card card" key={product.id}>
                                <div className="product-photo" aria-label={`Заглушка изображения: ${product.name}`}>
                                    <span>Фото товара</span>
                                </div>
                                <h3>{product.name.slice(0, 30)}</h3>
                                <div className="product-meta">
                                    <span className="muted">{product.unit}</span>
                                    <strong>{product.price} руб.</strong>
                                </div>
                                <button className="button button-primary add-button" onClick={() => addToCart(product.id)}>
                                    В корзину
                                </button>
                            </article>
                        ))}
                        {!shownProducts.length && <p className="empty-result">Товары не найдены.</p>}
                    </div>
                </div>
            </section>

            <aside className="catalog-sidebar">
                <section className="side-widget card">
                    <h2>Ваша корзина</h2>
                    {cartLines.length ? (
                        <>
                            <ul className="mini-cart">
                                {cartLines.slice(0, 4).map((item) => (
                                    <li key={item.productId}>
                                        <span>{item.product?.name} × {item.quantity}</span>
                                        <span>{(item.product?.price || 0) * item.quantity} руб.</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="side-total"><span>Итого</span><strong>{cartTotal} руб.</strong></div>
                        </>
                    ) : <p className="muted">Корзина пока пуста.</p>}
                    <button className="button button-primary full-button" onClick={() => navigate("/cart")}>
                        Открыть корзину
                    </button>
                </section>

                <section className="side-widget card">
                    <h2>Статус заказа</h2>
                    {activeOrder ? (
                        <>
                            <div className="side-order-heading">
                                <strong>Заказ №{activeOrder.id}</strong>
                                <span className="status-badge status-active">{activeOrder.status}</span>
                            </div>
                            <div className="mini-progress" aria-label={`Статус заказа: ${activeOrder.status}`}>
                                {[0, 1, 2, 3].map((step) => (
                                    <span className={step <= ["Принят", "Собирается", "В пути", "Доставлен"].indexOf(activeOrder.status) ? "passed" : ""} key={step} />
                                ))}
                            </div>
                            <p className="muted">Курьер: {activeOrder.courier || "назначается"}</p>
                            {role === "client" && <button className="text-button" onClick={() => navigate("/client-orders")}>Подробнее</button>}
                        </>
                    ) : <p className="muted">Активных заказов пока нет.</p>}
                </section>

                <div className="delivery-note">
                    <strong>Бесплатная доставка от 1000 руб.</strong>
                    <span>Привозим в удобное для вас время</span>
                </div>
            </aside>
        </div>
    );
}