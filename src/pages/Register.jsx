import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import "./styles/Register.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+7 \d{3} \d{3}-\d{2}-\d{2}$/;

export default function Register() {
    const { setRole, setToast } = useOutletContext();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
    const [agreed, setAgreed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const validName = /^[А-Яа-яЁёA-Za-z -]{2,30}$/.test(form.name.trim());
    const validPassword = form.password.length >= 8 && form.password.length <= 32 && /\d/.test(form.password);
    const canSubmit = validName && PHONE_PATTERN.test(form.phone) &&
        EMAIL_PATTERN.test(form.email) && form.email.length <= 64 && validPassword && agreed;

    function update(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function submit(event) {
        event.preventDefault();
        if (!canSubmit) {
            setError("Проверьте заполнение полей и согласие на обработку данных.");
            return;
        }
        setRole("client");
        setToast("Аккаунт создан");
        navigate("/");
    }

    return (
        <section className="register-card card">
            <div className="auth-tabs">
                <Link className="auth-tab" to="/login">Вход</Link>
                <span className="auth-tab active">Регистрация</span>
            </div>

            <form className="register-form" onSubmit={submit} noValidate>
                <label className="form-field">
                    <span className="form-label">Имя</span>
                    <input className="field" value={form.name} maxLength={30} placeholder="Анна" onChange={(e) => update("name", e.target.value)} />
                </label>

                <label className="form-field">
                    <span className="form-label">Телефон</span>
                    <input className="field" value={form.phone} maxLength={17} placeholder="+7 900 123-45-67" onChange={(e) => update("phone", e.target.value)} />
                </label>

                <label className="form-field">
                    <span className="form-label">Email</span>
                    <input className="field" type="email" value={form.email} maxLength={64} placeholder="name@mail.ru" onChange={(e) => update("email", e.target.value)} />
                </label>

                <label className="form-field">
                    <span className="form-label">Пароль</span>
                    <span className="password-wrap">
            <input className="field" type={showPassword ? "text" : "password"} value={form.password} maxLength={32} placeholder="Не менее 8 символов, минимум 1 цифра" onChange={(e) => update("password", e.target.value)} />
            <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Показать или скрыть пароль">◉</button>
          </span>
                </label>

                <label className="consent">
                    <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
                    <span>Согласен с обработкой данных</span>
                </label>

                {error && <p className="error-text">{error}</p>}
                <button className="button button-primary register-submit" type="submit" disabled={!canSubmit}>
                    Создать аккаунт
                </button>
            </form>

            <p className="register-footer">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
        </section>
    );
}