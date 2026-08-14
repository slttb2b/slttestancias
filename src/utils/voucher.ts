import { Booking, ResortInfo } from '../types';

export const generateVoucherHTML = (booking: Booking, resortInfo: ResortInfo): string => {
  const addOnsList = booking.selectedAddOns && booking.selectedAddOns.length > 0
    ? booking.selectedAddOns.map(a => `<li><strong>${a.name}</strong> - ₱${a.price.toLocaleString()}</li>`).join('')
    : '<li>None</li>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SLTT ESTANCIAS - Confirmation Voucher (${booking.referenceNumber || booking.id})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f4f5f3;
      color: #1c2a20;
      padding: 40px 20px;
    }
    .voucher-card {
      max-width: 750px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .voucher-header {
      background-color: #132016;
      color: #ebe5de;
      padding: 32px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .voucher-header h1 {
      font-size: 24px;
      font-family: Georgia, serif;
      letter-spacing: 1px;
      color: #ad9e92;
      margin-bottom: 4px;
    }
    .voucher-header p {
      font-size: 13px;
      color: #c3ccc0;
    }
    .ref-badge {
      background: #1c2a20;
      border: 1px solid #ad9e92;
      padding: 8px 16px;
      border-radius: 8px;
      text-align: right;
    }
    .ref-badge .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #c3ccc0;
    }
    .ref-badge .code {
      font-size: 16px;
      font-weight: bold;
      color: #ad9e92;
      font-family: monospace;
    }
    .status-bar {
      background-color: #fcf9f4;
      border-bottom: 1px solid #f0e6da;
      padding: 14px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .status-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
      background-color: #e6f4ea;
      color: #137333;
    }
    .voucher-body {
      padding: 36px 40px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #556b5a;
      margin-bottom: 16px;
      border-bottom: 2px solid #eef2ed;
      padding-bottom: 6px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }
    .info-group {
      font-size: 14px;
      line-height: 1.6;
    }
    .info-group label {
      display: block;
      font-size: 11px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .info-group value {
      font-weight: 600;
      color: #1a202c;
    }
    .table-details {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
      font-size: 14px;
    }
    .table-details th {
      background-color: #f8faf7;
      text-align: left;
      padding: 10px 14px;
      font-size: 11px;
      text-transform: uppercase;
      color: #4a5568;
      border-bottom: 1px solid #e2e8f0;
    }
    .table-details td {
      padding: 12px 14px;
      border-bottom: 1px solid #edf2f7;
    }
    .summary-box {
      background-color: #faf9f6;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #eee8df;
      margin-bottom: 28px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 14px;
    }
    .summary-row.total {
      border-top: 1px solid #ded5c9;
      margin-top: 8px;
      padding-top: 12px;
      font-weight: bold;
      font-size: 18px;
      color: #132016;
    }
    .notice-box {
      background-color: #edf7f0;
      border-left: 4px solid #34a853;
      padding: 16px;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      color: #1c3d25;
      line-height: 1.6;
    }
    .voucher-footer {
      background-color: #f8faf7;
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #718096;
      border-top: 1px solid #e2e8f0;
    }
    .actions {
      text-align: center;
      margin-top: 30px;
    }
    .btn-print {
      background-color: #132016;
      color: #ebe5de;
      border: none;
      padding: 12px 28px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-print:hover { background-color: #1c2a20; }
    @media print {
      body { background: #fff; padding: 0; }
      .voucher-card { box-shadow: none; border: none; width: 100%; max-width: 100%; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="voucher-card">
    <div class="voucher-header">
      <div>
        <h1>${resortInfo.name || 'SLTT ESTANCIAS'}</h1>
        <p>Official Reservation Confirmation Voucher</p>
      </div>
      <div class="ref-badge">
        <div class="label">Reference No.</div>
        <div class="code">${booking.referenceNumber || booking.id}</div>
      </div>
    </div>

    <div class="status-bar">
      <div>Issued Date: <strong>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
      <div>Booking Status: <span class="status-pill">${booking.status || 'Confirmed'}</span></div>
    </div>

    <div class="voucher-body">
      <div class="section-title">Guest Details</div>
      <div class="grid-2">
        <div class="info-group">
          <label>Primary Guest Name</label>
          <div class="value">${booking.guestName}</div>
        </div>
        <div class="info-group">
          <label>Contact Phone / Mobile</label>
          <div class="value">${booking.mobile}</div>
        </div>
        <div class="info-group">
          <label>Email Address</label>
          <div class="value">${booking.email}</div>
        </div>
        <div class="info-group">
          <label>Guest Count</label>
          <div class="value">${booking.adultsCount} Adult(s), ${booking.childrenCount} Child(ren)</div>
        </div>
      </div>

      <div class="section-title">Stay & Accommodation Summary</div>
      <table class="table-details">
        <thead>
          <tr>
            <th>Accommodation Unit</th>
            <th>Capacity</th>
            <th>Check-In Date</th>
            <th>Check-Out Date</th>
            <th>Rate / Duration</th>
          </tr>
        </thead>
        <tbody>
          ${booking.allocatedRooms && booking.allocatedRooms.length > 0
            ? booking.allocatedRooms.map(rm => `
              <tr>
                <td><strong>${rm.name}</strong> <span style="font-size: 11px; color: #556b5a;">(${rm.category || 'Standard'})</span></td>
                <td>Up to ${rm.maxGuests} Guests</td>
                <td>${booking.checkInDate} (2:00 PM)</td>
                <td>${booking.checkOutDate} (12:00 PM)</td>
                <td>₱${rm.pricePerNight.toLocaleString()} / night</td>
              </tr>
            `).join('')
            : `
              <tr>
                <td><strong>${booking.roomName}</strong></td>
                <td>${booking.adultsCount + booking.childrenCount} Guests</td>
                <td>${booking.checkInDate} (2:00 PM)</td>
                <td>${booking.checkOutDate} (12:00 PM)</td>
                <td>${booking.numberOfNights} Night(s)</td>
              </tr>
            `
          }
        </tbody>
      </table>

      <div class="section-title">Billing & Payment Information</div>
      <div class="summary-box">
        <div class="summary-row">
          <span>Accommodation Subtotal (${booking.numberOfNights} night/s)</span>
          <span>₱${booking.subtotal.toLocaleString()}</span>
        </div>
        ${booking.addOnsTotal > 0 ? `
        <div class="summary-row">
          <span>Selected Add-Ons Total</span>
          <span>₱${booking.addOnsTotal.toLocaleString()}</span>
        </div>` : ''}
        <div class="summary-row">
          <span>Taxes & Environmental Fee</span>
          <span>₱${booking.taxAmount.toLocaleString()}</span>
        </div>
        <div class="summary-row total">
          <span>Total Grand Amount</span>
          <span>₱${booking.totalAmount.toLocaleString()}</span>
        </div>
        <div class="summary-row" style="margin-top: 8px; color: #556b5a; font-weight: 600;">
          <span>Payment Option Chosen</span>
          <span>${booking.paymentMethod} (${booking.paymentStatus})</span>
        </div>
      </div>

      <div class="section-title">Important Resort Policies</div>
      <div class="notice-box">
        <strong>Check-In Policy:</strong> Standard Check-In starts at 2:00 PM; Check-Out is at 12:00 PM noon.<br>
        <strong>Voucher Instructions:</strong> Please present a digital copy or printed copy of this voucher along with a valid Government ID at the front desk upon arrival.<br>
        <strong>Resort Address:</strong> ${resortInfo.address}<br>
        <strong>Hotline / Inquiry:</strong> ${resortInfo.contactNumber} | ${resortInfo.email}
      </div>
    </div>

    <div class="voucher-footer">
      <p>Thank you for choosing ${resortInfo.name || 'SLTT ESTANCIAS'}! We wish you a peaceful and relaxing stay.</p>
    </div>
  </div>

  <div class="actions">
    <button class="btn-print" onclick="window.print()">Print or Save as PDF</button>
  </div>
</body>
</html>`;
};

export const downloadVoucher = (booking: Booking, resortInfo: ResortInfo) => {
  const htmlContent = generateVoucherHTML(booking, resortInfo);

  // 1. Download HTML Voucher file
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `Voucher_${booking.referenceNumber || booking.id || 'SLTT'}.html`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  // 2. Try to open print window if popups are permitted
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  } catch (err) {
    console.warn('Pop-up window for print blocked, HTML voucher file was downloaded directly instead.', err);
  }
};
