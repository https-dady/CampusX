# CampusX — Phase 1 Workspace Foundation

This package is a drop-in Phase 1 implementation based on the locked CampusX workspace UI references.

## Files

- `components/layout/WorkspaceLayout.jsx`
- `components/layout/WorkspaceSidebar.jsx`
- `components/layout/WorkspaceTopbar.jsx`
- `pages/dashboard/Overview.jsx`
- `constants/workspace.js`

## Integration

In `AppRoutes.jsx`, import:

```jsx
import WorkspaceLayout from "../components/layout/WorkspaceLayout.jsx";
import Overview from "../pages/dashboard/Overview.jsx";
```

Then add:

```jsx
<Route
  path="/dashboard"
  element={
    <WorkspaceLayout>
      <Overview />
    </WorkspaceLayout>
  }
/>
```

For future workspace pages, keep the same shell:

```jsx
<Route
  path="/profile"
  element={
    <WorkspaceLayout>
      <Profile />
    </WorkspaceLayout>
  }
/>
```

Do not duplicate Sidebar/Topbar inside individual pages.

## Locked behavior

- Sidebar and topbar remain present while page content changes.
- Mobile navigation opens as a drawer without destroying page structure.
- Page transitions are subtle and respect `prefers-reduced-motion`.
- No backend/API work is included.
- Existing landing/header/footer/ScrollReveal are not modified by this package.

## Important

The `Student` label and `L` avatar are intentionally presentation placeholders until the existing auth/user context is connected. Replace those values from the project's real auth state rather than adding another user store.
