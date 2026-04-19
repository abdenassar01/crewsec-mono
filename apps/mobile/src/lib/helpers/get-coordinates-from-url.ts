export const extractCoordinates = async (shortUrl: string) => {
  if (!shortUrl || shortUrl.trim() === '') {
    console.error('Cannot extract coordinates from empty URL');
    return null;
  }

  try {
    const result = await fetch(shortUrl);

    const res = await result.json();
    const fullUrl = res.responseURL;

    let regex = /@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/;
    let match = fullUrl.match(regex);

    if (!match) {
      regex = /3d([-+]?\d+\.\d+).*4d([-+]?\d+\.\d+)/;
      match = fullUrl.match(regex);
    }

    if (!match) {
      regex = /[?&]q=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/;
      match = fullUrl.match(regex);
    }

    if (match) {
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[2]);
      return { latitude, longitude };
    } else {
      console.log('Coordinates not found in the URL');
    }
  } catch (error) {
    console.error('Error resolving URL:', error);
  }
};
