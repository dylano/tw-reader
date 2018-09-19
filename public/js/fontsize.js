const STORE_KEY = "tw-fontsize";
let fontSize = Number(localStorage.getItem(STORE_KEY)) || 1.0;

function setFontSize(size) {
  document.querySelectorAll(".sizeable-text").forEach(str => {
    str.style.fontSize = `${size}em`;
  });
}

function processFontKeypress({ key }) {
  if (key === "-" || key === "_") {
    document.querySelector("#font-down").click();
  } else if (key === "=" || key === "+") {
    document.querySelector("#font-up").click();
  }
}

document.querySelector("#font-up").addEventListener("click", () => {
  if (fontSize <= 2.0) {
    fontSize += 0.5;
    localStorage.setItem(STORE_KEY, fontSize);
    setFontSize(fontSize);
  }
});

document.querySelector("#font-down").addEventListener("click", () => {
  if (fontSize >= 1.5) {
    fontSize -= 0.5;
    localStorage.setItem(STORE_KEY, fontSize);
    setFontSize(fontSize);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  setFontSize(fontSize);
});

window.addEventListener("keydown", processFontKeypress);
