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

    return <section className="tracking-page">
        <h1>Отслеживание заказа №{order.id}</h1>
        <p className="tracking-subtitle">Ожидаемая доставка: {order.status === "Доставлен" ? order.date : "сегодня"}, {order.time}</p>
        <div className="tracking-status-heading"><h2>Статус заказа</h2><span className={`status-badge ${order.status === "Доставлен" ? "status-done" : "status-active"}`}>{order.status}</span></div>
        {order.status === "Отменён" ? <p>Заказ отменён.</p> : <div className="tracking-progress" style={{ "--progress": `${Math.max(0, current) * 33.333}%` }}>{stages.map((stage, index) => <div className={`tracking-step ${index <= current ? "passed" : ""} ${index === current ? "current" : ""}`} key={stage}><span className={`tracking-dot${index < current ? " tracking-dot--complete" : ""}`} /><span>{stage}</span></div>)}</div>}
        <div className="tracking-details"><section className="tracking-delivery"><h2>Данные доставки</h2><span className="tracking-label">Адрес доставки</span><p>{order.address}</p><div className="tracking-divider" /><span className="tracking-label">Курьер</span><p className="tracking-courier">{order.courier || "Назначается"}{order.courier && <>, <a href={`tel:${(order.courierPhone || "+7 900 555-12-34").replace(/[^\d+]/g, "")}`}>{order.courierPhone || "+7 900 555-12-34"}</a></>}</p></section><section className="tracking-items"><h2>Состав заказа</h2>{lines.map((item) => <p key={item.productId}><span>{item.product?.name || "Товар"} × {item.quantity}</span><span>{(item.product?.price || 0) * item.quantity} руб.</span></p>)}<p className="tracking-delivery-cost"><span>Доставка</span><span>150 руб.</span></p><strong className="tracking-total"><span>Итого</span><span>{order.total} руб.</span></strong></section></div>
    </section>;
}
