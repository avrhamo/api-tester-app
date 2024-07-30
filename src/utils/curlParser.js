export function parseCurlCommand(curlCommand) {
    const result = {
      method: 'GET',
      url: '',
      headers: {},
      data: null
    };
  
    const parts = curlCommand.split(' ');
    let isData = false;
  
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
  
      if (part.startsWith('http')) {
        result.url = part.replace(/['"]/g, '');
      } else if (part === '-X' || part === '--request') {
        result.method = parts[++i];
      } else if (part === '-H' || part === '--header') {
        const header = parts[++i].replace(/['"]/g, '');
        const [key, value] = header.split(':');
        result.headers[key.trim()] = value.trim();
      } else if (part === '-d' || part === '--data') {
        isData = true;
        result.data = {};
      } else if (isData) {
        try {
          const dataStr = part.replace(/['"]/g, '');
          result.data = JSON.parse(dataStr);
        } catch (error) {
          console.error('Failed to parse data:', error);
        }
        isData = false;
      }
    }
  
    return result;
  }