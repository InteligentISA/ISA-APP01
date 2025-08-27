# Vendor Application Form Fixes

## Issues Fixed

### 1. Storage Bucket Error
**Problem**: The vendor application form was trying to upload files to non-existent buckets (`id-cards` and `business-licenses`), causing "Bucket not found" errors.

**Solution**: 
- Updated the `uploadFile` function in `VendorApplicationForm.tsx` to use the `product-images` bucket
- Files are now uploaded to `vendor-documents/{userId}/{filename}` path structure
- Added proper error handling for storage uploads

### 2. Missing "Request a Call" Support Feature
**Problem**: The vendor application form was missing a support request feature that allows users to request assistance during onboarding.

**Solution**:
- Added a 5th step to the application form for support requests
- Added `supportRequest` field to the form data structure with phone and message fields
- Implemented support request submission to the `support_requests` table
- Made the support request step optional (users can skip it)

## Database Setup Required

### 1. Create Support Requests Table
Run the migration file: `supabase/migrations/20250814000000-create-support-requests-table.sql`

This creates:
- `support_requests` table with proper RLS policies
- Indexes for better performance
- Triggers for automatic timestamp updates

### 2. Create Storage Bucket
Run the SQL file: `create-storage-bucket.sql` in your Supabase SQL editor

This creates:
- `product-images` storage bucket
- Storage policies for secure file uploads
- Public read access for uploaded files

## Manual Setup Steps

### Step 1: Create Storage Bucket
1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure with these settings:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Checked
   - **File size limit**: 50MB (or adjust as needed)
   - **Allowed MIME types**: `image/*, application/pdf`

### Step 2: Run Database Migrations
1. Run the support requests table migration
2. Run the storage policies migration

### Step 3: Test the Application
1. Try submitting a vendor application with file uploads
2. Test the support request feature in step 5
3. Verify that files are uploaded to the correct bucket

## File Structure
```
product-images/
├── vendor-documents/
│   └── {user-id}/
│       ├── id-card.{ext}
│       └── business-license.{ext}
└── products/
    └── {product-id}/
        └── {image-files}
```

## Features Added

### Support Request Step
- **Phone Number**: Optional field for contact
- **Message**: Optional field for describing the issue
- **Optional Step**: Users can skip this step entirely
- **Automatic Submission**: Support requests are saved to the database when the application is submitted

### Improved Error Handling
- Better error messages for storage upload failures
- Graceful fallback when storage is not configured
- Support request failures don't block application submission

### Enhanced User Experience
- Clear progress indication with 5 steps
- Informative messages about optional steps
- Better file upload interface with drag-and-drop styling

## Testing Checklist

- [ ] Vendor application form loads without errors
- [ ] File uploads work correctly (ID card, business license)
- [ ] Support request step is accessible and functional
- [ ] Application submission completes successfully
- [ ] Files are stored in the correct bucket location
- [ ] Support requests are saved to the database
- [ ] Error handling works for missing storage bucket
- [ ] Progress calculation includes all 5 steps

## Troubleshooting

### Storage Bucket Issues
If you get "Bucket not found" errors:
1. Verify the `product-images` bucket exists in Supabase Storage
2. Check that storage policies are applied correctly
3. Ensure the bucket is public and allows the required file types

### Support Request Issues
If support requests aren't being saved:
1. Verify the `support_requests` table exists
2. Check that RLS policies are configured correctly
3. Ensure the user is authenticated when submitting

### File Upload Issues
If file uploads fail:
1. Check file size limits (should be under 50MB)
2. Verify file types are allowed (images and PDFs)
3. Ensure the user is authenticated
4. Check browser console for specific error messages
