const menu_btn = document.querySelector("#menu-btn")
const nav = document.querySelector(".lista")

menu_btn.addEventListener("click", () => nav.classList.toggle("active"))