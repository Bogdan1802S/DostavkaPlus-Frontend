export function formatRussianPhone(value) {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("8") || digits.startsWith("7")) digits = digits.slice(1);
    digits = digits.slice(0, 10);

    if (!digits) return "";
    const area = digits.slice(0, 3);
    const first = digits.slice(3, 6);
    const second = digits.slice(6, 8);
    const third = digits.slice(8, 10);
    return `+7-(${area}${area.length === 3 ? ")" : ""}${first ? `-${first}` : ""}${first.length === 3 && second ? `-${second}` : ""}${second.length === 2 && third ? `-${third}` : ""}`;
}

export const RUSSIAN_PHONE_PATTERN = /^\+7-\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
