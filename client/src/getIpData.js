export const getIpData = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const { ip } = await response.json();
        
        const geoResponse = await fetch(`https://geo.ipify.org/api/v2/country,city?apiKey=at_dmwBpC7iL8FGGaT5c6O1y6sAXaCgJ&ipAddress`);
        const geoData = await geoResponse.json();
        
        return {
            ip,
            location: {
                country: geoData.location.country,
                region: geoData.location.region,
                city: geoData.location.city,
                lat: geoData.location.lat,
                lng: geoData.location.lng,
                postalCode: geoData.location.postalCode,
                timezone: geoData.location.timezone,
                geonameId: geoData.location.geonameId
            },
            as: geoData.as,
            isp: geoData.isp,
            proxy: geoData.proxy
        };
    } catch (error) {
        console.error('IP data error:', error);
        return null;
    }
};