# Admin Vendor Management Enhancements

## Overview
Enhanced the admin vendor management section to provide better application review capabilities with detailed vendor information viewing and rejection reason tracking.

## New Features Added

### 1. Vendor Application Details Modal
- **View Button**: Added a "View" button for each pending vendor application
- **Detailed Information Display**: Shows comprehensive vendor information including:
  - **Personal Information**: Full name, email, phone number, location, date of birth, gender
  - **Business Information**: Business name, company, business type, tax ID, company website
  - **Application Information**: Application date, current status, rejection reason (if applicable)

### 2. Rejection Reason System
- **Rejection Modal**: Dedicated modal for rejecting vendor applications
- **Required Reason**: Admins must provide a reason when rejecting applications
- **Database Storage**: Rejection reasons are stored in the `rejection_reason` field
- **Display**: Rejection reasons are shown in the details modal for rejected applications

### 3. Enhanced User Interface
- **Icons**: Added Lucide React icons for better visual feedback
  - Eye icon for "View" actions
  - CheckCircle icon for "Approve" actions
  - XCircle icon for "Reject" actions
  - AlertCircle icon for pending applications
- **Improved Layout**: Better organized information with separators and sections
- **Loading States**: Added processing states during actions

## Database Changes

### New Migration: `20250726000000-add-rejection-reason-to-profiles.sql`
- Added `rejection_reason` TEXT column to the `profiles` table
- Includes documentation comment for the field

### Manual SQL Script: `add-rejection-reason-manual.sql`
- Alternative way to add the rejection_reason field if Supabase CLI isn't working
- Can be run directly in the Supabase SQL editor

## Updated Components

### AdminVendors.tsx
- Enhanced with new state management for modals
- Added vendor details modal component
- Added rejection modal component
- Updated status update function to handle rejection reasons
- Improved UI with better action buttons and information display

## Usage Instructions

### For Admins:
1. **Viewing Application Details**:
   - Click the "View" button next to any vendor application
   - Review all personal and business information
   - Make informed decision based on complete information

2. **Approving Applications**:
   - Click "Approve" button directly from the table or details modal
   - Application status changes to "approved"

3. **Rejecting Applications**:
   - Click "Reject" button to open rejection modal
   - Enter a required reason for rejection
   - Click "Reject Application" to confirm
   - Application status changes to "rejected" with reason stored

### For Developers:
1. **Database Setup**: Run the migration or manual SQL script to add the rejection_reason field
2. **Component Usage**: The enhanced AdminVendors component is ready to use
3. **Styling**: Uses existing UI components and Tailwind CSS classes

## Technical Details

### State Management
- `selectedVendor`: Currently selected vendor for modal display
- `showDetailsModal`: Controls vendor details modal visibility
- `showRejectModal`: Controls rejection modal visibility
- `rejectionReason`: Stores the rejection reason input
- `processingAction`: Prevents multiple simultaneous actions

### API Integration
- Enhanced `handleStatusUpdate` function to handle rejection reasons
- Automatically clears rejection reason when approving applications
- Refreshes data after status updates

### UI Components Used
- Dialog, DialogContent, DialogHeader, DialogTitle
- Textarea for rejection reason input
- Label for form labels
- Separator for visual organization
- Badge for status display
- Button with various variants and icons

## Benefits
1. **Better Decision Making**: Admins can review complete vendor information before making decisions
2. **Transparency**: Rejection reasons provide clear feedback to vendors
3. **Audit Trail**: All rejection reasons are stored for future reference
4. **Improved UX**: Better organized interface with clear action buttons
5. **Data Integrity**: Proper validation and error handling 