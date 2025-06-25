/**
 * Creates blob URL from data and opens it in a new tab
 * Automatically revokes URL after use
 */
export function openBlobInNewTab(blob: Blob, mimeType: string = 'application/pdf'): void {
    const blobWithType = new Blob([blob], { type: mimeType });
    const url = window.URL.createObjectURL(blobWithType);
    
    try {
      window.open(url, '_blank');
    } finally {
      // Revoke URL after some time to give browser time to open file
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    }
  }
  
  /**
   * Downloads blob file as a download
   */
  export function downloadBlob(blob: Blob, filename: string, mimeType: string = 'application/pdf'): void {
    const blobWithType = new Blob([blob], { type: mimeType });
    const url = window.URL.createObjectURL(blobWithType);
    
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      window.URL.revokeObjectURL(url);
    }
  }