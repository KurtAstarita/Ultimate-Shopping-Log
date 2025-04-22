const shoppingDate = document.getElementById("shopping-date");
const financialGoal = document.getElementById("financial-goal");
const shoppingItems = document.getElementById("shopping-items");
const confirmationDialog = document.getElementById("confirmation-dialog");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");

let itemToRemove = null;
let lastSaveTime = 0;
const saveInterval = 2000; // 2 seconds

function validateInput(inputId, type, maxLength, required = false) {
    const input = document.getElementById(inputId);
    const value = input ? input.value : "";
    let isValid = true;
    let errorMessage = "";

    if (required && !value) {
        isValid = false;
        errorMessage = `Please fill out the ${inputId.replace('-', ' ')} field.`;
    } else if (type === 'number') {
        if (isNaN(value) || parseFloat(value) < 0) {
            isValid = false;
            errorMessage = `Invalid number for ${inputId.replace('-', ' ')}. Must be non-negative.`;
        }
    } else if (type === 'integer') {
        if (!/^\d+$/.test(value) || parseInt(value) < 1) {
            isValid = false;
            errorMessage = `Invalid quantity for ${inputId.replace('-', ' ')}. Must be a positive integer.`;
        }
    } else if (type === 'price') {
        if (isNaN(value) || parseFloat(value) < 0 || (value.indexOf('.') !== -1 && value.split('.')[1].length > 2)) {
            isValid = false;
            errorMessage = `Invalid price for ${inputId.replace('-', ' ')}. Must be a non-negative number with at most two decimal places.`;
        }
    } else if (type === 'text' && value.length > maxLength) {
        isValid = false;
        errorMessage = `${inputId.replace('-', ' ')} cannot exceed ${maxLength} characters.`;
    } else if (type === 'date' && isNaN(Date.parse(value))) {
        isValid = false;
        errorMessage = `Invalid date for ${inputId.replace('-', ' ')}.`;
    }

    if (!isValid && inputId) {
        alert(errorMessage);
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
        <input type="text" placeholder="Item Name" id="itemName-${Date.now()}">
        <input type="number" placeholder="Quantity" min="1" id="quantity-${Date.now()}">
        <input type="number" placeholder="Price" min="0" step="0.01" id="price-${Date.now()}">
        <input type="text" placeholder="Category" id="category-${Date.now()}">
        <input type="text" placeholder="Notes" id="notes-${Date.now()}">
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
    const currentTime = Date.now();
    if (currentTime - lastSaveTime < saveInterval) {
        alert("Please wait a moment before saving again.");
        return;
    }

    if (!validateInput('shopping-date', 'date', null, true) ||
        !validateInput('financial-goal', 'number', null, true)
    ) {
        return;
    }

    const items = Array.from(shoppingItems.children)
        .slice(1)
        .map(item => {
            const inputs = Array.from(item.querySelectorAll("input"));
            const itemNameValid = validateInput(inputs[0].id || "", 'text', 255, true);
            const quantityValid = validateInput(inputs[1].id || "", 'integer', null, true);
            const priceValid = validateInput(inputs[2].id || "", 'price', null, true);
            const categoryValid = validateInput(inputs[3].id || "", 'text', 255, true);
            const notesValid = validateInput(inputs[4].id || "", 'text', 255, false);

            if (!itemNameValid || !quantityValid || !priceValid || !categoryValid || !notesValid) {
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
    lastSaveTime = currentTime;
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

        let headers = ["Item Name", "Quantity", "Price", "Category", "Notes"];
        let rows = [];

        Array.from(shoppingItems.children).slice(1).forEach(item => {
            const inputs = Array.from(item.querySelectorAll("input"));
            let rowData = inputs.map(input => input.value || "N/A");
            rows.push(rowData);
        });

        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 40,
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fontSize: 8,
                fillColor: [200, 200, 200],
            },
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
    if (!log) return alert("No workout log to download. You must add entries & fill them out, then click 'Save' before you can download!");

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
                !parsedData.hasOwnProperty('goal') || (typeof parsedData.goal !== 'number' && isNaN(Number(parsedData.goal))) ||
                !parsedData.hasOwnProperty('items') || !Array.isArray(parsedData.items)
            ) {
                throw new Error("Invalid shopping log structure.");
            }

            for (let i = 0; i < parsedData.items.length; i++) {
                const item = parsedData.items[i];
                if (!Array.isArray(item) || item.length !== 5 ||
                    typeof item[0] !== 'string' || typeof item[1] !== 'string' ||
                    typeof item[2] !== 'string' || typeof item[3] !== 'string' ||
                    typeof item[4] !== 'string'
                ) {
                    throw new Error("Invalid shopping item structure.");
                }
            }

            // Convert goal to a number if it's a string
            if (typeof parsedData.goal === 'string'){
                parsedData.goal = Number(parsedData.goal);
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

//select all anchor elements in the footer.
const footerLinks = document.querySelectorAll('footer a');

footerLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        window.open(link.href, '_blank').focus(); // Open in a new tab/window
    });
});
