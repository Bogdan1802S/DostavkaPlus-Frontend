import { useState } from "react";
import { couriers } from "../data";
import "./styles/OperatorOrders.css";

function statusClass(status) {
    if (status === "Новый") return "status-new";
    if (status === "Доставлен") return "status-done";
    if (status === "Отменён") return "status-cancelled";
    return "status-active";
}

export default function OperatorOrders() {
    const { orders, setOrders, setToast, courierOnline } = useOutletContext();
    const [statusFilter, setStatusFilter] = useState("Все");
    const [search, setSearch] = useState("");
    const [assignments, setAssignments] = useState({});

    const statuses = ["Все", "Новый", "В пути", "Доставлен", "Отменён"];
    const onlineCouriers = couriers.filter((courier) => courier.online || (courier.name === "Иван П." && courierOnline));

    const visibleOrders = orders
        .filter((order) => statusFilter === "Все" || order.status === statusFilter)
        .filter((order) => `${order.id} ${order.phone}`.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 20);

    function assign(orderId) {
        const courier = assignments[orderId];
        if (!courier) return;
        setOrders((current) => current.map((order) =>
            order.id === orderId ? { ...order, courier } : order
        ));
        setToast(`Курьер ${courier} назначен`);
    }

    function cancel(order) {
        if (!window.confirm(`Отменить заказ №${order.id}?`)) return;
        setOrders((current) => current.map((item) =>
            item.id === order.id ? { ...item, status: "Отменён" } : item
        ));
        setToast("Заказ отменён");
    }

    return (
        <section className="operator-page">
            <h1 className="page-title">Все заказы</h1>

            <div className="operator-filters">
                <label>
                    <span className="visually-hidden">Фильтр по статусу</span>
                    <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                        {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                </label>
                <input
                    className="field"
                    value={search}
                    maxLength={20}
                    placeholder="№ заказа или телефон"
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            <div className="orders-table-wrap card">
                <table className="orders-table">
                    <thead>
                    <tr>
                        <th>№</th>
                        <th>Клиент</th>
                        <th>Адрес</th>
                        <th>Сумма</th>
                        <th>Статус</th>
                        <th>Курьер</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {visibleOrders.map((order) => {
                        const canCancel = ["Новый", "В пути"].includes(order.status);
                        const selectedCourier = assignments[order.id] ?? order.courier;

                        return (
                            <tr key={order.id}>
                                <td><strong>{order.id}</strong></td>
                                <td>{order.customer}</td>
                                <td>{order.shortAddress}</td>
                                <td>{order.total} руб.</td>
                                <td><span className={`status-badge ${statusClass(order.status)}`}>{order.status}</span></td>
                                <td>
                                    <select
                                        className="courier-select"
                                        value={selectedCourier}
                                        onChange={(event) => setAssignments((current) => ({ ...current, [order.id]: event.target.value }))}
                                    >
                                        <option value="">не назначен</option>
                                        {onlineCouriers.map((courier) => <option key={courier.name} value={courier.name}>{courier.name}</option>)}
                                    </select>
                                </td>
                                <td className="operator-actions">
                                    <button className="button button-primary small-action" disabled={!assignments[order.id]} onClick={() => assign(order.id)}>ОК</button>
                                    {canCancel && <button className="button button-danger small-action" onClick={() => cancel(order)}>Отмена</button>}
                                </td>
                            </tr>
                        );
                    })}
                    {!visibleOrders.length && <tr><td colSpan="7" className="table-empty">Заказы не найдены.</td></tr>}
                    </tbody>
                </table>
            </div>
        </section>
    );
}