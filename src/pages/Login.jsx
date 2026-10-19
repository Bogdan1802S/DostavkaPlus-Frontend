import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import "./styles/Login.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Login() {
    const { setRole, setToast } = useOutletContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    function submit(event) {
        event.preventDefault();
        if (!EMAIL_PATTERN.test(email) || email.length > 64 || password.length < 8 || password.length > 32) {
            setError("Неверный email или пароль");
            return;
        }

        setError("");
        const normalizedEmail = email.toLowerCase();
        if (normalizedEmail === "courier@mail.ru") {
            setRole("courier");
            navigate("/courier-orders");
        } else if (normalizedEmail === "operator@mail.ru") {
            setRole("operator");
            navigate("/operator-orders");
        } else {
            setRole("client");
            navigate("/");
        }
    }

    function forgotPassword() {
        setNotice(email ? `Инструкция отправлена на ${email}` : "Введите email для восстановления пароля.");
        setToast("Запрос на восстановление пароля");
    }

    return (
        <section className="auth-card card">
            <div className="auth-tabs">
                <span className="auth-tab active">Вход</span>
                <Link className="auth-tab" to="/register">Регистрация</Link>
            </div>

            <form className="auth-form" onSubmit={submit} noValidate>
                <label className="form-field">
                    <span className="form-label">Email</span>
                    <input
                        className="field"
                        type="email"
                        value={email}
                        maxLength={64}
                        placeholder="name@mail.ru"
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </label>

                <label className="form-field">
                    <span className="form-label">Пароль</span>
                    <span className="password-wrap">
            <input
                className="field"
                type={showPassword ? "text" : "password"}
                value={password}
                minLength={8}
                maxLength={32}
                onChange={(event) => setPassword(event.target.value)}
                required
            />
            <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "◉" : "◉"}
            </button>
          </span>
                </label>

                <div className="auth-message-row">
                    <span className="error-text">{error}</span>
                    <button className="link-button" type="button" onClick={forgotPassword}>Забыли пароль?</button>
                </div>
                {notice && <p className="auth-notice">{notice}</p>}

                <button
                    className="button button-primary auth-submit"
                    type="submit"
                    disabled={!email || !password}
                >
                    Войти
                </button>
            </form>

            <p className="auth-footnote">Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link></p>
            <Link className="guest-link" to="/">или продолжайте как гость</Link>
        </section>
    );
}