const checkboxes = Array.from(document.querySelectorAll(".friendlist-item-option input"));
const inputPrefix = "cx-dup-";

async function optionClicked(e) {
  if (e.target.name) {
    if (e.target.name.startsWith(inputPrefix)) {
      const screenName = e.target.name.substring(inputPrefix.length);
      const body = JSON.stringify({
        action: "checkDuplicates",
        value: e.target.checked
      });
      try {
        await fetch(`/api/friends/${screenName}`, {
          method: "PUT",
          body,
          headers: {
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        console.log({error});
      }
    }
  }
}

checkboxes.forEach(cx => {
  cx.addEventListener("click", optionClicked);
});
