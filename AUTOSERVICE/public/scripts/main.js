document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-cabinet");
    if (!btn) return;

    btn.addEventListener("click", async (e) => {
        e.preventDefault();

        const res = await fetch("/api/check-auth");
        const data = await res.json();

        if (data.authorized) {
            window.location.href = "/cabinet.html";
        } else {
            window.location.href = "/auth.html";
        }
    });
});
