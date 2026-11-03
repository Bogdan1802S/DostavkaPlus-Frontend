import { Link, useNavigate, useParams, useOutletContext } from "react-router-dom";
import "./styles/Checkout.css";

export default function Payment() {
    const { orderId } = useParams();
    const { orders, setOrders, setToast } = useOutletContext();
    const order = orders.find((item) => String(item.id) === orderId);
    const navigate = useNavigate();
    function pay() {
        setOrders((current) => current.map((item) => item.id === order.id ? { ...item, paid: true } : item));
        setToast("Оплата прошла успешно");
        navigate("/client-orders");
    }
    if (!order) return <section className="payment-page card"><h1>Заказ не найден</h1><Link to="/">В каталог</Link></section>;
    return <section className="payment-page card"><span className="payment-kicker">Платёжная система</span><h1>Оплата заказа №{order.id}</h1><p>Демонстрационный экран внешней платёжной системы.</p><div className="summary-total"><strong>К оплате</strong><strong>{order.total} руб.</strong></div><button className="button button-primary full-button" onClick={pay}>Оплатить картой</button><button className="link-button payment-cancel" onClick={() => navigate("/client-orders")}>Вернуться без оплаты</button></section>;
}
