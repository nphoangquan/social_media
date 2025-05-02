export async function uploadFile(file: File): Promise<{ url: string; publicId: string }> {
    try {
      // Sử dụng FileReader để chuyển file thành Base64 string
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (!event.target || typeof event.target.result !== 'string') {
            reject(new Error('Failed to read file'));
            return;
          }
          
          // Base64 URL sẽ được sử dụng trực tiếp thay vì lưu trữ trên Cloudinary
          const base64String = event.target.result;
          
          // Trả về base64 làm URL và tên file làm publicId
          resolve({ 
            url: base64String, 
            publicId: `local_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}` 
          });
        };
        
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        
        // Đọc file như là Base64 URL
        reader.readAsDataURL(file);
      });
    } catch (error: unknown) {
      console.error('File processing error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process file');
    }
  } 