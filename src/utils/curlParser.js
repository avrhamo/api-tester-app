export function parseCurlCommand(curlCommand) {
  let method = 'GET';
  let url = '';
  let queryParams = {};
  let headers = {};
  let data = null;

  // Remove newlines and extra spaces
  const cleanCommand = curlCommand.replace(/\s+/g, ' ').trim();

  // Split the command, respecting quoted strings
  const parts = cleanCommand.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].replace(/^['"]|['"]$/g, '');

    if (part.startsWith('http')) {
      const urlParts = part.split('?');
      url = urlParts[0];
      if (urlParts[1]) {
        const searchParams = new URLSearchParams(urlParts[1]);
        for (const [key, value] of searchParams) {
          queryParams[key] = value;
        }
      }
    } else if (part === '-X' || part === '--request') {
      method = parts[++i].replace(/^['"]|['"]$/g, '');
    } else if (part === '-H' || part === '--header') {
      const header = parts[++i].replace(/^['"]|['"]$/g, '');
      const [key, ...valueParts] = header.split(':');
      headers[key.trim()] = valueParts.join(':').trim();
    } else if (part === '-d' || part === '--data' || part === '--data-raw') {
      // Combine all parts of the data until we find a part starting with '-' or the end
      let dataStr = '';
      while (i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
        dataStr += parts[++i] + ' ';
      }
      dataStr = dataStr.trim();
      
      // Remove surrounding quotes if present
      dataStr = dataStr.replace(/^['"]|['"]$/g, '');
      
      try {
        // Replace single quotes with double quotes for valid JSON
        const jsonStr = dataStr.replace(/'/g, '"');
        data = JSON.parse(jsonStr);
      } catch (error) {
        console.error('Failed to parse data:', error);
        data = dataStr;  // Store raw string if parsing fails
      }
    }
  }

  const result = { method, url, queryParams, headers, data };
  console.log('Parsed curl command:', result);

  return result;
}