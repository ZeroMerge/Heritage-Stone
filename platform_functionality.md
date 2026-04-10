# Heritage Stone Platform: Technical Functionality Audit

This document provides a comprehensive run-down of all interactive elements and functional capabilities across the three core platforms: **Studio**, **Hub**, and **Portal**.

## 1. Studio (Management Platform)
The Studio is the central command for brand managers and designers.

### A. Global Layout & Navigation
*   **Sidebar Navigation**:
    *   `Dashboard`: Studio analytics and overview.
    *   `Projects`: List management for all client accounts.
    *   `Settings`: System-wide profile and notification preferences.
    *   `Logout`: Active session termination.
*   **Topbar Controls**:
    *   `Sidebar Toggle`: Collapse/Expand for more workspace.
    *   `Search (Global)`: Predictive search across projects and teams.
    *   `Notifications Button`: View system alerts and mentions.
    *   `User Dropdown`:
        *   `Profile`: Quick access to user identity.
        *   `Settings`: Quick link to preferences.
        *   `Logout`: Duplicate logout trigger.
    *   `Unsaved Changes Indicator`: Real-time feedback if an editor has pending saves.

### B. Studio Dashboard (Bento Grid)
*   **Quick Action Cards**:
    *   `StatCards`: Clickable snapshots of Active Projects, Pending Approvals, Open Requests, and Unread Messages.
    *   `Needs Attention (RequestsCard)`: High-priority list of Approvals, Messages, and Deadlines with direct "Jump to Project" links.
    *   `Launch Countdown`: Visual timer for the nearest `goLiveDate`.
    *   `Recent Activity`: Scrollable timeline of global actions.
    *   `Project Shortcuts`: Direct links to the most recently edited accounts.

### C. Projects Management
*   **Functional Triggers**:
    *   `New Project Button`: Opens the multi-step `NewProjectModal` (Account details, Brand selection).
    *   `Search / Filter`: Dynamic refinement by status (Active, Archived, Live) or industry.
    *   `View Switcher`: Toggle between high-density List view and visual Card view.
    *   **Project Card Actions**:
        *   `Primary Click`: Enter project workspace.
        *   `Three-Dot Menu`: Archive, Duplicate, or Delete account (triggered via `ConfirmModal`).

### D. Project Workspace (Context-Specific)
Every project has a persistent secondary navigation and action bar.
*   **Header Actions**:
    *   `Preview Portal`: Opens the live/staged Portal URL in a new tab.
    *   `Share Button`: Generates/Copies the public link (with password toggle).
    *   `Invite`: Triggers the `InviteMemberModal`.
*   **Workspace Tabs**:
    *   **Overview**:
        *   `Health Score Ring`: Visual KPIs of brand completeness.
        *   `Status Badge`: Direct toggle for "In Progress", "Review", "Live".
    *   **Brand Document (The Editor)**:
        *   `Accordion Sections`: Expandable blocks for Brand Identity, Philosophy, Strategy, etc.
        *   `Field Inputs`: Text fields, textareas, and color pickers.
        *   `Asset Dropzones`: Upload targets for specific brand sections.
        *   `Save / Discard`: Floating action bar to commit changes.
    *   **Assets Library**:
        *   `Upload Trigger`: Modal for batch file uploads (Cloudinary integration).
        *   `Category Filters`: Icons for Logo, Imagery, Typography, Guidelines.
        *   `Asset Actions`: Preview (Eye icon), Download, and Delete.
    *   **Team Management**:
        *   `Studio/Client Toggle`: Switch between internal and external stakeholders.
        *   `Invite Link`: Quick-copy invitation.
        *   `Remove Member`: Deletion trigger with logic-safety checks.
    *   **Campaigns (Inheritance Engine)**:
        *   `Add Campaign`: Creates a sub-brand using inheritance logic.
        *   `Inheritance Toggles`: Choice-based sync (Inherit value vs. Override).
        *   `Edit / Delete`: Manage specific campaign variables.
    *   **Chat**:
        *   `Internal Toggle`: Switch between client-facing and internal threads.
        *   `Message Input`: Rich text collaboration.
    *   **Launch Checklist**:
        *   `Task Checklist`: Interactive "Done" toggles for required steps (Logo, Colors, etc.).
        *   `Launch Button`: Final production trigger (checks requirements baseline).

---

## 2. Hub (System Orchestration)
The Hub is the engineering and administration layer.

### A. Template Management
*   **Template Gallery**: Management interface for UI templates.
*   **Upload Engine**: Dist-folder ingestion for new brand portal designs.
*   **Value Mapping**: The "Rosetta Stone" UI for mapping Studio DB fields to Template JSON properties.
*   **Template Toggles**: Immediate switching of a brand's visual identity.

### B. Admin Tools
*   **Brand Inventory**: High-level CRUD for all system-wide brand slugs.
*   **Cache Admin**: "Nuke" commands to invalidate global or specific brand caches.
*   **Section Locks**: Real-time management to kick users out of sections or resolve edit-deadlocks.
*   **Live Preview Interface**: Tooling for designers to test data injection without a full deploy.

---

## 3. Portal (The Client Experience)
The Portal is the end-user brand experience.

### A. Access & Security
*   **Auth Gate (Password Modal)**: Password-protected session management for private brands.
*   **Preview Mode**: Floating overlay for Studio users view-staged versions.

### B. Brand Rendering
*   **Navigation**: Dynamic menu generated from the 8 core brand sections.
*   **Asset Access**: Direct "Copy Code" for hex values and "Download Original" for file assets.
*   **Responsive Engine**: Cross-device optimization of the brand document layout.
*   **Changelog**: Public-facing history of brand evolutions.
