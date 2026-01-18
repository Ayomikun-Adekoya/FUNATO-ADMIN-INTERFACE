# Recruitment Admin Frontend

A production-ready TypeScript Next.js admin dashboard for managing users, roles, and recruitment applications.

## Features

- 🔐 **Authentication**: Secure admin login with JWT token-based authentication
- 👥 **User Management**: Complete CRUD operations for user accounts with role assignment
- 🔐 **Role Management**: Manage roles and permissions with granular access control
- 📄 **Application Management**: View, filter, and manage recruitment applications
- 📁 **Document Viewer**: In-browser PDF preview with download functionality
- 🎨 **Modern UI**: Built with Tailwind CSS for a clean, responsive design
- ⚡ **Type-Safe**: Full TypeScript coverage with strict mode
- 🔄 **Real-time Updates**: React Query for efficient data fetching and caching
- ✅ **Form Validation**: Zod schemas with React Hook Form integration
- ♿ **Accessible**: WCAG compliant components with keyboard navigation

## Tech Stack

- **Framework**: Next.js 14+ (Pages Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **PDF Viewer**: react-pdf + PDF.js
- **Date Utilities**: date-fns

## Prerequisites

- Node.js 18.x or higher
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.funato.edu.ng/api
NEXTAUTH_URL=http://localhost:3000
CSRF_API_KEY=your-csrf-token-here
DEV_BEARER_TOKEN=your-dev-token-here
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/          # Reusable React components
├── lib/                # Core utilities and API
├── pages/             # Next.js pages
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── styles/            # Global styles
```

## API Endpoints

### Authentication
- `POST /auth/login` - Admin login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Users (Admin Only)
- `GET /admin/users` - List users
- `POST /admin/users` - Create user
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

### Roles (Admin Only)
- `GET /admin/roles` - List roles
- `POST /admin/roles` - Create role
- `PUT /admin/roles/:id` - Update role
- `DELETE /admin/roles/:id` - Delete role

### Applications (Admin Only)
- `GET /recruitment/applications` - List applications
- `GET /recruitment/applications/:id` - Get application details
- `PUT /recruitment/applications/:id` - Update application
- `DELETE /recruitment/applications/:id` - Delete application

## Security Notes

⚠️ **Current implementation uses localStorage for token storage (development only)**

For production:
- Implement HttpOnly cookies
- Add CSRF protection
- Enable secure cookie flags
- Consider using NextAuth.js

## Building for Production

```bash
npm run build
npm start
```

## License

[Your License Here]
