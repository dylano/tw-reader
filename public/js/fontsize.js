let fontSize = 1.0;

document.querySelector("#font-up").addEventListener("click", () => {
  console.log("font up");
  if (fontSize <= 2.0) {
    fontSize += 0.5;
    document.querySelectorAll(".sizeable-text").forEach(str => {
      str.style.fontSize = `${fontSize}em`;
    });
  }
});

document.querySelector("#font-down").addEventListener("click", () => {
  console.log("font down");
  if (fontSize >= 1.5) {
    fontSize -= 0.5;
    document.querySelectorAll(".sizeable-text").forEach(str => {
      str.style.fontSize = `${fontSize}em`;
    });
  }
});
