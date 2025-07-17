export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  COMPANY = 'Company',
}

export enum UserStatus {
  SUSPENDED = 'Suspended',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum AdminRole {
  SUPERADMIN = 'SuperAdmin',
  ACCOUNTANT = 'Accountant',
  ITSUPPORT = 'ITSupport',
  CUSTOMERSUPPORT = 'CustomerSupport',
  VIEWER = 'Viewer',
  BLOGGER = 'Blogger',
}

export enum OTPReason {
  PHONENUMBERVERIFICATION = 'PhoneVerification',
  PASSWORDRESET = 'PasswordReset',
}

export enum MemberStatus {
  SUSPENDED = 'Suspended',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}