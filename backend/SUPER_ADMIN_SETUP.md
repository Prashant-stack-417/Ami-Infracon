# Super Admin Setup Guide

This guide explains how to set up and manage the Super Admin account for the Ami Infracon admin system.

## Overview

The system supports **only ONE Super Admin** account with the following characteristics:

- **Name**: Must be exactly "Super Admin"
- **Email**: superadmin.Admin@gmail.com
- **Role**: superadmin
- **Permissions**: Full system access including creating/managing other admins

## Initial Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment

Make sure your `.env` file has the MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/ami-infracon
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### Step 3: Create Super Admin Account

Run the following command to create the Super Admin account:

```bash
npm run create-superadmin
```

This will create a Super Admin account with:

- **Name**: Super Admin
- **Email**: superadmin.Admin@gmail.com
- **Password**: Prsahant@4170 (default - **CHANGE THIS IMMEDIATELY**)

**⚠️ IMPORTANT SECURITY NOTES:**

1. Change the default password immediately after first login
2. Store the credentials securely
3. Never share the super admin credentials
4. The script will prevent creating duplicate super admins

## Super Admin Login

### Login Requirements

To log in as Super Admin, you must:

1. Use the email: `superadmin.Admin@gmail.com`
2. Have the exact name "Super Admin" in the database
3. Provide the correct password

The system verifies:

- Email format matches `username.Admin@gmail.com`
- Admin name is exactly "Super Admin"
- Password is correct
- Account is active

### Login Process

1. Navigate to `/admin/login`
2. Enter email: `superadmin.Admin@gmail.com`
3. Enter password
4. You will be redirected to `/superadmin/dashboard`

## Super Admin Capabilities

### 1. Admin Management

- Create new admin accounts
- View all admin accounts
- Edit admin details
- Activate/deactivate admin accounts
- Delete admin accounts (except own account)
- Assign roles (Admin or Super Admin)

### 2. System Access

- Full access to all admin features
- Access to super admin dashboard
- Ability to create other admins
- View system statistics

## Creating Additional Admins

As Super Admin, you can create new admin accounts:

1. Log in to Super Admin Dashboard
2. Click "Create New Admin" button
3. Fill in the form:
   - **Name**: Admin's full name
   - **Email**: Must follow format `username.Admin@gmail.com`
   - **Role**: Choose "Admin" or "Super Admin"
   - **Password**: Set a secure password
4. Click "Create Admin"

**Note**: The system prevents creating more than one Super Admin account.

## Admin Email Format

All admin emails must follow this format:

```
username.Admin@gmail.com
```

Examples:

- `john.Admin@gmail.com`
- `jane.doe.Admin@gmail.com`
- `superadmin.Admin@gmail.com`

## Security Features

### 1. Single Super Admin

- Only one Super Admin account can exist
- Attempts to create additional Super Admins are blocked
- Super Admin name must be exactly "Super Admin"

### 2. Name Verification

- Super Admin login requires exact name match
- Prevents unauthorized access even with correct credentials

### 3. Protected Routes

- Super Admin routes are protected with authentication
- Regular admins cannot access Super Admin features
- Automatic redirection based on role

### 4. Email Validation

- All admin emails must match the required format
- Validation on both frontend and backend

## Troubleshooting

### Cannot Create Super Admin

**Error**: "Super Admin already exists"

- **Solution**: A Super Admin account already exists. Use the existing credentials or delete the existing Super Admin from the database first.

### Login Failed

**Error**: "Invalid super admin credentials"

- **Cause**: The admin name in the database is not exactly "Super Admin"
- **Solution**: Verify the name in the database matches exactly "Super Admin"

### Cannot Access Super Admin Dashboard

**Error**: Redirected to regular admin dashboard

- **Cause**: Account is not marked as Super Admin
- **Solution**: Verify the account has `role: "superadmin"` and `isSuperAdmin: true`

## Database Schema

Super Admin document structure:

```javascript
{
  name: "Super Admin",           // Must be exact
  email: "superadmin.Admin@gmail.com",
  password: "hashed_password",
  role: "superadmin",
  isSuperAdmin: true,
  isActive: true,
  permissions: [],
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Super Admin Protected Endpoints

All these endpoints require Super Admin authentication:

- `POST /api/admin/register` - Create new admin
- `GET /api/admin` - Get all admins
- `PUT /api/admin/:id` - Update admin
- `DELETE /api/admin/:id` - Delete admin

### Authentication Endpoints

- `POST /api/admin/login` - Admin/Super Admin login
- `POST /api/admin/logout` - Logout
- `GET /api/admin/me` - Get current admin profile

## Best Practices

1. **Change Default Password**: Immediately change the default password after first login
2. **Secure Storage**: Store Super Admin credentials in a secure password manager
3. **Limited Access**: Only share Super Admin credentials with authorized personnel
4. **Regular Audits**: Regularly review admin accounts and their permissions
5. **Activity Monitoring**: Monitor Super Admin activities for security
6. **Backup**: Keep secure backups of admin credentials

## Support

For issues or questions regarding Super Admin setup, please contact the development team.
