// Orders page functionality for Chops & Grills Enterprise

document.addEventListener("DOMContentLoaded", function () {
  // Initialize data
  let currentOrder = [];
  let dailyOrders = StorageUtils.getDailyOrders();

  // DOM Elements
  const foodItems = document.querySelectorAll(".food-item");
  const currentOrderItems = document.getElementById("currentOrderItems");
  const attendeeSelect = document.getElementById("attendeeSelect");
  const paymentTypeSelect = document.getElementById("paymentTypeSelect");
  const subtotalEl = document.getElementById("subtotal");
  const discountSelect = document.getElementById("discountSelect");
  const discountAmountEl = document.getElementById("discountAmount");
  const totalEl = document.getElementById("total");
  const completeOrderBtn = document.getElementById("completeOrderBtn");
  const dailyOrdersList = document.getElementById("dailyOrdersList");
  const exportExcelBtn = document.getElementById("exportExcelBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const exportOrdersExcelBtn = document.getElementById("exportOrdersExcelBtn");
  const exportOrdersPdfBtn = document.getElementById("exportOrdersPdfBtn");
  const allOrdersTableBody = document.getElementById("allOrdersTableBody");
  const pdfContainer = document.getElementById("pdfContainer");

  // Event Listeners
  foodItems.forEach((item) => {
    item.addEventListener("click", function () {
      const name = this.getAttribute("data-name");
      const price = parseInt(this.getAttribute("data-price"));

      // Check if item already exists in order
      const existingItemIndex = currentOrder.findIndex(
        (item) => item.name === name
      );

      if (existingItemIndex !== -1) {
        // Increase quantity if already exists
        currentOrder[existingItemIndex].quantity += 1;
      } else {
        // Add new item
        currentOrder.push({
          name,
          price,
          quantity: 1,
        });
      }

      // Update UI
      updateCurrentOrderUI();
      showToast("Item added to order", "success");
    });
  });

  discountSelect.addEventListener("change", function () {
    updateCurrentOrderUI();
  });

  completeOrderBtn.addEventListener("click", function () {
    if (currentOrder.length === 0) {
      showToast("Please add items to your order", "error");
      return;
    }

    if (!attendeeSelect.value) {
      showToast("Please select an attendee", "error");
      return;
    }

    if (!paymentTypeSelect.value) {
      showToast("Please select a payment type", "error");
      return;
    }

    // Calculate order total
    const subtotal = currentOrder.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discount = parseInt(discountSelect.value);
    const total = subtotal - discount;

    // Create order object
    const order = {
      id: Date.now(),
      attendee: attendeeSelect.value,
      paymentType: paymentTypeSelect.value,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      items: [...currentOrder],
      subtotal,
      discount,
      total,
    };

    // Add to daily orders
    const today = order.date;
    const existingDayIndex = dailyOrders.findIndex((day) => day.date === today);

    if (existingDayIndex !== -1) {
      dailyOrders[existingDayIndex].orders.push(order);
      dailyOrders[existingDayIndex].total += order.total;
    } else {
      dailyOrders.push({
        date: today,
        orders: [order],
        total: order.total,
      });
    }

    // Save to localStorage
    StorageUtils.saveDailyOrders(dailyOrders);

    // Reset current order
    currentOrder = [];
    attendeeSelect.value = "";
    paymentTypeSelect.value = "";
    discountSelect.value = "0";
    updateCurrentOrderUI();
    updateDailyOrdersUI();
    updateOrdersPage();

    showToast("Order completed successfully!", "success");
  });

  exportExcelBtn.addEventListener("click", function () {
    if (dailyOrders.length === 0) {
      showToast("No orders to export", "error");
      return;
    }

    exportDailyOrdersExcel();
  });

  exportPdfBtn.addEventListener("click", function () {
    if (dailyOrders.length === 0) {
      showToast("No orders to export", "error");
      return;
    }

    // Show loading state
    const originalHtml = this.innerHTML;
    this.innerHTML = '<span class="loading-spinner"></span> Generating PDF...';
    this.disabled = true;

    // Calculate total sales
    let totalSales = 0;
    dailyOrders.forEach((day) => {
      totalSales += day.total;
    });

    // Generate PDF content
    generateDailyOrdersPdf(dailyOrders, totalSales, function () {
      // Reset button state
      exportPdfBtn.innerHTML = originalHtml;
      exportPdfBtn.disabled = false;
      showToast("PDF file exported successfully", "success");
    });
  });

  exportOrdersExcelBtn.addEventListener("click", function () {
    if (dailyOrders.length === 0) {
      showToast("No orders to export", "error");
      return;
    }

    exportAllOrdersExcel();
  });

  exportOrdersPdfBtn.addEventListener("click", function () {
    if (dailyOrders.length === 0) {
      showToast("No orders to export", "error");
      return;
    }

    // Show loading state
    const originalHtml = this.innerHTML;
    this.innerHTML = '<span class="loading-spinner"></span> Generating PDF...';
    this.disabled = true;

    // Calculate total sales
    let totalSales = 0;
    let totalDiscounts = 0;

    dailyOrders.forEach((day) => {
      day.orders.forEach((order) => {
        totalSales += order.total;
        totalDiscounts += order.discount;
      });
    });

    // Generate PDF content
    generateAllOrdersPdf(dailyOrders, totalSales, totalDiscounts, function () {
      // Reset button state
      exportOrdersPdfBtn.innerHTML = originalHtml;
      exportOrdersPdfBtn.disabled = false;
      showToast("PDF file exported successfully", "success");
    });
  });

  // Event delegation for view orders buttons
  document.addEventListener("click", function (event) {
    if (event.target.closest(".view-day-orders")) {
      const button = event.target.closest(".view-day-orders");
      const date = button.getAttribute("data-date");
      const day = dailyOrders.find((d) => d.date === date);

      if (day) {
        showDayOrdersModal(day);
      }
    }

    if (event.target.closest(".view-order-details")) {
      const button = event.target.closest(".view-order-details");
      const orderId = parseInt(button.getAttribute("data-order-id"));
      const date = button.getAttribute("data-date");
      const day = dailyOrders.find((d) => d.date === date);

      if (day) {
        const order = day.orders.find((o) => o.id === orderId);
        if (order) {
          showOrderDetailsModal(order);
        }
      }
    }
  });

  // Helper functions
  function exportDailyOrdersExcel() {
    // Calculate total sales
    let totalSales = 0;
    dailyOrders.forEach((day) => {
      totalSales += day.total;
    });

    // Prepare data for Excel
    let excelData = [];

    // Add headers
    excelData.push([
      "Date",
      "Attendee",
      "Payment Type",
      "Time",
      "Item",
      "Price",
      "Quantity",
      "Subtotal",
      "Discount",
      "Total",
    ]);

    // Add order data
    dailyOrders.forEach((day) => {
      day.orders.forEach((order) => {
        order.items.forEach((item) => {
          excelData.push([
            day.date,
            order.attendee,
            order.paymentType,
            order.time,
            item.name,
            `₦${item.price}`,
            item.quantity,
            `₦${item.price * item.quantity}`,
            `₦${order.discount}`,
            `₦${order.total}`,
          ]);
        });
      });
    });

    // Add empty row and total sales
    excelData.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "TOTAL SALES:",
      `₦${totalSales.toLocaleString()}`,
    ]);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws["!cols"] = [
      { wch: 12 }, // Date
      { wch: 15 }, // Attendee
      { wch: 15 }, // Payment Type
      { wch: 10 }, // Time
      { wch: 30 }, // Item
      { wch: 10 }, // Price
      { wch: 10 }, // Quantity
      { wch: 12 }, // Subtotal
      { wch: 12 }, // Discount
      { wch: 12 }, // Total
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    // Save workbook
    XLSX.writeFile(wb, "CHOPS_GRILLS_Orders.xlsx");

    showToast("Excel file exported successfully", "success");
  }

  function exportAllOrdersExcel() {
    // Calculate totals
    let totalSales = 0;
    let totalDiscounts = 0;
    let totalSubtotals = 0;

    // Prepare data for Excel
    let excelData = [];

    // Add headers
    excelData.push([
      "Date",
      "Time",
      "Attendee",
      "Payment Type",
      "Items Count",
      "Subtotal",
      "Discount",
      "Total",
    ]);

    // Add order data
    dailyOrders.forEach((day) => {
      day.orders.forEach((order) => {
        totalSales += order.total;
        totalDiscounts += order.discount;
        totalSubtotals += order.subtotal;

        excelData.push([
          day.date,
          order.time,
          order.attendee,
          order.paymentType,
          order.items.length,
          `₦${order.subtotal}`,
          `₦${order.discount}`,
          `₦${order.total}`,
        ]);
      });
    });

    // Add empty row and totals
    excelData.push(["", "", "", "", "", "", "", ""]);
    excelData.push([
      "",
      "",
      "",
      "",
      "TOTALS:",
      `₦${totalSubtotals.toLocaleString()}`,
      `₦${totalDiscounts.toLocaleString()}`,
      `₦${totalSales.toLocaleString()}`,
    ]);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws["!cols"] = [
      { wch: 12 }, // Date
      { wch: 10 }, // Time
      { wch: 15 }, // Attendee
      { wch: 15 }, // Payment Type
      { wch: 12 }, // Items Count
      { wch: 12 }, // Subtotal
      { wch: 12 }, // Discount
      { wch: 12 }, // Total
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "All Orders");

    // Save workbook
    XLSX.writeFile(wb, "CHOPS_GRILLS_All_Orders.xlsx");

    showToast("Excel file exported successfully", "success");
  }

  function updateCurrentOrderUI() {
    if (currentOrder.length === 0) {
      currentOrderItems.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="bi bi-cart-x icon-3rem"></i>
          <p class="mt-2">No items in order. Select items from the menu.</p>
        </div>
      `;
    } else {
      let html = "";
      currentOrder.forEach((item, index) => {
        html += `
          <div class="order-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>${item.name}</strong>
                <div class="text-muted small">₦${item.price.toLocaleString()} × ${
          item.quantity
        }</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary">₦${(
                  item.price * item.quantity
                ).toLocaleString()}</span>
                <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      });
      currentOrderItems.innerHTML = html;

      // Add event listeners to remove buttons
      document.querySelectorAll(".remove-item").forEach((btn) => {
        btn.addEventListener("click", function () {
          const index = parseInt(this.getAttribute("data-index"));
          currentOrder.splice(index, 1);
          updateCurrentOrderUI();
          showToast("Item removed from order", "info");
        });
      });
    }

    // Calculate totals
    const subtotal = currentOrder.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discount = parseInt(discountSelect.value);
    const total = subtotal - discount;

    // Update summary
    subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
    discountAmountEl.textContent = `₦${discount.toLocaleString()}`;
    totalEl.textContent = `₦${total.toLocaleString()}`;
  }

  function updateDailyOrdersUI() {
    if (dailyOrders.length === 0) {
      dailyOrdersList.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="bi bi-calendar-x icon-3rem"></i>
          <p class="mt-2">No orders recorded yet.</p>
        </div>
      `;
    } else {
      let html = "";
      dailyOrders.forEach((day) => {
        const formattedDate = new Date(day.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        html += `
          <div class="daily-order-card card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>${formattedDate}</span>
              <div>
                <span class="badge bg-primary me-2">${
                  day.orders.length
                } Orders</span>
                <span class="badge bg-success">₦${day.total.toLocaleString()}</span>
                <button class="btn btn-sm btn-view-order ms-2 view-day-orders" data-date="${
                  day.date
                }">
                  <i class="bi bi-eye"></i> View
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Attendee</th>
                      <th>Items</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
        `;

        day.orders.forEach((order) => {
          const itemsSummary = order.items
            .map((item) => `${item.name} (${item.quantity})`)
            .join(", ");
          html += `
            <tr>
              <td>${order.time}</td>
              <td>${order.attendee}</td>
              <td>${itemsSummary}</td>
              <td>₦${order.total.toLocaleString()}</td>
            </tr>
          `;
        });

        html += `
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      });
      dailyOrdersList.innerHTML = html;
    }
  }

  function updateOrdersPage() {
    if (dailyOrders.length === 0) {
      allOrdersTableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center text-muted py-4">
            <i class="bi bi-inbox icon-3rem"></i>
            <p class="mt-2">No orders found.</p>
          </td>
        </tr>
      `;
    } else {
      let html = "";
      dailyOrders.forEach((day) => {
        day.orders.forEach((order) => {
          const itemsSummary = order.items
            .map((item) => `${item.name} (${item.quantity})`)
            .join(", ");
          html += `
            <tr>
              <td>${day.date}</td>
              <td>${order.time}</td>
              <td>${order.attendee}</td>
              <td>${order.paymentType}</td>
              <td>${itemsSummary}</td>
              <td>₦${order.subtotal.toLocaleString()}</td>
              <td>₦${order.discount.toLocaleString()}</td>
              <td>₦${order.total.toLocaleString()}</td>
              <td>
                <button class="btn btn-sm btn-view-order view-order-details" data-order-id="${
                  order.id
                }" data-date="${day.date}">
                  <i class="bi bi-eye"></i> Details
                </button>
              </td>
            </tr>
          `;
        });
      });
      allOrdersTableBody.innerHTML = html;
    }
  }

  // Initialize UI
  updateCurrentOrderUI();
  updateDailyOrdersUI();
  updateOrdersPage();
});
