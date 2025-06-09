# Image Upload Instructions

## Files Ready for Supabase Upload

Your images have been downloaded and organized with SEO-friendly naming. Here's what to do next:

### 1. Supabase Bucket Setup
- Bucket name: `images`
- Make sure the bucket is public for web access

### 2. Upload Structure
Upload the organized images maintaining this folder structure:


#### services/
- services-slider-04-2025.jpg
- services-slider-03-2025.jpg
- services-slider-02-2025.jpg
- services-slider-01-2025.jpg
- services-main-baner-2025.jpg
- services-hand-assembly-2025.jpg
- services-truck-2025.jpg
- services-logistic-2025.jpg
- services-logo-2025.png
- services-analytics-dashboard-2025.jpg
- services-warehouse-2025.jpg
- services-og-image-2025.jpg
- services-warehouse-facility-2025.jpg
- services-analytics-performance-2025.jpg
- services-report-generator-2025.jpg

#### hero/
- hero-banner-22-2025.jpg
- hero-fullfi-banner-2025.jpg
- hero-inventory-banner-2025.jpg
- hero-health-banner-2025.jpg
- hero-about-hero-2025.jpg
- hero-contact-hero-2025.jpg

#### logos/
- logos-amazon-logo-2025.svg
- logos-walmart-logo-2025.svg
- logos-target-logo-2025.svg
- logos-shopify-logo-2018-2025.svg
- logos-logo-nike-2025.svg
- logos-adidas-logo-2025.svg


### 3. Manual Upload via Supabase Dashboard
1. Go to your Supabase dashboard > Storage > images bucket
2. Create folders for each category: services, hero, logos
3. Upload files from the `organized-images` folder to their respective categories

### 4. Batch Upload Commands (if using Supabase CLI)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to your project
supabase login

# Upload all categories
supabase storage cp organized-images/services/* supabase://images/services/
supabase storage cp organized-images/hero/* supabase://images/hero/
supabase storage cp organized-images/logos/* supabase://images/logos/
```

### 5. Verify Uploads

After uploading, verify the images are accessible at:
`https://your-project.supabase.co/storage/v1/object/public/images/category/filename`

### 6. Update Image Registry

Update the `IMAGE_REGISTRY` in `client/src/lib/images.ts` to reference your uploaded images.

## Download Summary

- Total images processed: 28
- Successfully downloaded: 27
- Failed downloads: 1

Generated on: 2025-05-30T20:28:21.085Z
