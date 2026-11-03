import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { couriers } from "../data";
import "./styles/OperatorOrders.css";

function statusClass(status) {
    if (status === "Принят") return "status-new";
    if (status === "Доставлен") return "status-done";
    if (status === "Отменён") return "status-cancelled";
    return "status-active";
}

export default function OperatorOrders() {
    const { orders, setOrders, setToast, courierOnline } = useOutletContext();
    const [statusFilter, setStatusFilter] = useState("Все");
    const [search, setSearch] = useState("");
    const [assignments, setAssignments] = useState({});
    const [stockChecks, setStockChecks] = useState({});
    const [reportOpen, setReportOpen] = useState(false);
    const [reportDates, setReportDates] = useState({ from: "", to: "" });
    const [reportFormat, setReportFormat] = useState("csv");

    const statuses = ["Все", "Принят", "Собирается", "В пути", "Доставлен", "Отменён"];
    const onlineCouriers = couriers.filter((courier) => courier.online || (courier.name === "Иван П." && courierOnline));

    const visibleOrders = orders
        .filter((order) => statusFilter === "Все" || order.status === statusFilter)
        .filter((order) => `${order.id} ${order.phone}`.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 20);

    function assign(orderId) {
        const courier = assignments[orderId];
        if (!courier) return;
        if (!stockChecks[orderId]) return;
        setOrders((current) => current.map((order) =>
            order.id === orderId ? { ...order, courier, status: "Собирается" } : order
        ));
        setStockChecks((current) => ({ ...current, [orderId]: false }));
        setToast(`Курьер ${courier} назначен`);
    }

    function checkStock(order) {
        const available = order.items.every((item) => item.productId > 0);
        setStockChecks((current) => ({ ...current, [order.id]: available }));
        setToast(available ? "Все товары в наличии" : "В заказе есть недоступные товары");
    }

    function createReport(event) {
        event.preventDefault();
        const from = new Date(`${reportDates.from}T00:00:00`);
        const to = new Date(`${reportDates.to}T00:00:00`);
        if (!reportDates.from || !reportDates.to || to < from || (to - from) / 86400000 > 31) return;
        const rows = orders.filter((order) => order.status === "Доставлен").filter((order) => {
            const date = new Date(order.date.split(".").reverse().join("-"));
            return date >= from && date <= to;
        });
        if (reportFormat === "csv") {
            const csv = ["Номер заказа;Курьер;Время доставки;Вручение", ...rows.map((order) => `${order.id};${order.courier};${order.date} ${order.time};Да`)].join("\n");
            const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
            const link = document.createElement("a"); link.href = url; link.download = "отчет-по-доставкам.csv"; link.click(); URL.revokeObjectURL(url);
        } else {
            window.print();
        }
        setReportOpen(false);
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
            <button className="button button-outline report-button" onClick={() => setReportOpen(true)}>Отчёт по доставкам</button>

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
                        const canCancel = ["Принят", "Собирается", "В пути"].includes(order.status);
                        const selectedCourier = assignments[order.id] ?? order.courier;

                        return (
                            <tr key={order.id}>
                                <td><Link to={`/operator-orders/${order.id}`}><strong>{order.id}</strong></Link></td>
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
                                    {order.status === "Принят" && <button className="button button-outline small-action" onClick={() => checkStock(order)}>Проверить наличие</button>}
                                    {stockChecks[order.id] && <span className="stock-ok">В наличии</span>}
                                    <button className="button button-primary small-action" disabled={!assignments[order.id] || !stockChecks[order.id]} onClick={() => assign(order.id)}>Назначить</button>
                                    {canCancel && <button className="button button-danger small-action" onClick={() => cancel(order)}>Отмена</button>}
                                </td>
                            </tr>
                        );
                    })}
                    {!visibleOrders.length && <tr><td colSpan="7" className="table-empty">Заказы не найдены.</td></tr>}
                    </tbody>
                </table>
            </div>
            {reportOpen && <div className="report-backdrop" role="presentation" onClick={() => setReportOpen(false)}><form className="report-dialog card" role="dialog" aria-modal="true" aria-labelledby="report-title" onSubmit={createReport} onClick={(event) => event.stopPropagation()}><h2 id="report-title">Отчёт по доставкам</h2><label className="form-field"><span className="form-label">Период с</span><input className="field" type="date" value={reportDates.from} onChange={(event) => setReportDates((current) => ({ ...current, from: event.target.value }))} required /></label><label className="form-field"><span className="form-label">Период по</span><input className="field" type="date" value={reportDates.to} onChange={(event) => setReportDates((current) => ({ ...current, to: event.target.value }))} required /></label><label className="form-field"><span className="form-label">Формат</span><select className="select" value={reportFormat} onChange={(event) => setReportFormat(event.target.value)}><option value="csv">Excel (CSV)</option><option value="pdf">PDF через печать</option></select></label><p className="muted">Период не более 31 дня. В отчёт входят завершённые доставки.</p><div className="report-actions"><button type="button" className="button button-outline" onClick={() => setReportOpen(false)}>Закрыть</button><button className="button button-primary" disabled={!reportDates.from || !reportDates.to}>Сформировать</button></div></form></div>}
        </section>
    );
}
