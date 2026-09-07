import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Order } from "../store/useStore";
import {
  Package,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Download,
  Eye
} from "./ui/solar-icons";
import { formatNepali } from "../utils/nepaliDate";
import { OrderPhotoGalleryModal } from "./ui/OrderPhotoGalleryModal";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryType, setGalleryType] = useState<"product" | "location">("product");
  const [galleryIndex, setGalleryIndex] = useState(0);

  if (!order) return null;

  const productImages = Array.isArray(order.productImages) && order.productImages.length > 0
    ? order.productImages
    : (order.productImageUrl ? [order.productImageUrl] : []);

  const locationImages = Array.isArray(order.locationImages) && order.locationImages.length > 0
    ? order.locationImages
    : (order.locationImageUrl ? [order.locationImageUrl] : []);

  const totalImagesCount = productImages.length + locationImages.length;
  const hasAttachedImages = totalImagesCount > 0;

  const handleOpenGallery = (type: "product" | "location", index: number = 0) => {
    setGalleryType(type);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  // Pure isolated print generator: guarantees EXACTLY 2 pages with ZERO blank pages
  const handlePrint = () => {
    const orderDateStr = formatNepali(order.orderDate || order.createdAt);
    const deliveryDateStr = formatNepali(order.deliveryDate);
    const refCode = order._id?.slice(-8)?.toUpperCase() || "ORD-SPEC";
    const generatedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Combine all images into a clean structured list
    const allImages: Array<{ type: "product" | "location"; url: string; label: string; sub: string }> = [];

    productImages.forEach((url, i) => {
      allImages.push({
        type: "product",
        url,
        label: `Design Artwork #${i + 1}`,
        sub: `${order.productName} (${order.size})`,
      });
    });

    locationImages.forEach((url, i) => {
      allImages.push({
        type: "location",
        url,
        label: `Site Location Photo #${i + 1}`,
        sub: order.customerAddress || order.customerName,
      });
    });

    const totalCount = allImages.length;

    // Determine grid columns and card heights so ALL images fit on 1 sheet (Page 2)
    let gridCols = 2;
    let cardHeight = "125mm";
    let imgWrapHeight = "105mm";

    if (totalCount === 1) {
      gridCols = 1;
      cardHeight = "150mm";
      imgWrapHeight = "130mm";
    } else if (totalCount === 2) {
      gridCols = 2;
      cardHeight = "135mm";
      imgWrapHeight = "115mm";
    } else if (totalCount <= 4) {
      gridCols = 2;
      cardHeight = "95mm";
      imgWrapHeight = "78mm";
    } else if (totalCount <= 6) {
      gridCols = 3;
      cardHeight = "95mm";
      imgWrapHeight = "78mm";
    } else if (totalCount <= 8) {
      gridCols = 4;
      cardHeight = "92mm";
      imgWrapHeight = "76mm";
    } else {
      // 9+ images
      gridCols = 4;
      cardHeight = "64mm";
      imgWrapHeight = "50mm";
    }

    // Build Page 2 Content HTML
    let page2BodyHtml = "";

    if (totalCount === 0) {
      page2BodyHtml = `
        <div style="border: 1.5px dashed #d1d5db; border-radius: 8px; padding: 25px 20px; text-align: center; margin: 25px 0 20px 0; background: #fafafa;">
          <div style="font-size: 13px; font-weight: 800; color: #374151; margin-bottom: 6px;">No Image Files Attached To This Order</div>
          <div style="font-size: 9px; color: #6b7280; max-width: 440px; margin: 0 auto; line-height: 1.5;">
            This order specification was processed without uploaded 2D/3D design artwork files or on-site location photos. Standard fabrication guidelines, dimension requirements, and client specifications on Page 1 govern this project.
          </div>
        </div>

        <div class="section-title" style="margin-top: 15px;">Quality Control & Technical Verification Checklist</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 6px;">
          <tr style="background: #f3f4f6; font-weight: bold;">
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb; width: 45px; text-align: center;">Status</td>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb;">Quality & Fabrication Checkpoint</td>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb; width: 140px;">Verified By</td>
          </tr>
          <tr>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb; text-align: center;">[ &nbsp; ]</td>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb;">Dimension & Color Verification (${order.size} / ${order.color})</td>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb;">Fabrication Lead</td>
          </tr>
          <tr>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb; text-align: center;">[ &nbsp; ]</td>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb;">LED / Neon Power & Wattage Load Testing (2-Hour Burn-in)</td>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb;">Electrical Tech</td>
          </tr>
          <tr>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb; text-align: center;">[ &nbsp; ]</td>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb;">Waterproof Acrylic Sealing & Outdoor Rating Check</td>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb;">Quality Inspector</td>
          </tr>
          <tr>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb; text-align: center;">[ &nbsp; ]</td>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb;">Protective Packaging & Mounting Fasteners Included</td>
            <td style="padding: 5px 8px; border: 1px solid #e5e7eb;">Dispatch Officer</td>
          </tr>
        </table>
      `;
    } else {
      const cardsHtml = allImages.map((img) => `
        <div class="img-card" style="height: ${cardHeight};">
          <div class="img-card-header">
            <span><b>${img.type === "product" ? "🎨 Design" : "📍 Site"}</b></span>
            <span class="img-card-sub">${img.sub}</span>
          </div>
          <div class="img-wrap" style="height: ${imgWrapHeight};">
            <img src="${img.url}" alt="${img.label}" crossorigin="anonymous" />
          </div>
        </div>
      `).join("");

      page2BodyHtml = `
        <div class="p2-summary-bar">
          <span><b>Attached Media:</b> ${productImages.length} Design Artwork(s) &bull; ${locationImages.length} Site Survey Photo(s)</span>
          <span style="font-family: ui-monospace, SFMono-Regular, monospace; font-size: 8px;">TOTAL: ${totalCount} ATTACHMENT(S)</span>
        </div>
        <div class="p2-grid" style="grid-template-columns: repeat(${gridCols}, 1fr);">
          ${cardsHtml}
        </div>
      `;
    }

    const printDocumentHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title></title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            *, *:before, *:after {
              box-sizing: border-box !important;
              margin: 0;
              padding: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm !important;
              background: #ffffff !important;
              color: #111827 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .sheet {
              width: 210mm !important;
              height: 275mm !important;
              max-height: 275mm !important;
              padding: 9mm 11mm !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              position: relative !important;
              background: #ffffff !important;
            }
            .sheet-1 {
              page-break-after: always !important;
              break-after: page !important;
              page-break-before: avoid !important;
              break-before: avoid !important;
            }
            .sheet-2 {
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-before: avoid !important;
              break-before: avoid !important;
            }
            /* Header */
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #111827;
              padding-bottom: 5px;
              margin-bottom: 7px;
            }
            .brand-logo-img {
              width: 44px;
              height: 44px;
              object-fit: contain;
              border-radius: 6px;
              margin-right: 10px;
              display: block;
              background: #ffffff;
            }
            .brand-title {
              font-size: 18px;
              font-weight: 900;
              letter-spacing: -0.5px;
              text-transform: uppercase;
              line-height: 1;
              color: #111827;
            }
            .brand-sub {
              font-size: 8px;
              font-weight: 600;
              color: #4b5563;
              text-transform: uppercase;
              margin-top: 3px;
              letter-spacing: 0.3px;
            }
            .header-right {
              text-align: right;
            }
            .doc-type {
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #111827;
            }
            .doc-ref {
              font-size: 10.5px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-weight: 700;
              color: #1f2937;
              margin-top: 2px;
            }
            .doc-date {
              font-size: 8px;
              color: #6b7280;
              margin-top: 1px;
            }
            .doc-badge {
              display: inline-block;
              font-size: 8.5px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-weight: 700;
              background: #111827;
              color: #ffffff;
              padding: 2px 7px;
              border-radius: 4px;
            }

            /* Top Status 4-Pill Bar */
            .top-status-bar {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 6px;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 4px 8px;
              margin-bottom: 7px;
            }
            .status-pill {
              display: flex;
              flex-direction: column;
            }
            .pill-label {
              font-size: 7px;
              font-weight: 700;
              text-transform: uppercase;
              color: #6b7280;
              letter-spacing: 0.3px;
            }
            .pill-val {
              font-size: 9px;
              font-weight: 800;
              color: #111827;
              margin-top: 1px;
            }
            .stage-badge {
              color: #2563eb;
            }
            .text-green {
              color: #059669;
            }
            .text-amber {
              color: #d97706;
            }

            /* Grids */
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              margin-bottom: 6px;
            }
            .section-title {
              font-size: 8.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1.5px solid #111827;
              padding-bottom: 2px;
              margin-bottom: 5px;
              color: #111827;
            }
            .field-box {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 5px;
              padding: 4px 7px;
              margin-bottom: 5px;
            }
            .field-label {
              font-size: 7px;
              font-weight: 700;
              text-transform: uppercase;
              color: #6b7280;
              margin-bottom: 1px;
              letter-spacing: 0.3px;
            }
            .field-value {
              font-size: 9.5px;
              font-weight: 700;
              color: #111827;
            }

            /* Notes Callout */
            .notes-callout {
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-left: 3px solid #f59e0b;
              border-radius: 5px;
              padding: 5px 8px;
              margin-top: 3px;
              margin-bottom: 6px;
            }
            .notes-header {
              font-size: 7.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.4px;
              color: #92400e;
              margin-bottom: 2px;
            }
            .notes-body {
              font-size: 8.5px;
              line-height: 1.35;
              color: #78350f;
              white-space: pre-wrap;
              max-height: 52px;
              overflow: hidden;
            }

            /* Table */
            .table-box {
              width: 100%;
              border-collapse: collapse;
              margin-top: 3px;
              margin-bottom: 5px;
              font-size: 8.5px;
            }
            .table-head th {
              background: #f3f4f6;
              font-size: 7.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.4px;
              padding: 3.5px 6px;
              border-bottom: 1.5px solid #d1d5db;
            }
            .table-box td {
              padding: 3px 6px;
              border-bottom: 1px solid #f3f4f6;
            }
            .subtotal-row td {
              border-top: 1.5px solid #e5e7eb;
              background: #fafafa;
              font-size: 8.5px;
            }
            .highlight-total td {
              background: #111827 !important;
              color: #ffffff !important;
              border: none !important;
              padding: 4px 6px !important;
            }

            /* Timeline Grid */
            .timeline-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 5px;
              margin-top: 5px;
              margin-bottom: 5px;
            }
            .timeline-box {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 5px;
              padding: 3.5px 5px;
            }
            .timeline-label {
              font-size: 6.5px;
              font-weight: 700;
              text-transform: uppercase;
              color: #6b7280;
            }
            .timeline-val {
              font-size: 8.5px;
              font-weight: 800;
              color: #111827;
              margin-top: 1px;
            }

            /* Terms */
            .terms-box {
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 5px;
              padding: 4px 7px;
              margin-top: 5px;
              margin-bottom: 6px;
              font-size: 7px;
              color: #4b5563;
              line-height: 1.35;
              display: flex;
              flex-direction: column;
              gap: 1.5px;
            }

            /* Signatures */
            .sig-block {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
              margin-top: 6px;
              padding-top: 8px;
              border-top: 1.5px solid #d1d5db;
              font-size: 8px;
            }
            .sig-title {
              font-weight: 800;
              font-size: 8px;
              color: #4b5563;
              text-transform: uppercase;
            }
            .sig-name {
              font-weight: 800;
              font-size: 9.5px;
              margin-top: 2px;
              color: #111827;
            }
            .sig-role {
              font-size: 7px;
              color: #6b7280;
              margin-top: 1px;
            }
            .sig-line {
              margin-top: 24px;
              border-bottom: 1.5px solid #9ca3af;
              width: 160px;
            }
            .sig-sub {
              font-size: 7px;
              color: #9ca3af;
              margin-top: 2px;
            }

            /* Sheet Footer */
            .sheet-footer {
              position: absolute;
              bottom: 6mm;
              left: 11mm;
              right: 11mm;
              border-top: 1px solid #e5e7eb;
              padding-top: 3px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 7.5px;
              color: #6b7280;
            }

            /* Page 2 Styling */
            .p2-summary-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 4px 10px;
              font-size: 8.5px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .p2-grid {
              display: grid;
              gap: ${totalCount <= 4 ? "8px" : "6px"};
            }
            .img-card {
              border: 1px solid #d1d5db;
              border-radius: 6px;
              overflow: hidden;
              background: #ffffff;
              display: flex;
              flex-direction: column;
            }
            .img-card-header {
              background: #f3f4f6;
              border-bottom: 1px solid #e5e7eb;
              padding: 3px 6px;
              font-size: 8px;
              font-weight: 700;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .img-card-sub {
              font-weight: normal;
              color: #4b5563;
              font-size: 7.5px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 120px;
            }
            .img-wrap {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 4px;
              background: #fafafa;
              overflow: hidden;
              flex: 1;
            }
            .img-wrap img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <!-- PAGE 1: COMPREHENSIVE JOB SPECIFICATIONS, FINANCIALS & SIGNATURES -->
          <div class="sheet sheet-1">
            <!-- Header Bar -->
            <div class="header-bar">
              <div style="display: flex; align-items: center;">
                <img src="/admin/logo/ktm-decor.svg" alt="KTM DECOR" class="brand-logo-img" />
                <div>
                  <div class="brand-title">KTM DECOR</div>
                  <div class="brand-sub">Custom Signage • Neon Fabrication • On-Site Installation • Kathmandu, Nepal</div>
                </div>
              </div>
              <div class="header-right">
                <div class="doc-type">OFFICIAL PRODUCTION JOB ORDER</div>
                <div class="doc-ref">Ref: #${refCode}</div>
                <div class="doc-date">Issued: ${orderDateStr} &bull; Printed: ${generatedDate}</div>
              </div>
            </div>

            <!-- Top 4-Pill Status Bar -->
            <div class="top-status-bar">
              <div class="status-pill">
                <span class="pill-label">Workflow Stage</span>
                <span class="pill-val stage-badge">${order.stage.toUpperCase()}</span>
              </div>
              <div class="status-pill">
                <span class="pill-label">Audit Verification</span>
                <span class="pill-val ${order.approved ? 'text-green' : 'text-amber'}">${order.approved ? "VERIFIED & APPROVED ✓" : "PENDING VERIFICATION"}</span>
              </div>
              <div class="status-pill">
                <span class="pill-label">Sales Channel</span>
                <span class="pill-val">${order.orderFrom.toUpperCase()}</span>
              </div>
              <div class="status-pill">
                <span class="pill-label">Payment Mode</span>
                <span class="pill-val">${order.paymentMethod.replace("_", " ").toUpperCase()}</span>
              </div>
            </div>

            <!-- Core 2-Column Specifications Master Grid -->
            <div class="grid-2">
              <!-- Column 1: Client & Delivery Details -->
              <div>
                <div class="section-title">1. Client & Delivery Information</div>
                
                <div class="field-box">
                  <div class="field-label">Client Full Name</div>
                  <div class="field-value" style="font-size: 10.5px;">${order.customerName}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                  <div class="field-box">
                    <div class="field-label">Primary Contact</div>
                    <div class="field-value">📞 ${order.customerContact}</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">Email Address</div>
                    <div class="field-value" style="font-size: 8.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${order.customerEmail ? `✉️ ${order.customerEmail}` : "Not specified"}
                    </div>
                  </div>
                </div>

                <div class="field-box">
                  <div class="field-label">Installation / Delivery Site Address</div>
                  <div class="field-value" style="font-size: 9px; line-height: 1.3;">📍 ${order.customerAddress}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                  <div class="field-box" style="margin-bottom: 0;">
                    <div class="field-label">Booking Staff</div>
                    <div class="field-value" style="font-size: 8.5px;">${order.createdBy?.name || "KTM Staff"} (${order.createdBy?.role || "Staff"})</div>
                  </div>
                  <div class="field-box" style="margin-bottom: 0;">
                    <div class="field-label">Assigned Project Lead</div>
                    <div class="field-value" style="font-size: 8.5px;">${order.assignee?.name || "KTM Workshop Lead"}</div>
                  </div>
                </div>
              </div>

              <!-- Column 2: Product & Fabrication Parameters -->
              <div>
                <div class="section-title">2. Signage Technical Specifications</div>

                <div class="field-box">
                  <div class="field-label">Product Name / Model</div>
                  <div class="field-value" style="font-size: 10.5px;">${order.productName}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                  <div class="field-box">
                    <div class="field-label">Dimensions (Size)</div>
                    <div class="field-value">${order.size}</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">Color / LED Tint</div>
                    <div class="field-value">${order.color}</div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                  <div class="field-box">
                    <div class="field-label">Mounting Base</div>
                    <div class="field-value" style="font-size: 8.5px;">Laser Acrylic Backing / Standoffs</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">Power & Transformer</div>
                    <div class="field-value" style="font-size: 8.5px;">12V DC Adapter (220V AC Input)</div>
                  </div>
                </div>

                <div class="field-box" style="margin-bottom: 0;">
                  <div class="field-label">Attached Design & Site Media</div>
                  <div class="field-value" style="font-size: 8px; font-weight: normal; color: #374151;">
                    <b>${productImages.length}</b> Design Blueprint(s) &bull; <b>${locationImages.length}</b> Site Survey Photo(s)
                    <span style="color: #111827; font-weight: bold;"> (Formatted on Page 2)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Manufacturing Notes Callout Box -->
            <div class="notes-callout">
              <div class="notes-header">3. Manufacturing Instructions & Customization Specifications</div>
              <div class="notes-body">
                ${order.manufacturingNotes || "Fabricate strictly to approved dimension and color specifications. Test electrical continuity and conduct a minimum 2-hour burn-in inspection before packaging."}
              </div>
            </div>

            <!-- Commercial & Billing Breakdown Table -->
            <div class="section-title" style="margin-top: 6px;">4. Commercial & Financial Settlement</div>
            <table class="table-box">
              <thead>
                <tr class="table-head">
                  <th style="text-align: left; width: 45%;">Work Specification & Service Item</th>
                  <th style="text-align: center; width: 25%;">Service Classification</th>
                  <th style="text-align: right; width: 30%;">Amount (NPR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>${order.productName}</b> (${order.size}, ${order.color})</td>
                  <td style="text-align: center; color: #4b5563;">Custom Fabrication</td>
                  <td style="text-align: right; font-weight: 700;">Rs. ${order.price.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Safe Packaging & Doorstep Transportation Surcharge</td>
                  <td style="text-align: center; color: #4b5563;">Logistics</td>
                  <td style="text-align: right; font-weight: 700;">Rs. ${order.deliveryPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>On-Site Installation, Wall Mounting & Electrical Hookup</td>
                  <td style="text-align: center; color: #4b5563;">Installation Service</td>
                  <td style="text-align: right; font-weight: 700;">Rs. ${order.installationPrice.toLocaleString()}</td>
                </tr>
                <tr class="subtotal-row">
                  <td colspan="2" style="text-align: right; font-weight: bold;">Gross Project Subtotal:</td>
                  <td style="text-align: right; font-weight: bold;">Rs. ${(order.price + order.deliveryPrice + order.installationPrice).toLocaleString()}</td>
                </tr>
                <tr style="background: #f0fdf4;">
                  <td colspan="2" style="color: #059669; font-weight: 700;">
                    Advance Deposit Received (${order.paymentMethod.replace("_", " ").toUpperCase()})
                  </td>
                  <td style="text-align: right; color: #059669; font-weight: 800;">- Rs. ${order.advancePayment.toLocaleString()}</td>
                </tr>
                <tr style="background: #fef2f2;">
                  <td colspan="2" style="color: #dc2626; font-weight: 700;">
                    Remaining Balance Due (Payable Upon Delivery / Handover)
                  </td>
                  <td style="text-align: right; color: #dc2626; font-weight: 800;">Rs. ${order.duePayment.toLocaleString()}</td>
                </tr>
                <tr class="highlight-total">
                  <td colspan="2" style="font-weight: 900; text-transform: uppercase; font-size: 9.5px;">
                    Net Total Contract Price:
                  </td>
                  <td style="text-align: right; font-weight: 900; font-size: 11px;">Rs. ${order.totalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <!-- Project Milestones Timeline Grid -->
            <div class="timeline-grid">
              <div class="timeline-box">
                <div class="timeline-label">Order Booked Date</div>
                <div class="timeline-val">${orderDateStr}</div>
              </div>
              <div class="timeline-box">
                <div class="timeline-label">Target Delivery Deadline</div>
                <div class="timeline-val">${deliveryDateStr}</div>
              </div>
              <div class="timeline-box">
                <div class="timeline-label">Fabrication Supervisor</div>
                <div class="timeline-val">${order.assignee?.name || "KTM Workshop Lead"}</div>
              </div>
              <div class="timeline-box">
                <div class="timeline-label">Production Status</div>
                <div class="timeline-val" style="color: #059669;">${order.stage.toUpperCase()}</div>
              </div>
            </div>

            <!-- Fabrication Policy & Handover Guidelines -->
            <div class="terms-box">
              <div><b>🛡️ Warranty:</b> 1-Year replacement warranty covering internal LED strip & 12V transformer against manufacturing defects.</div>
              <div><b>⚡ Site Requirement:</b> Client must ensure a functioning 220V AC wall socket is accessible within 2 meters of mounting point.</div>
              <div><b>🚚 Settlement:</b> Outstanding balance (Rs. ${order.duePayment.toLocaleString()}) payable upon delivery & handover verification.</div>
            </div>

            <!-- Signatures Block -->
            <div class="sig-block">
              <div>
                <div class="sig-title">Prepared & Authorized By</div>
                <div class="sig-name">${order.assignee?.name || "KTM DECOR Fabrication Lead"}</div>
                <div class="sig-role">Custom Signage & Metal/Neon Division • Kathmandu, Nepal</div>
                <div class="sig-line"></div>
                <div class="sig-sub">Authorized Signature & Company Seal</div>
              </div>
              <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                <div style="width: 100%;">
                  <div class="sig-title">Client Acceptance & Handover Sign-Off</div>
                  <div class="sig-name">${order.customerName}</div>
                  <div class="sig-role">Contact: ${order.customerContact} &bull; ${order.customerAddress}</div>
                  <div class="sig-line" style="margin-left: auto;"></div>
                  <div class="sig-sub">Client Signature & Date</div>
                </div>
              </div>
            </div>

            <!-- Sheet 1 Footer -->
            <div class="sheet-footer">
              <span>KTM DECOR &bull; Official Job Order & Fabrication Specification Sheet</span>
              <span>Page 1 of 2 (Attachments & Media on Page 2)</span>
            </div>
          </div>

          <!-- PAGE 2: ATTACHED IMAGES / VISUAL ASSETS -->
          <div class="sheet sheet-2">
            <div class="header-bar">
              <div style="display: flex; align-items: center;">
                <img src="/admin/logo/ktm-decor.svg" alt="KTM DECOR" class="brand-logo-img" />
                <div>
                  <div class="brand-title">KTM DECOR</div>
                  <div class="brand-sub">Attached Design Artwork & Site Photos</div>
                </div>
              </div>
              <div class="header-right">
                <div class="doc-badge">PAGE 2 OF 2 &bull; ATTACHMENTS</div>
                <div class="doc-ref">Ref: #${refCode}</div>
                <div class="doc-date">Client: ${order.customerName}</div>
              </div>
            </div>

            ${page2BodyHtml}

            <!-- Sheet 2 Footer -->
            <div class="sheet-footer">
              <span>KTM DECOR &bull; Quality Assurance & Attachment Record</span>
              <span>Page 2 of 2</span>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create an isolated hidden iframe with true A4 dimensions
    const printIframe = document.createElement("iframe");
    printIframe.style.position = "fixed";
    printIframe.style.top = "-9999px";
    printIframe.style.left = "-9999px";
    printIframe.style.width = "210mm";
    printIframe.style.height = "297mm";
    printIframe.style.border = "0";
    printIframe.style.zIndex = "-9999";
    printIframe.style.opacity = "0";
    printIframe.style.pointerEvents = "none";
    document.body.appendChild(printIframe);

    const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(printIframe);
      window.print();
      return;
    }

    iframeDoc.open();
    iframeDoc.write(printDocumentHtml);
    iframeDoc.close();

    const cleanup = () => {
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 1500);
    };

    if (printIframe.contentWindow) {
      printIframe.contentWindow.onafterprint = cleanup;
    }
    setTimeout(cleanup, 60000);

    const triggerPrint = () => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      } catch (err) {
        console.error("Iframe print error:", err);
      }
    };

    // Wait for all images inside iframe to decode so they render crisply
    const imgs = Array.from(iframeDoc.querySelectorAll("img"));
    if (imgs.length === 0) {
      setTimeout(triggerPrint, 150);
    } else {
      let loaded = 0;
      const total = imgs.length;
      let finished = false;

      const checkAllLoaded = () => {
        if (!finished && loaded >= total) {
          finished = true;
          requestAnimationFrame(() => {
            setTimeout(triggerPrint, 150);
          });
        }
      };

      imgs.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) {
          loaded++;
        } else {
          img.onload = () => {
            loaded++;
            checkAllLoaded();
          };
          img.onerror = () => {
            loaded++;
            checkAllLoaded();
          };
        }
      });

      checkAllLoaded();
      // Maximum timeout safety (always print even if an image takes too long)
      setTimeout(() => {
        if (!finished) {
          finished = true;
          triggerPrint();
        }
      }, 1500);
    }
  };

  const modalContent = (
    <div 
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-card w-full max-w-2xl sm:max-w-4xl lg:max-w-5xl rounded-[28px] border border-border/80 shadow-2xl animate-scale-up max-h-[90vh] flex flex-col overflow-hidden text-left"
      >
        {/* Screen Fixed Header */}
        <div className="shrink-0 px-5 sm:px-7 py-3.5 sm:py-4 border-b border-border/60 bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display flex items-center gap-2 text-foreground">
                  <Package className="text-accent" />
                  Order Detail Overview
                </h2>
                <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full tracking-wider text-white shadow-xs ${
                  order.stage === "paid"
                    ? "bg-emerald-600"
                    : order.stage === "delivered" || order.approved
                    ? "bg-blue-600"
                    : order.stage === "completed"
                    ? "bg-purple-600"
                    : order.stage === "manufacturing"
                    ? "bg-red-600"
                    : "bg-amber-600"
                }`}>
                  {order.stage}
                </span>
              </div>
              {/* Header Dates Bar */}
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted">
                <div className="flex items-center gap-1 font-medium">
                  <span className="text-muted uppercase text-[10px] font-bold">Order Date (अर्डर मिति):</span>
                  <strong className="text-foreground">{formatNepali(order.orderDate || order.createdAt)}</strong>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 font-medium">
                  <span className="text-muted uppercase text-[10px] font-bold">Delivery Target (डेलिभरी):</span>
                  <strong className="text-foreground">{formatNepali(order.deliveryDate)}</strong>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
                }}
                className="flex items-center gap-1.5 py-2 px-4 text-black rounded-2xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer"
                title="Download PDF / Print"
              >
                <Download size={13} />
                PDF / Print
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-muted hover:text-foreground p-1.5 rounded-xl hover:bg-muted/20 transition-all cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Body on Screen: Single smooth scrollbar, zero side-scroll overflow */}
        <div className="p-5 sm:p-7 overflow-y-auto overflow-x-hidden flex-1 overscroll-contain">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUMN 1: PRODUCT & MFG */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border/60 pb-1.5">
                Product & Design Specifications
              </h3>

              <div className="space-y-1.5">
                <div className="text-[10px] text-muted uppercase font-semibold">Product Name</div>
                <div className="text-xs font-bold text-foreground bg-border/20 px-3.5 py-2.5 rounded-2xl border border-border/60">{order.productName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-[10px] text-muted uppercase font-semibold">Size</div>
                  <div className="text-xs font-bold bg-border/20 px-3 py-2 rounded-2xl border border-border/60">{order.size}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted uppercase font-semibold">Color</div>
                  <div className="text-xs font-bold bg-border/20 px-3 py-2 rounded-2xl border border-border/60">{order.color}</div>
                </div>
              </div>

              {/* Photos Quick Overview / Jump Links */}
              <div className="space-y-2 p-3 bg-card border border-border/70 rounded-2xl">
                <div className="text-[10px] text-muted uppercase font-semibold flex items-center justify-between">
                  <span>Attached Visual Assets</span>
                  <span className="text-[9px] text-accent font-bold">
                    {totalImagesCount} Total Files
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                      <Package size={13} className="text-amber-600" />
                      <span>Design Artwork</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-black text-foreground">
                        {productImages.length} {productImages.length === 1 ? "Image" : "Images"}
                      </span>
                      {productImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenGallery("product", 0)}
                          className="text-[10px] text-accent font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Eye size={10} /> View
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/20 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                      <MapPin size={13} className="text-blue-600" />
                      <span>Site Photos</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-black text-foreground">
                        {locationImages.length} {locationImages.length === 1 ? "Image" : "Images"}
                      </span>
                      {locationImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenGallery("location", 0)}
                          className="text-[10px] text-accent font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Eye size={10} /> View
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick thumbnail previews (Clickable to view in full lightbox) */}
                {hasAttachedImages && (
                  <div className="pt-1 flex items-center gap-1.5 overflow-x-auto py-1">
                    {productImages.slice(0, 4).map((img, idx) => (
                      <div
                        key={`col1-thumb-prod-${idx}`}
                        onClick={() => handleOpenGallery("product", idx)}
                        className="relative w-12 h-12 rounded-xl border border-amber-500/30 overflow-hidden flex-shrink-0 cursor-pointer hover:border-accent group"
                        title={`Design Artwork #${idx + 1}`}
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <span className="absolute bottom-0 right-0 bg-black/80 text-[7px] text-white font-bold px-1 rounded-tl">
                          D{idx + 1}
                        </span>
                      </div>
                    ))}
                    {locationImages.slice(0, 4).map((img, idx) => (
                      <div
                        key={`col1-thumb-loc-${idx}`}
                        onClick={() => handleOpenGallery("location", idx)}
                        className="relative w-12 h-12 rounded-xl border border-blue-500/30 overflow-hidden flex-shrink-0 cursor-pointer hover:border-accent group"
                        title={`Site Photo #${idx + 1}`}
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <span className="absolute bottom-0 right-0 bg-black/80 text-[7px] text-white font-bold px-1 rounded-tl">
                          S{idx + 1}
                        </span>
                      </div>
                    ))}
                    <span className="text-[9px] text-muted whitespace-nowrap pl-1">
                      (Click thumb to view)
                    </span>
                  </div>
                )}
              </div>

              {/* Manufacturing notes */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-muted uppercase font-semibold">Manufacturing Notes / Specs</div>
                <div className="p-3.5 bg-accent/5 border border-dashed border-accent/20 rounded-2xl text-xs text-muted min-h-[70px] whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto">
                  {order.manufacturingNotes || "No specific manufacturing description provided."}
                </div>
              </div>

            </div>

            {/* COLUMN 2: CLIENT & FINANCIALS */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border/60 pb-1.5">
                Client & Pricing Overview
              </h3>

              <div className="space-y-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
                <div className="text-xs text-foreground font-bold flex items-center gap-2">
                  <User size={13} className="text-accent" />
                  {order.customerName}
                </div>
                <div className="text-xs text-muted flex items-center gap-2">
                  <Phone size={11} />
                  {order.customerContact}
                </div>
                {order.customerEmail && (
                  <div className="text-xs text-muted flex items-center gap-2">
                    <Mail size={11} />
                    {order.customerEmail}
                  </div>
                )}
                <div className="text-xs text-muted flex items-start gap-2 border-t border-border/60 pt-2.5 mt-2 leading-relaxed font-medium">
                  <MapPin size={12} className="text-accent flex-shrink-0 mt-0.5" />
                  <span>{order.customerAddress}</span>
                </div>
              </div>

              {/* Pricing summary */}
              <div className="space-y-2 p-4 bg-background/60 border border-border/80 rounded-2xl shadow-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted">Product Base Price:</span>
                  <span className="font-semibold text-foreground">Rs. {order.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted">Delivery Cost:</span>
                  <span className="font-semibold text-foreground">Rs. {order.deliveryPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted">Installation Cost:</span>
                  <span className="font-semibold text-foreground">Rs. {order.installationPrice.toLocaleString()}</span>
                </div>
                <div className="border-t border-border/70 pt-2 flex justify-between text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Advance Payment Received:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Rs. {order.advancePayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-red-500 font-bold">Remaining Outstanding Due:</span>
                  <span className="font-bold text-red-500">Rs. {order.duePayment.toLocaleString()}</span>
                </div>
                <div className="border-t border-border/80 pt-2.5 mt-2 flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase text-muted tracking-wide">Final Net Pricing:</span>
                  <strong className="text-base text-accent font-display">Rs. {order.totalPrice.toLocaleString()}</strong>
                </div>
              </div>

              {/* Platform, Payment & Timeline Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
                <div className="space-y-1">
                  <span className="text-muted block text-[10px] uppercase font-semibold">Order Date (अर्डर)</span>
                  <div className="font-bold text-foreground">
                    {formatNepali(order.orderDate || order.createdAt)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted block text-[10px] uppercase font-semibold">Delivery Target (डेलिभरी)</span>
                  <div className="font-bold text-foreground flex items-center gap-1">
                    <Clock size={11} className="text-accent" />
                    {formatNepali(order.deliveryDate)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted block text-[10px] uppercase font-semibold">Project Lead</span>
                  <div className="font-bold text-foreground">
                    {order.assignee?.name || "Unassigned"}
                  </div>
                </div>
                <div className="space-y-1 pt-2.5 border-t border-border/40">
                  <span className="text-muted block text-[10px] uppercase font-semibold">Sales Platform</span>
                  <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider text-white shadow-xs ${
                    order.orderFrom === "tiktok"
                      ? "bg-black"
                      : order.orderFrom === "instagram"
                      ? "bg-pink-600"
                      : order.orderFrom === "whatsapp"
                      ? "bg-emerald-600"
                      : "bg-blue-600"
                  }`}>
                    {order.orderFrom}
                  </span>
                </div>
                <div className="space-y-1 pt-2.5 border-t border-border/40">
                  <span className="text-muted block text-[10px] uppercase font-semibold">Payment Method</span>
                  <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider text-white shadow-xs ${
                    order.paymentMethod === "esewa"
                      ? "bg-teal-600"
                      : order.paymentMethod === "online_banking"
                      ? "bg-indigo-600"
                      : order.paymentMethod === "cheque"
                      ? "bg-amber-600"
                      : "bg-emerald-700"
                  }`}>
                    {order.paymentMethod.replace("_", " ")}
                  </span>
                </div>
                <div className="space-y-1 pt-2.5 border-t border-border/40">
                  <span className="text-muted block text-[10px] uppercase font-semibold">Approval Status</span>
                  <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full text-white shadow-xs ${
                    order.approved ? "bg-emerald-600" : "bg-neutral-600"
                  }`}>
                    {order.approved ? "Verified ✓" : "Pending"}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Pinned Screen Footer */}
        <div className="shrink-0 px-5 sm:px-7 py-3 sm:py-3.5 border-t border-border/60 bg-card/95 backdrop-blur-xs flex justify-end rounded-b-[28px]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-border/80 bg-card hover:bg-muted/20 text-foreground rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Fullscreen Photo Gallery Lightbox */}
      <OrderPhotoGalleryModal
        order={order}
        isOpen={galleryOpen}
        initialType={galleryType}
        initialIndex={galleryIndex}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
