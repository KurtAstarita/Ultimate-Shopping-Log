<div id="shopping-log">
  <h3 style="text-align: center;"><span style="color: #ffa400;">DISCLAIMER:&nbsp; At the bottom ↓</span></h3>
  <h1>Ultimate Shopping Log</h1>

  <label>Shopping Date:</label>
  <input id="shopping-date" type="date" />

  <label>Financial Goal:</label>
  <input id="financial-goal" type="number" />

  <div id="shopping-items">
    <div class="shopping-item header">
      <input readonly="" type="text" value="Item Name" />
      <input readonly="" type="text" value="Quantity" />
      <input readonly="" type="text" value="Price" />
      <input readonly="" type="text" value="Category" />
      <input readonly="" type="text" value="Notes" />
    </div>
  </div>

  <button id="add-item">Add Item</button>
  <button id="remove-item">Remove Item</button>
  <button id="save-log">Save Log</button>
  <button id="load-log">Load Log</button>
  <button id="print-pdf">Print as PDF</button>
  <button id="download-log">Download Log</button>
  <input accept=".json" id="upload-log" type="file" />

  <div id="confirmation-dialog">
    <p>Are you sure you want to delete this item?</p>
    <button id="confirm-yes">Yes</button>
    <button id="confirm-no">No</button>
  </div>
</div>

<script src="https://kurtastarita.github.io/workoutGenerator1/csp-setup.js"></script>
<script src="https://kurtastarita.github.io/workoutGenerator1/shopping-log-script.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.3/purify.min.js"></script>

<style>
  #shopping-log {
    box-sizing: border-box;
    font-family: sans-serif;
    width: 100%;
    max-width: 100%;
  }

  #shopping-log h1 {
    text-align: center;
  }

  #shopping-log input,
  #shopping-log button {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    display: block;
    box-sizing: border-box;
  }

  #shopping-log input {
    border: 1px solid #ccc;
  }

  #shopping-log button {
    background-color: #00A000;
    color: white;
    border: none;
    cursor: pointer;
  }

  #shopping-log button:hover {
    background-color: #006600;
  }

  #shopping-log .shopping-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 2fr 3fr;
    gap: 5px;
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 10px;
    background: #f9f9f9;
    border-radius: 5px;
  }

  #shopping-log .header {
    display: none;
  }

  #shopping-log label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }

  #confirmation-dialog {
    background: white;
    border: 1px solid rgb(204, 204, 204);
    display: none;
    left: 50%;
    padding: 20px;
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
  }

  @media (max-width: 600px) {
    #shopping-log .shopping-item {
      display: block;
    }

    #shopping-log .shopping-item input {
      width: 100%;
      margin-bottom: 5px;
    }

    #shopping-log .header {
      display: none;
    }
  }

  @media print {
    @page {
      size: A4 portrait;
      margin: 5mm;
    }

    body * {
      visibility: hidden;
    }

    #print-container,
    #print-container * {
      visibility: visible;
    }

    #print-container {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 90% !important;
      margin: 0 auto !important;
      padding: 10px !important;
      background: white !important;
    }
  }
</style>

<script>
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
</script>
