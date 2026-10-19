import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { products } from "../data";
import "./styles/Cart.css";

const DELIVERY = 150;

export default function Cart() {
    const { cart, setQuantity, removeFromCart, restoreCartItem, role, setToast } = useOutletContext();
    const navigate = useNavigate();
    const [promo, setPromo] = useState("");
    const [discount, setDiscount] = useState(0);

    const lines = cart.map((item) => ({
        ...item,
        product: products.find((product) => product.id === item.productId),
    })).filter((item) => item.product);

    const subtotal = lines.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal ? subtotal + DELIVERY - discount : 0;

    function applyPromo() {
        if (promo.trim().toUpperCase() === "PLUS10") {
            setDiscount(Math.round(subtotal * 0.1));
            setToast("Промокод применён: скидка 10%");
        } else {
            setDiscount(0);
            setToast(promo ? "Промокод не найден" : "Введите промокод");
        }
    }

    function checkout() {
        if (role !== "client") navigate("/login");
        else navigate("/checkout");
    }

    return (
        <div className="cart-page">
            <section className="cart-products">
                <h1 className="page-title">Корзина</h1>
                {lines.length ? lines.map((item) => (
                    <article className="cart-row card" key={item.productId}>
                        <div className="cart-thumb">Фото</div>
                        <div className="cart-item-info">
                            <strong>{item.product.name}</strong>
                            <span className="muted">{item.product.price} руб. / {item.product.unit}</span>
                        </div>
                        <div className="quantity-control">
                            <button onClick={() => setQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Уменьшить количество">−</button>
                            <strong>{item.quantity}</strong>
                            <button onClick={() => setQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= 99} aria-label="Увеличить количество">+</button>
                        </div>
                        <strong className="line-total">{item.product.price * item.quantity} руб.</strong>
                        <button
                            className="remove-item"
                            aria-label={`Удалить ${item.product.name}`}
                            onClick={() => {
                                const removed = removeFromCart(item.productId);
                                setTimeout(() => {
                                    if (window.confirm("Вернуть товар в корзину?")) restoreCartItem(removed);
                                }, 100);
                            }}
                        >
                            ×
                        </button>
                    </article>
                )) : (
                    <div className="empty-cart card">
                        <p>Корзина пуста.</p>
                        <Link to="/">Перейти в каталог</Link>
                    </div>
                )}
                <Link className="continue-link" to="/">← Продолжить покупки</Link>
            </section>

            <aside className="cart-summary card">
                <h2>Ваш заказ</h2>
                <div className="summary-line"><span>Товары ({lines.reduce((sum, item) => sum + item.quantity, 0)})</span><span>{subtotal} руб.</span></div>
                <div className="summary-line"><span>Доставка</span><span>{subtotal ? `${DELIVERY} руб.` : "0 руб."}</span></div>
                {discount > 0 && <div className="summary-line discount"><span>Скидка</span><span>−{discount} руб.</span></div>}
                <div className="summary-total"><strong>Итого</strong><strong>{total} руб.</strong></div>

                <div className="promo-row">
                    <input className="field" value={promo} maxLength={12} placeholder="Промокод" onChange={(event) => setPromo(event.target.value)} />
                    <button className="button button-outline" onClick={applyPromo}>OK</button>
                </div>
                <button className="button button-primary checkout-button" disabled={!lines.length} onClick={checkout}>
                    Оформить заказ
                </button>
            </aside>
        </div>
    );
}