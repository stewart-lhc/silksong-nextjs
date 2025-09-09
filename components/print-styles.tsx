'use client';

import { useEffect } from 'react';

export function PrintStyles() {
  useEffect(() => {
    // Add print-specific CSS classes to items for better print layout
    const addPrintClasses = () => {
      const items = document.querySelectorAll('[data-item-card]');
      items.forEach((item, index) => {
        item.classList.add('print-item');
        if (index % 2 === 0) {
          item.classList.add('print-left');
        } else {
          item.classList.add('print-right');
        }
      });
    };

    // Apply print classes when items are loaded
    const observer = new MutationObserver(addPrintClasses);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    return () => observer.disconnect();
  }, []);

  return (
    <style jsx global>{`
      @media print {
        /* Reset and base styles */
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        html, body {
          background: white !important;
          color: black !important;
          font-size: 11px !important;
          line-height: 1.4 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Hide UI elements */
        header,
        .xl\\:block:not(.print-show),
        .print\\:hidden,
        button:not(.print-show),
        .scroll-area-scrollbar,
        [data-radix-scroll-area-scrollbar] {
          display: none !important;
        }

        /* Container adjustments */
        .container {
          max-width: none !important;
          width: 100% !important;
          padding: 0.5rem !important;
          margin: 0 !important;
        }

        /* Page layout */
        .print-page {
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }

        /* Two-column layout for items */
        .print-columns {
          columns: 2;
          column-gap: 1rem;
          column-fill: balance;
          column-rule: 1px solid #ddd;
        }

        /* Item cards for print */
        .print-item {
          break-inside: avoid;
          page-break-inside: avoid;
          margin-bottom: 0.5rem;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
          font-size: 10px;
          line-height: 1.3;
        }

        /* Typography adjustments */
        h1 {
          font-size: 18px !important;
          margin: 0 0 0.5rem 0 !important;
          color: black !important;
          text-align: center;
          border-bottom: 2px solid black;
          padding-bottom: 0.25rem;
        }

        h2 {
          font-size: 14px !important;
          margin: 0.5rem 0 0.25rem 0 !important;
          color: black !important;
          font-weight: bold;
        }

        h3 {
          font-size: 12px !important;
          margin: 0.25rem 0 !important;
          color: black !important;
          font-weight: bold;
        }

        /* Progress indicators */
        .print-progress {
          font-size: 10px;
          color: #666;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        /* Checkbox styling */
        input[type="checkbox"] {
          width: 14px !important;
          height: 14px !important;
          margin: 0 0.5rem 0 0 !important;
          transform: none !important;
          -webkit-appearance: checkbox !important;
          appearance: checkbox !important;
        }

        /* Labels and text */
        label {
          font-size: 11px !important;
          line-height: 1.3 !important;
          color: black !important;
          cursor: default !important;
        }

        /* Badges and status indicators */
        .badge,
        [class*="badge"] {
          background: white !important;
          color: black !important;
          border: 1px solid black !important;
          font-size: 9px !important;
          padding: 1px 4px !important;
          border-radius: 2px !important;
        }

        /* Category sections */
        .print-category {
          break-after: avoid;
          margin-bottom: 1rem;
        }

        .print-category-header {
          background: #f0f0f0 !important;
          border: 1px solid black !important;
          padding: 0.5rem !important;
          margin-bottom: 0.5rem !important;
          font-weight: bold !important;
          text-align: center !important;
        }

        /* Item details */
        .print-item-details {
          font-size: 9px !important;
          color: #555 !important;
          margin-top: 0.25rem !important;
        }

        .print-item-location {
          font-style: italic;
          color: #666;
        }

        .print-item-type {
          font-weight: normal;
          color: #444;
        }

        /* Progress summary */
        .print-summary {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: white;
          border-bottom: 2px solid black;
          padding: 0.5rem;
          font-size: 10px;
          text-align: center;
          z-index: 1000;
        }

        /* Footer */
        .print-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 8px;
          color: #666;
          border-top: 1px solid #ccc;
          padding: 0.25rem;
          background: white;
        }

        /* Page breaks */
        .page-break-before {
          page-break-before: always;
        }

        .page-break-after {
          page-break-after: always;
        }

        .page-break-avoid {
          page-break-inside: avoid;
        }

        /* Utility classes */
        .print-only {
          display: block !important;
        }

        .print-inline {
          display: inline !important;
        }

        .print-flex {
          display: flex !important;
        }

        .print-grid {
          display: grid !important;
        }

        .print-text-center {
          text-align: center !important;
        }

        .print-text-left {
          text-align: left !important;
        }

        .print-font-bold {
          font-weight: bold !important;
        }

        .print-border {
          border: 1px solid black !important;
        }

        .print-bg-white {
          background: white !important;
        }

        .print-text-black {
          color: black !important;
        }

        /* Specific component overrides */
        .card {
          box-shadow: none !important;
          border: 1px solid #ddd !important;
          background: white !important;
        }

        .progress {
          display: none !important;
        }

        [data-radix-scroll-area-viewport] {
          overflow: visible !important;
        }

        /* Multi-page handling */
        @page {
          margin: 0.5in;
          size: letter;
        }

        @page :first {
          margin-top: 1in;
        }
      }

      /* Print preview mode */
      @media screen and (max-width: 1024px) {
        .print-preview .container {
          max-width: none !important;
          padding: 1rem !important;
        }

        .print-preview .print-columns {
          columns: 1;
        }
      }
    `}</style>
  );
}