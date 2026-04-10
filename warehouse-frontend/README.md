# WarehouseOS — Frontend

React 18 + Vite + Tailwind CSS v4 + Shadcn/ui

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.x | UI Framework |
| React Router | 6.x | Client-side routing |
| TanStack Query | 5.x | Data fetching, caching, auto-refresh |
| Axios | 1.x | HTTP client + interceptors |
| Zustand | 5.x | Global state (auth, UI) |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |
| Recharts | 2.x | Charts & graphs |
| html5-qrcode | 2.x | QR/Barcode scanner |
| Sonner | 1.x | Toast notifications |
| Tailwind CSS | 4.x | Styling |
| Shadcn/ui | latest | UI components |
| Lucide React | latest | Icons |
| date-fns | 4.x | Date formatting (Thai) |

## Setup

```bash
# 1. Clone & install
npm install

# 2. Config environment
cp .env.example .env
# แก้ไข VITE_API_BASE_URL ให้ตรงกับ backend

# 3. Run dev
npm run dev
# → http://localhost:5173

# 4. Build
npm run build
```

## โครงสร้าง

```
src/
├── api/
│   ├── axiosInstance.js     # Axios + JWT interceptors + error handling
│   └── endpoints.js         # ทุก path ตาม OpenAPI spec (85 endpoints)
├── app/
│   ├── providers.jsx        # QueryClient + Toaster
│   └── router.jsx           # React Router v6 routes
├── components/
│   ├── ui/                  # Base components (Button, Input, Card, Badge)
│   ├── layouts/             # AppLayout, Sidebar, Navbar
│   └── common/              # StatCard, DataTable, PageHeader
├── features/
│   ├── auth/                # LoginPage, ProtectedRoute
│   ├── dashboard/           # DashboardPage (KPI cards)
│   ├── inventory/           # MaterialsPage
│   ├── procurement/         # PO, GR, Issues (Phase 2)
│   ├── tools/               # Tool management (Phase 2)
│   ├── warehouse/           # Warehouses & Locations (Phase 2)
│   └── ...
├── hooks/
│   ├── useAuth.js           # Login, logout, role checking
│   ├── useDebounce.js       # Input debounce
│   ├── usePdfDownload.js    # PDF download helper
│   └── useTableParams.js    # Pagination + search state
├── services/
│   ├── queryKeys.js         # TanStack Query key factory
│   ├── materialsService.js  # Materials hooks (pattern ไว้ใช้เป็นแบบ)
│   └── index.js
├── store/
│   ├── authStore.js         # Zustand auth (token, user, roles)
│   └── uiStore.js           # Sidebar, modals, scanner
└── utils/
    ├── cn.js                # Tailwind class merger
    └── formatters.js        # Date, currency, status formatters
```

## Pattern ที่ใช้ซ้ำ

### Service Hook Pattern
```js
// ดู src/services/materialsService.js เป็นตัวอย่าง
export function useMaterials(params) {
  return useQuery({
    queryKey: queryKeys.materials.list(params),
    queryFn:  () => axiosInstance.get(endpoints.materials.list, { params }),
    select:   (d) => d.data,
    staleTime: 30_000,
  });
}
```

### Form Pattern
```jsx
const form = useForm({ resolver: zodResolver(schema) });
// ดู LoginPage.jsx
```

### Role Guard
```jsx
const { isAdmin, isManager } = useAuth();
{isAdmin && <Button>Admin only</Button>}
```

## Default Login
```
Email:    somchai@example.com
Password: password123
```
