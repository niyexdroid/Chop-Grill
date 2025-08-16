# Chops & Grills Enterprise - Restaurant Management System

## Overview

This is a modular restaurant management system that has been split into separate pages for better organization and maintainability.

## Project Structure

```
Chop & Grill/
├── index.html              # Homepage with dashboard and quick stats
├── orders.html             # Order taking and management page
├── reports.html            # Analytics and reporting page
├── Chop&Grill.html        # Original single-page file (backup)
├── LICENSE
└── shared/                 # Shared assets and utilities
    ├── css/
    │   └── styles.css      # Common styles for all pages
    └── js/
        ├── utils.js        # Shared utility functions
        ├── orders.js       # Orders page functionality
        └── reports.js      # Reports page functionality
```

## Features by Page

### Homepage (index.html)

- Welcome dashboard
- Quick statistics overview
- Recent orders display
- Quick export functionality
- Navigation to other pages

### Orders Page (orders.html)

- Complete food menu with categories
- Order taking interface
- Current order management
- Daily orders display
- All orders table with search/filter
- Export to Excel and PDF

### Reports Page (reports.html)

- Comprehensive analytics dashboard
- **NEW: Advanced Filtering System**
  - Date range filtering (from/to dates)
  - Attendee-specific filtering
  - Real-time filter status display
  - Clear and apply filter controls
- Sales statistics by attendee and date
- Popular items analysis
- Payment method breakdown
- Time-based analysis (peak hours/days)
- Multiple export options (detailed and summary)

## Shared Components

### CSS (shared/css/styles.css)

- Consistent styling across all pages
- Color scheme and branding
- Responsive design
- Custom components styling

### JavaScript Utilities (shared/js/utils.js)

- Toast notification system
- Local storage management
- PDF generation functions
- Modal utilities
- Common helper functions

### Page-Specific JavaScript

- **orders.js**: Order management, menu interaction, export functions
- **reports.js**: Analytics calculations, chart data, advanced reporting

## Benefits of the Split

1. **Better Organization**: Each page focuses on specific functionality
2. **Easier Maintenance**: Changes to one feature don't affect others
3. **Improved Performance**: Smaller page loads, faster rendering
4. **Better Development**: Multiple developers can work on different pages
5. **Code Reusability**: Shared components reduce duplication
6. **Scalability**: Easy to add new pages or features

## Navigation

- Clean navigation bar on all pages
- Consistent branding and styling
- Active page highlighting
- Mobile-responsive menu

## Data Management

- All data stored in localStorage
- Consistent data structure across pages
- Shared utility functions for data operations
- Export capabilities on all relevant pages

## Getting Started

1. Open `index.html` to start with the homepage
2. Use the navigation menu to access different sections
3. Order management: Go to Orders page
4. Analytics and reports: Go to Reports page

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Uses Bootstrap 5 for consistent UI

## Technologies Used

- HTML5
- CSS3 with CSS Custom Properties
- Vanilla JavaScript (ES6+)
- Bootstrap 5 for UI components
- Font Awesome/Bootstrap Icons
- XLSX.js for Excel export
- html2pdf.js for PDF generation

## Future Enhancements

- Add user authentication
- Implement database storage
- Add inventory management
- Create customer management system
- Add more detailed analytics and charts
