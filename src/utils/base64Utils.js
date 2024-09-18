export function decodeBase64(encodedString) {
    try {
      const decodedString = atob(encodedString); // Decode Base64
      return JSON.parse(decodedString); // Parse JSON
    } catch (error) {
      console.error('Error decoding Base64:', error);
      return null; // Return null if decoding fails
    }
  }

export const encodeBase64 = (jsonString) => {
  try {
    // Ensure input is a valid string
    if (typeof jsonString !== 'string') {
      throw new Error('Input must be a string');
    }
    // Use `btoa` to encode the string to Base64
    return btoa(jsonString);
  } catch (error) {
    console.error('Failed to encode to Base64:', error);
    return null;  // Return null or handle the error as needed
  }
};
