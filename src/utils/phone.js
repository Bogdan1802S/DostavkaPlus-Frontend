export function formatRussianPhone(value) {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("8") || digits.startsWith("7")) digits = digits.slice(1);
    return formatRussianPhoneDigits(digits.slice(0, 10));
}

function formatRussianPhoneDigits(digits) {
    if (!digits) return "";
    const area = digits.slice(0, 3);
    const first = digits.slice(3, 6);
    const second = digits.slice(6, 8);
    const third = digits.slice(8, 10);
    return `+7 ${area}${first ? ` ${first}` : ""}${first.length === 3 && second ? `-${second}` : ""}${second.length === 2 && third ? `-${third}` : ""}`;
}

export const RUSSIAN_PHONE_PATTERN = /^\+7 \d{3} \d{3}-\d{2}-\d{2}$/;

export function handlePhoneKeyDown(event, onChange) {
    if (event.key !== "Backspace" && event.key !== "Delete") return;

    const input = event.currentTarget;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const value = input.value;
    event.preventDefault();
    const allDigits = value.replace(/\D/g, "");
    const subscriberDigits = allDigits.startsWith("7") ? allDigits.slice(1) : allDigits;
    const countAt = (position) => Math.max(0, value.slice(0, position).replace(/\D/g, "").length - (value.startsWith("+7") && position >= 2 ? 1 : 0));
    const from = countAt(start);
    const to = countAt(end);
    const removeAt = start === end ? (event.key === "Backspace" ? from - 1 : from) : -1;
    const nextDigits = start === end
        ? (removeAt < 0 || removeAt >= subscriberDigits.length
            ? subscriberDigits
            : `${subscriberDigits.slice(0, removeAt)}${subscriberDigits.slice(removeAt + 1)}`)
        : `${subscriberDigits.slice(0, from)}${subscriberDigits.slice(to)}`;
    const formatted = formatRussianPhoneDigits(nextDigits);
    const digitsBeforeCursor = start === end ? Math.max(0, from - (removeAt >= 0 && removeAt < subscriberDigits.length ? 1 : 0)) : from;
    let caret = 0;
    let seenDigits = 0;
    const targetDigits = digitsBeforeCursor + (formatted ? 1 : 0);
    while (caret < formatted.length && seenDigits < targetDigits) {
        if (/\d/.test(formatted[caret])) seenDigits += 1;
        caret += 1;
    }

    onChange(formatted);
    requestAnimationFrame(() => input.setSelectionRange(caret, caret));
}
