// Shared utility functions for Chops & Grills Enterprise

// Toast notification system
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `custom-toast toast-${type}`;

  const iconMap = {
    success: "bi-check-circle",
    error: "bi-x-circle",
    info: "bi-info-circle",
  };

  toast.innerHTML = `
    <i class="bi ${iconMap[type]} toast-icon"></i>
    <div>${message}</div>
  `;

  document.querySelector(".toast-container").appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Local storage utilities
const StorageUtils = {
  getDailyOrders: () => {
    return JSON.parse(localStorage.getItem("dailyOrders")) || [];
  },

  saveDailyOrders: (orders) => {
    localStorage.setItem("dailyOrders", JSON.stringify(orders));
  },

  clearAllData: () => {
    localStorage.removeItem("dailyOrders");
  },
};

// PDF generation utilities
function generateDailyOrdersPdf(dailyOrders, totalSales, callback) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>CHOPS & GRILLS ENTERPRISE - Daily Orders Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: middle; }
            th { background-color: #4f6367; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
            .total-row { font-weight: bold; background-color: #4f6367; color: white; }
            .total-row td { text-align: right; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>CHOPS & GRILLS ENTERPRISE - Daily Orders Report</h1>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Attendee</th>
                    <th>Payment Type</th>
                    <th>Time</th>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Discount</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
  `;

  dailyOrders.forEach((day) => {
    day.orders.forEach((order) => {
      const numItems = order.items.length;
      if (numItems === 0) return;

      order.items.forEach((item, index) => {
        html += `
          <tr>
              ${index === 0 ? `<td rowspan="${numItems}">${day.date}</td>` : ""}
              ${
                index === 0
                  ? `<td rowspan="${numItems}">${order.attendee}</td>`
                  : ""
              }
              ${
                index === 0
                  ? `<td rowspan="${numItems}">${order.paymentType}</td>`
                  : ""
              }
              ${
                index === 0
                  ? `<td rowspan="${numItems}">${order.time}</td>`
                  : ""
              }
              <td>${item.name}</td>
              <td>₦${item.price.toLocaleString()}</td>
              <td>${item.quantity}</td>
              <td>₦${(item.price * item.quantity).toLocaleString()}</td>
              ${
                index === 0
                  ? `<td rowspan="${numItems}">₦${order.discount.toLocaleString()}</td>`
                  : ""
              }
              ${
                index === 0
                  ? `<td rowspan="${numItems}">₦${order.total.toLocaleString()}</td>`
                  : ""
              }
          </tr>
        `;
      });
    });
  });

  html += `
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="9" style="text-align: right; padding-right: 10px;">TOTAL SALES:</td>
                    <td>₦${totalSales.toLocaleString()}</td>
                </tr>
            </tfoot>
        </table>
    </body>
    </html>
  `;

  const element = document.createElement("div");
  element.innerHTML = html;

  const opt = {
    margin: 0.5,
    filename: "CHOPS_GRILLS_Daily_Orders.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
  };

  html2pdf()
    .from(element)
    .set(opt)
    .save()
    .then(function () {
      if (callback) callback();
    });
}

function generateAllOrdersPdf(
  dailyOrders,
  totalSales,
  totalDiscounts,
  callback
) {
  let totalSubtotals = 0;
  let totalOrders = 0;
  dailyOrders.forEach((day) => {
    day.orders.forEach((order) => {
      totalSubtotals += order.subtotal;
      totalOrders++;
    });
  });

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>CHOPS & GRILLS ENTERPRISE - All Orders Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4f6367; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
            .total-row { font-weight: bold; background-color: #4f6367; color: white; }
            .total-row td { text-align: right; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>CHOPS & GRILLS ENTERPRISE - All Orders Report</h1>
            <p>Total Orders: ${totalOrders}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Attendee</th>
                    <th>Payment Type</th>
                    <th>Items Count</th>
                    <th>Subtotal</th>
                    <th>Discount</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
  `;

  dailyOrders.forEach((day) => {
    day.orders.forEach((order) => {
      html += `
        <tr>
            <td>${day.date}</td>
            <td>${order.time}</td>
            <td>${order.attendee}</td>
            <td>${order.paymentType}</td>
            <td>${order.items.length}</td>
            <td>₦${order.subtotal.toLocaleString()}</td>
            <td>₦${order.discount.toLocaleString()}</td>
            <td>₦${order.total.toLocaleString()}</td>
        </tr>
      `;
    });
  });

  html += `
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="5" style="text-align: right; padding-right: 10px;">TOTALS:</td>
                    <td>₦${totalSubtotals.toLocaleString()}</td>
                    <td>₦${totalDiscounts.toLocaleString()}</td>
                    <td>₦${totalSales.toLocaleString()}</td>
                </tr>
            </tfoot>
        </table>
    </body>
    </html>
  `;

  const element = document.createElement("div");
  element.innerHTML = html;

  const opt = {
    margin: 0.5,
    filename: "CHOPS_GRILLS_All_Orders.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
  };

  html2pdf()
    .from(element)
    .set(opt)
    .save()
    .then(function () {
      if (callback) callback();
    });
}

// Modal utilities
function showDayOrdersModal(day) {
  let modalHtml = `
    <div class="modal fade" id="dayOrdersModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Orders for ${new Date(
                      day.date
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Attendee</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
  `;

  day.orders.forEach((order) => {
    const itemsSummary = order.items
      .map((item) => `${item.name} (${item.quantity})`)
      .join(", ");
    modalHtml += `
      <tr>
          <td>${order.time}</td>
          <td>${order.attendee}</td>
          <td>${itemsSummary}</td>
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

  modalHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById("dayOrdersModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("dayOrdersModal"));
  modal.show();
}

function showOrderDetailsModal(order) {
  let modalHtml = `
    <div class="modal fade" id="orderDetailsModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Order Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-3">
                        <div class="col-6">
                            <strong>Date:</strong> ${new Date(
                              order.date
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                        </div>
                        <div class="col-6">
                            <strong>Time:</strong> ${order.time}
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <strong>Attendee:</strong> ${order.attendee}
                        </div>
                        <div class="col-6">
                            <strong>Payment:</strong> ${order.paymentType}
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <strong>Total:</strong> ₦${order.total.toLocaleString()}
                        </div>
                    </div>
                    <hr>
                    <h6>Items:</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
  `;

  order.items.forEach((item) => {
    modalHtml += `
      <tr>
          <td>${item.name}</td>
          <td>₦${item.price.toLocaleString()}</td>
          <td>${item.quantity}</td>
          <td>₦${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `;
  });

  modalHtml += `
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3"><strong>Subtotal:</strong></td>
                                    <td><strong>₦${order.subtotal.toLocaleString()}</strong></td>
                                </tr>
                                <tr>
                                    <td colspan="3"><strong>Discount:</strong></td>
                                    <td><strong>₦${order.discount.toLocaleString()}</strong></td>
                                </tr>
                                <tr>
                                    <td colspan="3"><strong>Total:</strong></td>
                                    <td><strong>₦${order.total.toLocaleString()}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById("orderDetailsModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Show modal
  const modal = new bootstrap.Modal(
    document.getElementById("orderDetailsModal")
  );
  modal.show();
}
