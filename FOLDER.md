# 📁 Ami Infracon LLP — Documentation Structure

```
Ami-Infracon/
│
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── AGENTS.md
├── GEMINI.md
├── PROMPT.MD
├── FOLDER.md
├── JIRA_BOARD.md
├── PROJECT_MEMORY.md
├── documentgeneration.md
│
├── 00-project/
│   ├── vision.md
│   ├── product-overview.md
│   ├── glossary.md
│   ├── roadmap.md
│   ├── success-metrics.md
│   └── architecture-overview.md
│
├── 01-product/
│   ├── prd.md
│   ├── trd.md
│   ├── user-personas.md
│   ├── user-journeys.md
│   ├── information-architecture.md
│   ├── feature-matrix.md
│   ├── functional-requirements.md
│   ├── requirements-traceability.md
│   ├── non-functional-requirements.md
│   ├── api-requirements.md
│   ├── security-requirements.md
│   └── acceptance-criteria.md
│
├── 02-engineering/
│   ├── coding-standards.md
│   ├── folder-structure.md
│   ├── naming-conventions.md
│   ├── branching-strategy.md
│   ├── commit-guidelines.md
│   ├── api-design.md
│   ├── state-management.md
│   ├── authentication.md
│   ├── authorization.md
│   ├── error-handling.md
│   ├── logging.md
│   ├── monitoring.md
│   ├── testing-strategy.md
│   ├── deployment.md
│   ├── performance.md
│   ├── jira-tickets.md
│   └── jira-task-breakdown.md
│
├── 03-design/
│   │
│   ├── design-system.md
│   ├── design-tokens.md
│   ├── experience-tokens.md
│   ├── colors.md
│   ├── typography.md
│   ├── spacing.md
│   ├── motion.md
│   ├── icons.md
│   ├── accessibility.md
│   ├── layouts.md
│   ├── navigation.md
│   │
│   ├── pages/
│   │   ├── home.md                    # Public landing / storefront
│   │   ├── about.md
│   │   ├── products.md                # Product catalogue / listing
│   │   ├── product-detail.md          # Individual product page
│   │   ├── cart.md
│   │   ├── checkout.md
│   │   ├── order-success.md
│   │   ├── dashboard.md               # User dashboard (orders, profile)
│   │   ├── blog-list.md               # Public blog listing
│   │   ├── blog-detail.md             # Individual blog post
│   │   ├── login.md
│   │   ├── register.md
│   │   ├── forgot-password.md
│   │   ├── admin-login.md
│   │   ├── admin-dashboard.md         # Admin home / overview
│   │   ├── admin-product-management.md
│   │   ├── admin-order-management.md
│   │   ├── admin-user-management.md
│   │   ├── admin-blog-editor.md
│   │   ├── admin-analytics.md         # Revenue, orders, users, top products
│   │   ├── superadmin-dashboard.md
│   │   ├── create-admin.md
│   │   ├── edit-admin.md
│   │   ├── 404.md
│   │   └── error-pages.md
│   │
│   └── components/
│       │
│       ├── index.md
│       │
│       ├── foundation/
│       │   ├── button.md
│       │   ├── button-group.md
│       │   ├── icon-button.md
│       │   ├── badge.md
│       │   ├── chip.md
│       │   ├── avatar.md
│       │   ├── divider.md
│       │   ├── skeleton.md
│       │   ├── spinner.md
│       │   └── progress.md
│       │
│       ├── forms/
│       │   ├── input.md
│       │   ├── textarea.md
│       │   ├── select.md
│       │   ├── checkbox.md
│       │   ├── radio-group.md
│       │   ├── switch.md
│       │   ├── slider.md
│       │   └── file-upload.md         # multer-backed image/CSV upload
│       │
│       ├── navigation/
│       │   ├── navbar.md
│       │   ├── sidebar.md             # Admin sidebar
│       │   ├── breadcrumb.md
│       │   ├── tabs.md
│       │   ├── pagination.md
│       │   └── filter-panel.md        # Product filter/search panel
│       │
│       ├── overlays/
│       │   ├── dialog.md
│       │   ├── drawer.md
│       │   ├── popover.md
│       │   ├── tooltip.md
│       │   └── dropdown.md
│       │
│       ├── feedback/
│       │   ├── alert.md
│       │   ├── toast.md               # react-hot-toast patterns
│       │   ├── empty-state.md
│       │   ├── loading-state.md
│       │   ├── error-state.md
│       │   └── confirmation-dialog.md
│       │
│       ├── data-display/
│       │   ├── card.md
│       │   ├── table.md
│       │   ├── accordion.md
│       │   ├── timeline.md            # Order status timeline
│       │   ├── list.md
│       │   ├── stats.md               # Analytics stat cards
│       │   └── charts.md              # recharts wrappers
│       │
│       ├── product/
│       │   ├── product-card.md
│       │   ├── product-grid.md
│       │   ├── product-image-gallery.md
│       │   ├── related-products.md    # Recommendation engine UI
│       │   └── stock-badge.md         # Low stock / in stock indicator
│       │
│       ├── cart/
│       │   ├── cart-drawer.md
│       │   ├── cart-item.md
│       │   └── cart-summary.md
│       │
│       ├── order/
│       │   ├── order-card.md
│       │   ├── order-timeline.md      # Status history visualization
│       │   └── order-status-badge.md
│       │
│       └── blog/
│           ├── blog-card.md
│           ├── blog-editor.md         # Admin rich-text editor
│           └── blog-meta.md
│
├── 04-backend/
│   ├── database-schema.md             # Mongoose models: User, Admin, Product, Order, Blog
│   ├── data-dictionary.md
│   ├── er-diagram.md
│   ├── api-specification.md           # All /api/* routes
│   ├── authentication-flow.md         # JWT + Google OAuth
│   ├── authorization.md               # Role: user / admin / superadmin
│   ├── image-processing.md            # multer + sharp pipeline
│   ├── email-notifications.md         # nodemailer order confirmation
│   ├── csv-bulk-upload.md             # csv-parser product import
│   ├── analytics-engine.md            # Revenue, orders, top products aggregation
│   ├── inventory-alerts.md            # lowStockThreshold logic
│   ├── recommendation-engine.md       # Related products algorithm
│   └── storage.md                     # Local uploads; S3 migration path
│
├── 05-devops/
│   ├── infrastructure.md
│   ├── docker.md
│   ├── ci-cd.md
│   ├── monitoring.md
│   ├── backups.md
│   ├── secrets-management.md
│   └── environments.md
│
├── 06-testing/
│   ├── testing-strategy.md
│   ├── unit-testing.md
│   ├── integration-testing.md
│   ├── e2e-testing.md
│   ├── accessibility-testing.md
│   ├── performance-testing.md
│   ├── security-testing.md
│   └── qa-checklists.md
│
├── 07-prompts/
│   ├── cursor-rules.md
│   ├── copilot-rules.md
│   ├── ai-agent-rules.md
│   ├── ui-prompts.md
│   ├── backend-prompts.md
│   ├── testing-prompts.md
│   └── documentation-prompts.md
│
└── 08-resources/
    ├── references.md
    ├── decisions-log.md
    ├── release-notes.md
    ├── changelog-template.md
    └── templates/
        ├── component-template.md
        ├── page-template.md
        ├── api-template.md
        └── architecture-template.md
```
