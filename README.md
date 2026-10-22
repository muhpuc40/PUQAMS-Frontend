# React Pro Template

React 19 + Vite + Tailwind 4 + TypeScript starter with a sidebar layout, dark mode,
a UI component kit and a pre-wired Axios service layer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # type-check + production build
```

Set your API address in `.env` (see **API / services** below).

## Folder structure

```
src/
├── router/
│   ├── routes.ts          ← ✏️ the ONLY file you edit to add a page
│   ├── index.tsx            builds the react-router-dom router from routes.ts
│   └── accents.ts           icon colours (indigo / emerald / amber / sky)
├── pages/                 one file per page (DashboardPage, AllComponentsPage)
├── components/
│   ├── layout/              AppLayout, Sidebar, Navbar, Footer, CommandSearch
│   └── ui/                  reusable components (import from '@/components/ui')
├── Axios/
│   └── axiosConfig.ts     axios client: Bearer token + automatic refresh-token retry
├── Utils/
│   └── tokenStorage.ts    getTokens / saveTokens / clearTokens (localStorage)
├── services/              one file per API area (pages never call axios directly)
│   └── projectService.ts  example: getProjects / createProject
├── contexts/              ThemeContext, ToastContext
├── hooks/                 useTitle
└── lib/                   small helpers (jquery global for Summernote)
```

`@` is an alias for `src`, so use `@/components/ui`, `@/Axios/axiosConfig`, `@/services/...`.

## Add a new page (2 steps)

**1. Create the page** – `src/pages/ReportsPage.tsx` (must `export default`):

```tsx
import { CardBox, CustomButton } from '@/components/ui';
import { getReports } from '@/services/reportService';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Reports</h1>
      <CardBox title="Monthly reports">
        <CustomButton variant="primary" size="sm">Export</CustomButton>
      </CardBox>
    </div>
  );
}
```

**2. Register it** – add one object to `routes` in `src/router/routes.ts`:

```ts
import { FileText } from 'lucide-react';

{
  path: '/reports',
  label: 'Reports',
  title: 'Reports',
  description: 'Monthly reports and exports',
  icon: FileText,
  component: lazy(() => import('@/pages/ReportsPage')),
},
```

That's it. The route, **sidebar menu item**, **Ctrl/⌘+K search**, breadcrumbs, browser-tab title
and the dashboard quick-link card are all generated automatically.
Optional fields: `badge`, `badgeColor`, `accent`, `breadcrumbs`, `hidden`.

## API / services

**.env**

```
VITE_BASE_URL=http://192.168.0.103:3000/api/
```

- Vite only exposes variables that start with `VITE_`, and `BASE_URL` is a reserved Vite name,
  so the variable is called `VITE_BASE_URL`.
- Keep the `http://` and the trailing `/` (the refresh call uses `${VITE_BASE_URL}auth/refresh`).
- Restart `npm run dev` after editing `.env`.

**One service file per API area**, same style as your other project:

```ts
// src/services/departmentService.ts
import apiClient from '@/Axios/axiosConfig';

export const getDepartment = async () => {
  try {
    const response = await apiClient.get('Basic/get_all_departments');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Department');
  }
};
```

Use it in a page and show the error with a toast:

```tsx
const { toast } = useToast();

useEffect(() => {
  getDepartment()
    .then(setDepartments)
    .catch((err: Error) => toast.error(err.message));
}, []);
```

`src/Axios/axiosConfig.ts` adds `Authorization: Bearer <token>` to every request and, on a 401,
calls `auth/refresh` once, saves the new tokens and retries the failed request(s).
`/Auth/login` requests are skipped. Token storage lives in `src/Utils/tokenStorage.ts`.

## Notes

- Routing uses `BrowserRouter` (clean URLs like `/components`). When you deploy to static
  hosting, configure a fallback so every path serves `index.html`.
- `Summernote` (jQuery editor, ~300 KB) is not in the `@/components/ui` barrel on purpose;
  import it directly: `import { Summernote } from '@/components/ui/Summernote'`.
