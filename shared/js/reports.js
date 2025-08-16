// Reports page functionality for Chops & Grills Enterprise

document.addEventListener("DOMContentLoaded", function () {
  // Initialize data
  const dailyOrders = StorageUtils.getDailyOrders();
  let filteredData = dailyOrders; // This will hold the filtered data
  let currentFilters = {
    dateFrom: "",
    dateTo: "",
    attendee: "",
  };

  // DOM Elements
  const totalOrdersStat = document.getElementById("totalOrdersStat");
  const totalSalesStat = document.getElementById("totalSalesStat");
  const avgOrderStat = document.getElementById("avgOrderStat");
  const totalDiscountsStat = document.getElementById("totalDiscountsStat");
  const attendeeSalesTableBody = document.getElementById(
    "attendeeSalesTableBody"
  );
  const dateSalesTableBody = document.getElementById("dateSalesTableBody");
  const popularItemsTableBody = document.getElementById(
    "popularItemsTableBody"
  );
  const paymentMethodTableBody = document.getElementById(
    "paymentMethodTableBody"
  );
  const peakHours = document.getElementById("peakHours");
  const peakDays = document.getElementById("peakDays");
  const performanceMetrics = document.getElementById("performanceMetrics");

  // Filter elements
  const dateFromFilter = document.getElementById("dateFromFilter");
  const dateToFilter = document.getElementById("dateToFilter");
  const attendeeFilter = document.getElementById("attendeeFilter");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const filterStatus = document.getElementById("filterStatus");

  // Export buttons
  const exportDetailedExcelBtn = document.getElementById(
    "exportDetailedExcelBtn"
  );
  const exportDetailedPdfBtn = document.getElementById("exportDetailedPdfBtn");
  const exportSummaryExcelBtn = document.getElementById(
    "exportSummaryExcelBtn"
  );
  const exportSummaryPdfBtn = document.getElementById("exportSummaryPdfBtn");

  // Event Listeners
  exportDetailedExcelBtn.addEventListener("click", exportDetailedExcel);
  exportDetailedPdfBtn.addEventListener("click", exportDetailedPdf);
  exportSummaryExcelBtn.addEventListener("click", exportSummaryExcel);
  exportSummaryPdfBtn.addEventListener("click", exportSummaryPdf);

  // Filter event listeners
  applyFiltersBtn.addEventListener("click", applyFilters);
  clearFiltersBtn.addEventListener("click", clearFilters);

  // Initialize filters and reports
  initializeFilters();
  updateReportsPage();

  function updateReportsPage() {
    // Calculate statistics using filtered data
    let totalOrders = 0;
    let totalSales = 0;
    let totalDiscounts = 0;

    const attendeeSales = {};
    const dateSales = {};
    const itemSales = {};
    const paymentMethodSales = {};
    const hourSales = {};
    const daySales = {};

    filteredData.forEach((day) => {
      day.orders.forEach((order) => {
        totalOrders++;
        totalSales += order.total;
        totalDiscounts += order.discount;

        // Sales by attendee
        if (!attendeeSales[order.attendee]) {
          attendeeSales[order.attendee] = {
            orders: 0,
            total: 0,
          };
        }
        attendeeSales[order.attendee].orders++;
        attendeeSales[order.attendee].total += order.total;

        // Sales by date
        if (!dateSales[day.date]) {
          dateSales[day.date] = {
            orders: 0,
            total: 0,
          };
        }
        dateSales[day.date].orders++;
        dateSales[day.date].total += order.total;

        // Item sales
        order.items.forEach((item) => {
          if (!itemSales[item.name]) {
            itemSales[item.name] = {
              quantity: 0,
              revenue: 0,
            };
          }
          itemSales[item.name].quantity += item.quantity;
          itemSales[item.name].revenue += item.price * item.quantity;
        });

        // Payment method analysis
        if (!paymentMethodSales[order.paymentType]) {
          paymentMethodSales[order.paymentType] = {
            orders: 0,
            total: 0,
          };
        }
        paymentMethodSales[order.paymentType].orders++;
        paymentMethodSales[order.paymentType].total += order.total;

        // Hour analysis
        const hour = parseInt(order.time.split(":")[0]);
        if (!hourSales[hour]) {
          hourSales[hour] = 0;
        }
        hourSales[hour]++;

        // Day analysis
        const dayName = new Date(day.date).toLocaleDateString("en-US", {
          weekday: "long",
        });
        if (!daySales[dayName]) {
          daySales[dayName] = 0;
        }
        daySales[dayName]++;
      });
    });

    // Update statistics
    totalOrdersStat.textContent = totalOrders;
    totalSalesStat.textContent = `₦${totalSales.toLocaleString()}`;
    avgOrderStat.textContent = `₦${
      totalOrders > 0
        ? Math.round(totalSales / totalOrders).toLocaleString()
        : 0
    }`;
    totalDiscountsStat.textContent = `₦${totalDiscounts.toLocaleString()}`;

    // Update attendee sales table
    updateAttendeeSalesTable(attendeeSales);

    // Update date sales table
    updateDateSalesTable(dateSales);

    // Update popular items table
    updatePopularItemsTable(itemSales);

    // Update payment method table
    updatePaymentMethodTable(paymentMethodSales, totalSales);

    // Update time-based analysis
    updateTimeBasedAnalysis(hourSales, daySales, totalOrders, totalSales);
  }

  function updateAttendeeSalesTable(attendeeSales) {
    attendeeSalesTableBody.innerHTML = "";
    const sortedAttendees = Object.keys(attendeeSales).sort(
      (a, b) => attendeeSales[b].total - attendeeSales[a].total
    );

    if (sortedAttendees.length === 0) {
      attendeeSalesTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted py-4">
            No data available
          </td>
        </tr>
      `;
    } else {
      sortedAttendees.forEach((attendee) => {
        const data = attendeeSales[attendee];
        const avgOrder = Math.round(data.total / data.orders);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${attendee}</td>
          <td>${data.orders}</td>
          <td>₦${data.total.toLocaleString()}</td>
          <td>₦${avgOrder.toLocaleString()}</td>
        `;
        attendeeSalesTableBody.appendChild(row);
      });
    }
  }

  function updateDateSalesTable(dateSales) {
    dateSalesTableBody.innerHTML = "";
    const sortedDates = Object.keys(dateSales).sort().reverse();

    if (sortedDates.length === 0) {
      dateSalesTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted py-4">
            No data available
          </td>
        </tr>
      `;
    } else {
      sortedDates.forEach((date) => {
        const data = dateSales[date];
        const avgOrder = Math.round(data.total / data.orders);
        const formattedDate = new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${formattedDate}</td>
          <td>${data.orders}</td>
          <td>₦${data.total.toLocaleString()}</td>
          <td>₦${avgOrder.toLocaleString()}</td>
        `;
        dateSalesTableBody.appendChild(row);
      });
    }
  }

  function updatePopularItemsTable(itemSales) {
    popularItemsTableBody.innerHTML = "";
    const sortedItems = Object.keys(itemSales).sort(
      (a, b) => itemSales[b].quantity - itemSales[a].quantity
    );

    if (sortedItems.length === 0) {
      popularItemsTableBody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted py-4">
            No data available
          </td>
        </tr>
      `;
    } else {
      sortedItems.slice(0, 10).forEach((item) => {
        const data = itemSales[item];
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item}</td>
          <td>${data.quantity}</td>
          <td>₦${data.revenue.toLocaleString()}</td>
        `;
        popularItemsTableBody.appendChild(row);
      });
    }
  }

  function updatePaymentMethodTable(paymentMethodSales, totalSales) {
    paymentMethodTableBody.innerHTML = "";
    const sortedMethods = Object.keys(paymentMethodSales).sort(
      (a, b) => paymentMethodSales[b].total - paymentMethodSales[a].total
    );

    if (sortedMethods.length === 0) {
      paymentMethodTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted py-4">
            No data available
          </td>
        </tr>
      `;
    } else {
      sortedMethods.forEach((method) => {
        const data = paymentMethodSales[method];
        const percentage =
          totalSales > 0 ? ((data.total / totalSales) * 100).toFixed(1) : 0;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${method}</td>
          <td>${data.orders}</td>
          <td>₦${data.total.toLocaleString()}</td>
          <td>${percentage}%</td>
        `;
        paymentMethodTableBody.appendChild(row);
      });
    }
  }

  function updateTimeBasedAnalysis(
    hourSales,
    daySales,
    totalOrders,
    totalSales
  ) {
    // Peak hours
    const sortedHours = Object.keys(hourSales).sort(
      (a, b) => hourSales[b] - hourSales[a]
    );

    if (sortedHours.length === 0) {
      peakHours.innerHTML = '<div class="text-muted">No data available</div>';
    } else {
      let peakHoursHtml = "";
      sortedHours.slice(0, 3).forEach((hour, index) => {
        const label = index === 0 ? "Peak:" : "";
        peakHoursHtml += `
          <div class="mb-1">
            <strong>${label} ${hour}:00-${parseInt(hour) + 1}:00</strong>
            <span class="badge bg-primary ms-2">${hourSales[hour]} orders</span>
          </div>
        `;
      });
      peakHours.innerHTML = peakHoursHtml;
    }

    // Peak days
    const sortedDays = Object.keys(daySales).sort(
      (a, b) => daySales[b] - daySales[a]
    );

    if (sortedDays.length === 0) {
      peakDays.innerHTML = '<div class="text-muted">No data available</div>';
    } else {
      let peakDaysHtml = "";
      sortedDays.slice(0, 3).forEach((day, index) => {
        const label = index === 0 ? "Peak:" : "";
        peakDaysHtml += `
          <div class="mb-1">
            <strong>${label} ${day}</strong>
            <span class="badge bg-success ms-2">${daySales[day]} orders</span>
          </div>
        `;
      });
      peakDays.innerHTML = peakDaysHtml;
    }

    // Performance metrics
    if (totalOrders === 0) {
      performanceMetrics.innerHTML =
        '<div class="text-muted">No data available</div>';
    } else {
      const avgDailySales = totalSales / Math.max(dailyOrders.length, 1);
      const avgDailyOrders = totalOrders / Math.max(dailyOrders.length, 1);

      performanceMetrics.innerHTML = `
        <div class="mb-1">
          <strong>Avg Daily Sales:</strong>
          <span class="text-success">₦${Math.round(
            avgDailySales
          ).toLocaleString()}</span>
        </div>
        <div class="mb-1">
          <strong>Avg Daily Orders:</strong>
          <span class="text-primary">${Math.round(avgDailyOrders)}</span>
        </div>
        <div class="mb-1">
          <strong>Operating Days:</strong>
          <span class="text-info">${dailyOrders.length}</span>
        </div>
      `;
    }
  }

  // Export functions
  function exportDetailedExcel() {
    if (filteredData.length === 0) {
      showToast("No data to export", "error");
      return;
    }

    // Calculate total sales
    let totalSales = 0;
    filteredData.forEach((day) => {
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
      "Item Total",
      "Order Discount",
      "Order Total",
    ]);

    // Add order data
    filteredData.forEach((day) => {
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

    // Add total
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

    // Create and save workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    ws["!cols"] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 30 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Detailed Report");
    XLSX.writeFile(wb, "CHOPS_GRILLS_Detailed_Report.xlsx");

    showToast("Detailed Excel report exported successfully", "success");
  }

  function exportDetailedPdf() {
    if (filteredData.length === 0) {
      showToast("No data to export", "error");
      return;
    }

    // Show loading state
    const originalHtml = exportDetailedPdfBtn.innerHTML;
    exportDetailedPdfBtn.innerHTML =
      '<span class="loading-spinner"></span> Generating PDF...';
    exportDetailedPdfBtn.disabled = true;

    // Calculate total sales
    let totalSales = 0;
    filteredData.forEach((day) => {
      totalSales += day.total;
    });

    // Generate PDF
    generateDailyOrdersPdf(filteredData, totalSales, function () {
      exportDetailedPdfBtn.innerHTML = originalHtml;
      exportDetailedPdfBtn.disabled = false;
      showToast("Detailed PDF report exported successfully", "success");
    });
  }

  function exportSummaryExcel() {
    if (filteredData.length === 0) {
      showToast("No data to export", "error");
      return;
    }

    // Calculate totals
    let totalSales = 0;
    let totalDiscounts = 0;
    let totalSubtotals = 0;

    // Prepare data for Excel
    let excelData = [];

    // Add headers
    excelData.push([
      "Date",
      "Orders Count",
      "Total Sales",
      "Total Discounts",
      "Gross Sales",
    ]);

    // Add daily summary data
    filteredData.forEach((day) => {
      let dayDiscounts = 0;
      let daySubtotals = 0;

      day.orders.forEach((order) => {
        dayDiscounts += order.discount;
        daySubtotals += order.subtotal;
      });

      totalSales += day.total;
      totalDiscounts += dayDiscounts;
      totalSubtotals += daySubtotals;

      excelData.push([
        day.date,
        day.orders.length,
        `₦${day.total.toLocaleString()}`,
        `₦${dayDiscounts.toLocaleString()}`,
        `₦${daySubtotals.toLocaleString()}`,
      ]);
    });

    // Add totals
    excelData.push(["", "", "", "", ""]);
    excelData.push([
      "TOTALS",
      filteredData.reduce((sum, day) => sum + day.orders.length, 0),
      `₦${totalSales.toLocaleString()}`,
      `₦${totalDiscounts.toLocaleString()}`,
      `₦${totalSubtotals.toLocaleString()}`,
    ]);

    // Create and save workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    ws["!cols"] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Summary Report");
    XLSX.writeFile(wb, "CHOPS_GRILLS_Summary_Report.xlsx");

    showToast("Summary Excel report exported successfully", "success");
  }

  function exportSummaryPdf() {
    if (filteredData.length === 0) {
      showToast("No data to export", "error");
      return;
    }

    // Show loading state
    const originalHtml = exportSummaryPdfBtn.innerHTML;
    exportSummaryPdfBtn.innerHTML =
      '<span class="loading-spinner"></span> Generating PDF...';
    exportSummaryPdfBtn.disabled = true;

    // Calculate totals
    let totalSales = 0;
    let totalDiscounts = 0;

    filteredData.forEach((day) => {
      day.orders.forEach((order) => {
        totalSales += order.total;
        totalDiscounts += order.discount;
      });
    });

    // Generate PDF
    generateAllOrdersPdf(filteredData, totalSales, totalDiscounts, function () {
      exportSummaryPdfBtn.innerHTML = originalHtml;
      exportSummaryPdfBtn.disabled = false;
      showToast("Summary PDF report exported successfully", "success");
    });
  }

  // Filter functions
  function initializeFilters() {
    // Populate attendee filter with unique attendees
    const attendees = new Set();
    dailyOrders.forEach((day) => {
      day.orders.forEach((order) => {
        attendees.add(order.attendee);
      });
    });

    // Clear and populate attendee filter
    attendeeFilter.innerHTML = '<option value="">All Attendees</option>';
    Array.from(attendees)
      .sort()
      .forEach((attendee) => {
        const option = document.createElement("option");
        option.value = attendee;
        option.textContent = attendee;
        attendeeFilter.appendChild(option);
      });

    // No default date range - start with all data
    updateFilterStatus();
  }

  function applyFilters() {
    currentFilters.dateFrom = dateFromFilter.value;
    currentFilters.dateTo = dateToFilter.value;
    currentFilters.attendee = attendeeFilter.value;

    // Filter the data
    filteredData = dailyOrders.filter((day) => {
      // Date filtering
      if (currentFilters.dateFrom && day.date < currentFilters.dateFrom) {
        return false;
      }
      if (currentFilters.dateTo && day.date > currentFilters.dateTo) {
        return false;
      }

      // If attendee filter is applied, check if this day has orders from that attendee
      if (currentFilters.attendee) {
        const hasAttendeeOrders = day.orders.some(
          (order) => order.attendee === currentFilters.attendee
        );
        if (!hasAttendeeOrders) {
          return false;
        }
      }

      return true;
    });

    // If attendee filter is applied, also filter orders within the days
    if (currentFilters.attendee) {
      filteredData = filteredData.map((day) => ({
        ...day,
        orders: day.orders.filter(
          (order) => order.attendee === currentFilters.attendee
        ),
        total: day.orders
          .filter((order) => order.attendee === currentFilters.attendee)
          .reduce((sum, order) => sum + order.total, 0),
      }));
    }

    // Update filter status
    updateFilterStatus();

    // Update reports with filtered data
    updateReportsPage();

    showToast("Filters applied successfully", "success");
  }

  function clearFilters() {
    dateFromFilter.value = "";
    dateToFilter.value = "";
    attendeeFilter.value = "";

    currentFilters = {
      dateFrom: "",
      dateTo: "",
      attendee: "",
    };

    filteredData = dailyOrders;
    updateFilterStatus();
    updateReportsPage();

    showToast("Filters cleared", "info");
  }

  function updateFilterStatus() {
    let statusText = "Showing ";
    let hasFilters = false;

    if (currentFilters.dateFrom || currentFilters.dateTo) {
      hasFilters = true;
      if (currentFilters.dateFrom && currentFilters.dateTo) {
        statusText += `data from ${currentFilters.dateFrom} to ${currentFilters.dateTo}`;
      } else if (currentFilters.dateFrom) {
        statusText += `data from ${currentFilters.dateFrom}`;
      } else if (currentFilters.dateTo) {
        statusText += `data up to ${currentFilters.dateTo}`;
      }
    }

    if (currentFilters.attendee) {
      if (hasFilters) {
        statusText += ` for attendee: ${currentFilters.attendee}`;
      } else {
        statusText += `data for attendee: ${currentFilters.attendee}`;
        hasFilters = true;
      }
    }

    if (!hasFilters) {
      statusText = "Showing all data";
    }

    filterStatus.innerHTML = `<i class="bi bi-info-circle"></i> ${statusText}`;
  }
});
