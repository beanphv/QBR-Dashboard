🔹 Front-End Requirements

Dashboard

Display client review metrics over time (quarter-over-quarter).

Charts & tables to visualize trends (e.g. Profit, Savings, CE Revenue, Averages).

Dropdown selector to switch between all hospital, and single hospital view.

Ability to filter by quarter, year, and metric type.

Hospital View

Dedicated view for a single Hospital with historical performance.

Quick navigation between Hospital via dropdown.

Export client report (PDF, Excel).

Pharmacy View 

Dedicated view for all pharmacies under selected Hospital (If in All Hospital View, All Pharmacies)

If Hospital has multiple pharmacies: Quick navigation between Pharmacies via dropdown.

Export client report (PDF, Excel).

User Experience

Responsive layout for desktop.

Clear, simple UI for internal users (no unnecessary complexity).

Notifications for data updates or errors.

Authentication

Internal login (SSO or company credentials).

Role-based access: Admins (manage clients/data), Analysts (view/report).

🔹 Back-End Requirements

Data Management

Store business review metrics (quarterly snapshots).

CRUD operations: add, update, delete client metrics.

Historical tracking so previous quarters remain unchanged.

Hospital/Pharmacy Filtering

API endpoints to fetch data:

All Hospital overview.

Single Hospital details.

Support filters for quarter, year, and metric type.

Authentication & Security

Internal authentication system (SSO or LDAP preferred).

Role-based permissions.

Secure storage for sensitive client data.

Performance & Reliability

Caching frequently viewed reports.

Automated scheduled jobs for quarterly data imports/updates.

Audit log of changes to client records.

Integration

CSV/Excel import for quarterly updates.

Admin ability to manually add/append data in dashboard (Similar to adding/pasting new rows of data into an excel table)

Export reports in PDF/Excel.

⚡ Simplified Goal:

Internally track quarter-over-quarter client metrics.

Provide a dashboard + single client view with filtering.

Enable easy import/export of quarterly data.
