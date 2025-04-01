const shoppingDate = document.getElementById("shopping-date");
  const financialGoal = document.getElementById("financial-goal");
  const shoppingItems = document.getElementById("shopping-items");
  const confirmationDialog = document.getElementById("confirmation-dialog");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");

  let itemToRemove = null;

  function validateInput(inputId, type, maxLength, required = false) {
    const input = document.getElementById(inputId);
    const value = input ? input.value : "";
    let isValid = true;

    if (required && !value) {
      isValid = false;
    } else if (type === 'number') {
      if (isNaN(value) || parseFloat(value) < 0) {
        isValid = false;
      }
    } else if (type === 'text' && value.length > maxLength) {
      isValid = false;
    } else if (type === 'date' && isNaN(Date.parse(value))) {
      isValid = false;
    }

    if (!isValid && inputId) {
      alert(`Invalid input for ${inputId}.`);
      input.classList.add('invalid-input');
      input.focus();
      return false;
    } else if (inputId) {
      input.classList.remove('invalid-input');
    }
    return isValid;
  }

  document.getElementById("add-item").addEventListener("click", () => {
    const item = document.createElement("div");
    item.classList.add("shopping-item");
    item.innerHTML = `
      <input type="text" placeholder="Item Name">
      <input type="number" placeholder="Quantity" min="1">
      <input type="number" placeholder="Price" min="0">
      <input type="text" placeholder="Category">
      <input type="text" placeholder="Notes">
    `;
    shoppingItems.appendChild(item);
  });

  document.getElementById("remove-item").addEventListener("click", () => {
    if (shoppingItems.children.length > 1) {
      itemToRemove = shoppingItems.lastChild;
      confirmationDialog.style.display = "block";
    }
  });

  confirmYes.addEventListener("click", () => {
    shoppingItems.removeChild(itemToRemove);
    confirmationDialog.style.display = "none";
    itemToRemove = null;
  });

  confirmNo.addEventListener("click", () => {
    confirmationDialog.style.display = "none";
    itemToRemove = null;
  });

  document.getElementById('save-log').addEventListener('click', () => {
    if (!validateInput('shopping-date', 'date', null, true) ||
      !validateInput('financial-goal', 'number', null, true)
    ) {
      return;
    }

    const items = Array.from(shoppingItems.children)
      .slice(1)
      .map(item => {
        const inputs = Array.from(item.querySelectorAll("input"));
        if (!validateInput(inputs[0].id || "", 'text', 255, true) ||
          !validateInput(inputs[1].id || "", 'number', null, true) ||
          !validateInput(inputs[2].id || "", 'number', null, true) ||
          !validateInput(inputs[3].id || "", 'text', 255, true) ||
          !validateInput(inputs[4].id || "", 'text', 255, false)) {
          return null;
        }

        return inputs.map(input => sanitizeInput(input.value));
      }).filter(item => item !== null);

    if (items.some(item => item === null)) {
      return;
    }

    const log = {
      date: shoppingDate.value,
      goal: financialGoal.value,
      items: items,
    };

    if (!log.date || !log.goal || log.items.length === 0) {
      alert("Please complete all fields before saving.");
      return;
    }

    localStorage.setItem("shoppingLog", JSON.stringify(log));
    alert("Shopping log saved!");
  });

  function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
  }

  document.getElementById("load-log").addEventListener("click", () => {
    const savedLog = localStorage.getItem("shoppingLog");
    if (!savedLog) return alert("No saved shopping log found.");

    const log = JSON.parse(savedLog);
    shoppingDate.value = log.date || "";
    financialGoal.value = log.goal || "";

    while (shoppingItems.children.length > 1) {
      shoppingItems.removeChild(shoppingItems.lastChild);
    }

    log.items.forEach(item => {
      document.getElementById("add-item").click();
      const inputFields = shoppingItems.lastChild.querySelectorAll("input");
      inputFields.forEach((input, index) => (input.value = item[index] || ""));
    });
  });

  document.getElementById("print-pdf").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      alert("jsPDF library not loaded. PDF generation is unavailable.");
      return;
    }
    const doc = new jsPDF();
    try {
      doc.text("Shopping Log", 10, 10);
      doc.text(`Shopping Date: ${document.getElementById("shopping-date").value || "No Date"}`, 10, 20);
      doc.text(`Financial Goal: ${document.getElementById("financial-goal").value || "No Goal"}`, 10, 30);

      let y = 40;
      doc.setFontSize(12);

      document.querySelectorAll(".shopping-item:not(.header)").forEach(item => {
        const inputs = item.querySelectorAll("input");
        let rowText = "";
        inputs.forEach(input => {
          let value = String(input.value || "N/A");
          console.log("Input Value:", value, "Data Type:", typeof value);
          rowText += value + " | ";
        });
        doc.text(rowText, 10, y);
        y += 10;
      });

      doc.save("shopping-log.pdf");
      alert("Shopping PDF generated successfully with shopping data!");
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate Shopping PDF. Please try again.");
    }
  });

  document.getElementById("download-log").addEventListener("click", () => {
    const log = localStorage.getItem("shoppingLog");
    if (!log) return alert("No shopping log to download.");

    const blob = new Blob([log], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "shoppingLog.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById("upload-log").addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsedData = JSON.parse(e.target.result);

        if (typeof parsedData !== 'object' || parsedData === null ||
          !parsedData.hasOwnProperty('date') || typeof parsedData.date !== 'string' ||
          !parsedData.hasOwnProperty('goal') || typeof parsedData.goal !== 'number' ||
          !parsedData.hasOwnProperty('items') || !Array.isArray(parsedData.items)) {
          throw new Error("Invalid shopping log structure.");
        }

        for (const item of parsedData.items) {
          if (!Array.isArray(item) || item.length !== 5 ||
            typeof item[0] !== 'string' || typeof item[1] !== 'number' ||
            typeof item[2] !== 'number' || typeof item[3] !== 'string' ||
            typeof item[4] !== 'string') {
            throw new Error("Invalid shopping item structure.");
          }
        }

        localStorage.setItem("shoppingLog", JSON.stringify(parsedData));
        document.getElementById("load-log").click();
        alert("Shopping log uploaded!");

      } catch (error) {
        alert("Invalid file uploaded: " + error.message);
      }
    };
    reader.readAsText(file);
  });
