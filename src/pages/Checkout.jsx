import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { products } from "../data";
import "./styles/Checkout.css";

function toDateInputValue(date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}

export default function Checkout() {
    const { cart, cartTotal, placeOrder, role } = useOutletContext();
    const navigate = useNavigate();
    const today = new Date();
    const maxDay = new Date();
    maxDay.setDate(today.getDate() + 7);

    const [address, setAddress] = useState("г. Ростов-на-Дону, ул. Садовая, д. 10, кв. 5");
    const [phone, setPhone] = useState("+7 900 123-45-67");
    const [date, setDate] = useState(toDateInputValue(today));
    const [time, setTime] = useState("");
    const [payment, setPayment] = useState("online");
    const [comment, setComment] = useState("");

    const items = useMemo(
        () => cart.map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) })),
        [cart]
    );
    const slots = Array.from({ length: 12 }, (_, index) => `${String(index + 10).padStart(2, "0")}:00–${String(index + 11).padStart(2, "0")}:00`);
    const validPhone = /^\+7 \d{3} \d{3}-\d{2}-\d{2}$/.test(phone);
    const canSubmit = Boolean(address.trim() && address.length <= 100 && validPhone && date && time && cart.length);

    function submit(event) {
        event.preventDefault();
        if (!canSubmit) return;
        if (role !== "client") {
            navigate("/login");
            return;
        }
        // В этой демонстрационной версии платёжный шлюз заменён подтверждением заказа.
        placeOrder({ address, phone, date: new Date(`${date}T00:00:00`).toLocaleDateString("ru-RU"), time, payment, comment, total: cartTotal + 150 });
    }

    return (
        <div>
            <h1 className="page-title">Оформление заказа</h1>
            <div className="checkout-layout">
                <form className="checkout-form card" onSubmit={submit}>
                    <label className="form-field">
                        <span className="form-label">Адрес доставки</span>
                        <input className="field" value={address} maxLength={100} onChange={(event) => setAddress(event.target.value)} required />
                    </label>

                    <div className="checkout-row">
                        <label className="form-field">
                            <span className="form-label">Телефон</span>
                            <input className="field" value={phone} maxLength={17} onChange={(event) => setPhone(event.target.value)} required />
                            {!validPhone && <span className="error-text">Формат: +7 900 123-45-67</span>}
                        </label>
                        <label className="form-field">
                            <span className="form-label">Дата</span>
                            <input className="field" type="date" min={toDateInputValue(today)} max={toDateInputValue(maxDay)} value={date} onChange={(event) => setDate(event.target.value)} required />
                        </label>
                        <label className="form-field">
                            <span className="form-label">Время</span>
                            <select className="select" value={time} onChange={(event) => setTime(event.target.value)} required>
                                <option value="">Выберите</option>
                                {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                            </select>
                        </label>
                    </div>

                    <fieldset className="payment-fieldset">
                        <legend className="form-label">Способ оплаты</legend>
                        <label><input type="radio" name="payment" checked={payment === "online"} onChange={() => setPayment("online")} /> Картой онлайн</label>
                        <label><input type="radio" name="payment" checked={payment === "cash"} onChange={() => setPayment("cash")} /> Наличными курьеру</label>
                    </fieldset>

                    <label className="form-field">
                        <span className="form-label">Комментарий для курьера</span>
                        <textarea className="textarea" value={comment} maxLength={200} placeholder="Дополнительные пожелания" onChange={(event) => setComment(event.target.value)} />
                        <span className="character-count">{comment.length}/200</span>
                    </label>
                    <p className="checkout-disclaimer">Нажимая кнопку, вы подтверждаете заказ и условия доставки.</p>
                </form>

                <aside className="checkout-summary card">
                    <h2>Состав заказа</h2>
                    {items.map((item) => (
                        <div className="checkout-item" key={item.productId}>
                            <span>{item.product?.name} × {item.quantity}</span>
                            <span>{(item.product?.price || 0) * item.quantity} руб.</span>
                        </div>
                    ))}
                    <div className="checkout-item muted"><span>Доставка</span><span>{cart.length ? "150 руб." : "0 руб."}</span></div>
                    <div className="checkout-total"><strong>Итого</strong><strong>{cart.length ? cartTotal + 150 : 0} руб.</strong></div>
                    <button className="button button-primary full-button" onClick={submit} disabled={!canSubmit}>
                        Подтвердить заказ
                    </button>
                </aside>
            </div>
        </div>
    );
}