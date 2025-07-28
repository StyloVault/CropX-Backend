# API Enumerations

This document lists the important enum values used across the CropX backend. They are useful when calling the API or exploring the Postman collection.

## User Module
- `UserRole`: `Admin`, `User`, `Company`
- `UserStatus`: `Suspended`, `Active`, `Inactive`
- `AdminRole`: `SuperAdmin`, `Accountant`, `ITSupport`, `CustomerSupport`, `Viewer`, `Blogger`

## Inventory Module
- `InventoryStatus`: `ACTIVE`, `INACTIVE`, `OUTOFSTOCK`

## Invoice Module
- `InvoiceStatus`: `Pending`, `Overdue`, `Settled`

## Card & Wallet Module
- `CardDeliveryStatus`: `Pending`, `Dispatched`, `Delivered`, `Linked`
- `BankName`: `Safe Have MFB`, `Guaranty Trust Bank`, `Provudis Bank`
- `StatusEnum`: `active`, `inactive`

## Transaction Module
- `TransactionType`: `INCOME`, `EXPENSE`
- `TransactionSubType`: `SALES`, `STOCK`, `USAGE`, `DESTROYED`
- `TransactionStatus`: `SETTLED`, `INACTIVE`, `OUTOFSTOCK`

These enums provide context for certain request or response fields. Refer to the service source code for full definitions.
