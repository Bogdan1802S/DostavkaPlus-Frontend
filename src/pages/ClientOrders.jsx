import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import "./styles/ClientOrders.css";

const stages = ["Принят", "Собирается", "В пути", "Доставлен"];

function badgeClass(status) {
    if (status === "Доставлен") return "status-done";
    if (status === "Отменён") return "status-cancelled";
    return "status-active";
}

export default function ClientOrders() {
    const { orders, setOrders, setToast, setRole, setCart } = useOutletContext();
    const [tab, setTab] = useState("active");
    const navigate = useNavigate();

    const visibleOrders = orders.filter((order) => {
        const completed = ["Доставлен", "Отменён"].includes(order.status);
        return tab === "completed" ? completed : !completed;
    });

    function cancelOrder(id) {
        if (!window.confirm("Отменить этот заказ?")) return;
        setOrders((current) => current.map((order) => order.id === id ? { ...order, status: "Отменён" } : order));
        setToast("Заказ отменён");
    }

    function repeatOrder(order) {
        setCart(order.items.map((item) => ({ ...item })));
        setRole("client");
        navigate("/cart");
    }

    return (
        <section className="orders-page">
            <h1 className="page-title">Мои заказы</h1>
            <div className="segment-control">
                <button className={tab === "active" ? "selected" : ""} onClick={() => setTab("active")}>Активные</button>
                <button className={tab === "completed" ? "selected" : ""} onClick={() => setTab("completed")}>Завершённые</button>
            </div>

            {visibleOrders.length ? visibleOrders.map((order) => {
                const currentStage = stages.indexOf(order.status);
                const canCancel = ["Принят", "Собирается"].includes(order.status);

                return (
                    <article className={`client-order-card card ${order.status === "Доставлен" ? "completed-order" : ""}`} key={order.id}>
                        <div className="client-order-head">
                            <h2>Заказ №{order.id} от {order.date}</h2>
                            <span className={`status-badge ${badgeClass(order.status)}`}>{order.status}</span>
                        </div>

                        {!["Отменён", "Доставлен"].includes(order.status) && (
                            <div className="order-progress">
                                <div className="progress-track">
                                    <span style={{ width: `${Math.max(0, currentStage) * 33.333}%` }} />
                                </div>
                                {stages.map((stage, index) => (
                                    <div className={`progress-step ${index <= currentStage ? "passed" : ""} ${index === currentStage ? "current" : ""}`} key={stage}>
                                        <span className="progress-dot" />
                                        <span>{stage}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="client-order-bottom">
                            <div>
                                {order.courier && <p>Курьер: {order.courier}, <a href="tel:+79005551234">+7 900 555-12-34</a></p>}
                                <p>Сумма: {order.total} руб.</p>
                            </div>
                            {canCancel && (
                                <button className="button button-danger" onClick={() => cancelOrder(order.id)}>Отменить заказ</button>
                            )}
                            {(order.status === "Доставлен" || order.status === "Отменён") && (
                                <button className="button button-primary" onClick={() => repeatOrder(order)}>Повторить заказ</button>
                            )}
                        </div>
                    </article>
                );
            }) : <div className="card orders-empty">В этом разделе пока нет заказов.</div>}
        </section>
    );
}