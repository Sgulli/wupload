// Helper to identify columns that should not be filled by AI
export function identifyProtectedColumns(headers: string[]): string[] {
  // Keywords that indicate a column should be protected
  const protectedKeywords = [
    'product thumbnail',
    'sku',
    'price',
    'inventory',
    'stock',
    'rating',
    'image',
    'id',
    'url',
    'link',
    'code',
    'barcode',
    'upc',
    'ean'
  ];

  // Find headers that contain any of the protected keywords
  return headers.filter(header => 
    protectedKeywords.some(keyword => 
      header.toLowerCase().includes(keyword.toLowerCase())
    )
  );
} 