import { useOutletContext } from "react-router-dom";
import "./styles/CourierOrders.css";

export default function CourierOrders() {
    const { orders, setOrders, courierOnline, setCourierOnline, setToast } = useOutletContext();
    const assignedOrders = orders.filter((order) => order.courier === "Иван П." && ["Собирается", "В пути", "Доставлен"].includes(order.status));

    function updateStatus(id, status) {
        setOrders((current) => current.map((order) => (
            order.id === id ? { ...order, status, courier: "Иван П." } : order
        )));
        setToast(status === "В пути" ? "Доставка начата" : "Клиент уведомлён: заказ доставлен");
    }

    return (
        <section className="courier-page">
            <div className="courier-title-row">
                <h1 className="page-title">Мои доставки</h1>
                <label className="line-toggle">
                    <span>На линии</span>
                    <input type="checkbox" checked={courierOnline} onChange={(event) => setCourierOnline(event.target.checked)} />
                    <span className="toggle-track"><span /></span>
                </label>
            </div>

            {!courierOnline && <div className="offline-notice">Вы не на линии — новые заказы не будут назначаться.</div>}

            {assignedOrders.map((order) => (
                <article className="delivery-card card" key={order.id}>
                    <div className="delivery-card-top">
                        <h2>Заказ №{order.id}</h2>
                        <span className={`status-badge ${order.status === "Доставлен" ? "status-done" : "status-active"}`}>
              {order.status}
            </span>
                    </div>
                    <p className="delivery-address">{order.shortAddress} · {order.time}</p>
                    <p className="delivery-phone">Телефон клиента: <a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}>{order.phone}</a></p>
                    <span className="payment-badge paid">{order.paid ? "Оплачен онлайн" : "Ожидает оплаты онлайн"}
          </span>

                    <div className="delivery-action">
                        {order.status === "Собирается" && (
                            <button className="button button-primary" disabled={!courierOnline} onClick={() => updateStatus(order.id, "В пути")}>Начать доставку</button>
                        )}
                        {order.status !== "Доставлен" && <a className="button button-outline route-button" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}>Маршрут</a>}
                        {order.status === "В пути" && (
                            <button className="button button-primary delivered-button" onClick={() => updateStatus(order.id, "Доставлен")}>Доставлено</button>
                        )}
                        {order.status === "Доставлен" && <span className="completed-label">Доставка завершена</span>}
                    </div>
                </article>
            ))}
        </section>
    );
}
