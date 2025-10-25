/**
 * Utility functions for SKU generation
 * Note: Actual SKU generation happens in the database via triggers
 * This is only for preview/display purposes
 */

export interface SKUPreviewData {
  brand?: string;
  category?: string;
  vendorSerial?: string;
}

/**
 * Generate a preview SKU based on product data
 * This matches the database function format: BRAND-CAT-RAND-VENDOR_SERIAL
 */
export function generateSKUPreview(data: SKUPreviewData): string {
  // Generate brand code (first 2 letters uppercase)
  const brandCode = data.brand 
    ? data.brand.substring(0, 2).toUpperCase()
    : 'GN';
  
  // Generate category code (first 3 letters uppercase)
  const categoryCode = data.category 
    ? data.category.substring(0, 3).toUpperCase()
    : 'GEN';
  
  // Generate random 4-character code (for preview only)
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  // Use vendor serial or default
  const vendorSerial = data.vendorSerial || 'V000000';
  
  // Combine: BRAND-CAT-RAND-VENDOR_SERIAL
  return `${brandCode}-${categoryCode}-${randomCode}-${vendorSerial}`;
}

/**
 * Get SKU preview text for display
 */
export function getSKUPreviewText(brand?: string, category?: string): string {
  if (!brand && !category) {
    return 'Will be auto-generated';
  }
  
  const preview = generateSKUPreview({ brand, category });
  return `Preview: ${preview}`;
}
