# Ultimate Shopping Log

This is a simple web application for logging your shopping trips. It allows you to:

* Add item details like name, quantity, price, and category.
* Set a financial goal for your shopping trip.
* Save your shopping logs to local storage.
* Load saved shopping logs.
* Print shopping logs as PDFs.
* Download shopping logs as JSON files.
* Upload shopping logs from JSON files.

## Features

* **Add/Remove Items:** Easily add or remove item entries from your shopping log.
* **Save/Load Logs:** Save your shopping logs to your browser's local storage and load them later.
* **PDF Generation:** Generate a PDF version of your shopping log for easy printing or sharing.
* **JSON Import/Export:** Download your shopping logs as JSON files and upload them later.
* **Input Validation:** Ensures that all required fields are filled and that the data is in the correct format.
* **Data Sanitization:** Uses DOMPurify to prevent XSS vulnerabilities.
* **Content Security Policy (CSP):** Implemented via a separate script to enhance security by restricting the resources that the browser is allowed to load.
* **Financial Goal:** Set a financial goal for each shopping trip.

## How to Use

1.  **Enter Log Details:** Fill in the shopping date and financial goal.
2.  **Add Items:** Click the "Add Item" button to add item entries.
3.  **Fill in Item Details:** Enter the item name, quantity, price, category, and notes for each item.
4.  **Save the Log:** Click the "Save Log" button to save your shopping log to local storage.
5.  **Load a Log:** Click the "Load Log" button to load a previously saved shopping log.
6.  **Print as PDF:** Click the "Print as PDF" button to generate a PDF version of your log.
7.  **Download as JSON:** Click the "Download Log" button to download your log as a JSON file.
8.  **Upload JSON:** Click the "Upload Log" button to upload a JSON shopping file.
9.  **Remove an Item:** Click the "Remove Item" button to remove the last item entry.

## Technologies Used

* **HTML:** For the structure of the web page.
* **CSS:** For styling the web page.
* **JavaScript:** For the interactive functionality of the application.
* **jsPDF:** For generating PDF documents.
* **DOMPurify:** For sanitizing user-supplied HTML to prevent cross-site scripting (XSS) attacks.
* **Local Storage:** For storing shopping log data in the browser.
* **JSON:** For data interchange when downloading and uploading shopping logs.
* **Content Security Policy (CSP):** For enhanced security, using a separate script to define allowed resources.
* **FileReader API:** For reading the contents of uploaded JSON files.
* **Blob API:** For creating downloadable JSON files.
* **URL API:** For creating object URLs for downloaded files.

## Installation

1.  Clone the repository to your local machine.
2.  Open the `index.html` file in your web browser.

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

## DISCLAMER

**Read the disclaimer here:** [Ultimate Shopping Log Disclaimer](/DISCLAIMER.md)
