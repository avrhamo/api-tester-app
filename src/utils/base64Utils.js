

export function decodeBase64(encodedString) {
    try {
      const decodedString = atob(encodedString); // Decode Base64
      return JSON.parse(decodedString); // Parse JSON
    } catch (error) {
      console.error('Error decoding Base64:', error);
      return null; // Return null if decoding fails
    }
  }