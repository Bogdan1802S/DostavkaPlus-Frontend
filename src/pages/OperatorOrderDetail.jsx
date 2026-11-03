import { useState } from "react";
import { Link, useNavigate, useParams, useOutletContext } from "react-router-dom";
import { couriers } from "../data";
import "./styles/OperatorOrders.css";

export default function OperatorOrderDetail() {
    const { orderId } = useParams();
    const { orders, setOrders, courierOnline, setToast } = useOutletContext();
    const order = orders.find((item) => String(item.id) === orderId);
    const [courier, setCourier] = useState(order?.courier || "");
    const [stockChecked, setStockChecked] = useState(order?.status !== "Принят");
    const navigate = useNavigate();
    if (!order) return <section className="card tracking-page"><h1>Заказ не найден</h1><Link to="/operator-orders">К списку заказов</Link></section>;
    const availableCouriers = couriers.filter((item) => item.online || (item.name === "Иван П." && courierOnline));
    function save() {
        if (!courier || !stockChecked) return;
        setOrders((current) => current.map((item) => item.id === order.id ? { ...item, courier, status: "Собирается" } : item));
        setToast("Изменения сохранены");
        navigate("/operator-orders");
    }
    return <section className="operator-order-detail card"><Link to="/operator-orders">← Все заказы</Link><h1 className="page-title">Заказ №{order.id}</h1><dl className="order-facts"><dt>Клиент</dt><dd>{order.customer}</dd><dt>Телефон</dt><dd><a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}>{order.phone}</a></dd><dt>Адрес</dt><dd>{order.address}</dd><dt>Дата и время</dt><dd>{order.date} · {order.time}</dd><dt>Сумма</dt><dd>{order.total} руб.</dd><dt>Статус</dt><dd>{order.status}</dd></dl><label className="form-field"><span className="form-label">Курьер</span><select className="select" value={courier} onChange={(event) => setCourier(event.target.value)}><option value="">Не назначен</option>{availableCouriers.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>{order.status === "Принят" && <div className="stock-check-row"><button className="button button-outline" onClick={() => { setStockChecked(true); setToast("Все товары в наличии"); }}>Проверить наличие</button>{stockChecked && <span className="stock-ok">В наличии</span>}</div>}<button className="button button-primary" disabled={!courier || !stockChecked} onClick={save}>Сохранить изменения</button></section>;
}
