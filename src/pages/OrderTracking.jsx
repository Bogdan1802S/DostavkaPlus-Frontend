import { Link, useParams, useOutletContext } from "react-router-dom";
import { products } from "../data";
import "./styles/ClientOrders.css";

const stages = ["Принят", "Собирается", "В пути", "Доставлен"];

export default function OrderTracking() {
    const { orderId } = useParams();
    const { orders } = useOutletContext();
    const order = orders.find((item) => String(item.id) === orderId);

    if (!order) return <section className="tracking-page card"><h1>Заказ не найден</h1><Link to="/client-orders">Вернуться к заказам</Link></section>;

    const current = stages.indexOf(order.status);
    const lines = order.items.map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) }));

    return <section className="tracking-page card">
        <Link className="tracking-back" to="/client-orders">← Мои заказы</Link>
        <div className="client-order-head"><h1>Отслеживание заказа №{order.id}</h1><span className={`status-badge ${order.status === "Доставлен" ? "status-done" : "status-active"}`}>{order.status}</span></div>
        {order.status === "Отменён" ? <p>Заказ отменён.</p> : <div className="order-progress tracking-progress"><div className="progress-track"><span style={{ width: `${Math.max(0, current) * 33.333}%` }} /></div>{stages.map((stage, index) => <div className={`progress-step ${index <= current ? "passed" : ""} ${index === current ? "current" : ""}`} key={stage}><span className="progress-dot" /><span>{stage}</span></div>)}</div>}
        <div className="tracking-details"><div><h2>Адрес доставки</h2><p>{order.address}</p><p>{order.date} · {order.time}</p>{order.courier && <p>Курьер: {order.courier} · <a href={`tel:${(order.courierPhone || "+7 900 555-12-34").replace(/[^\d+]/g, "")}`}>{order.courierPhone || "+7 900 555-12-34"}</a></p>}</div><div><h2>Состав заказа</h2>{lines.map((item) => <p key={item.productId}>{item.product?.name || "Товар"} × {item.quantity} <span>{(item.product?.price || 0) * item.quantity} руб.</span></p>)}<strong className="tracking-total">Итого: {order.total} руб.</strong></div></div>
    </section>;
}
