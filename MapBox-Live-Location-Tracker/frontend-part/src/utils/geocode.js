import mapboxgl from "mapbox-gl";

export const geocodePlace = async (place) => {
  const query = encodeURIComponent(place);

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json` +
      `?access_token=${mapboxgl.accessToken}` +
      `&country=IN` +                
      `&types=place,locality` +      
      `&proximity=78.9629,20.5937` +  
      `&limit=1`
  );

  const data = await res.json();

  if (!data.features || !data.features.length) {
    throw new Error(`Location not found: ${place}`);
  }

  const f = data.features[0];

  return {
    name: f.place_name,
    lng: f.center[0],
    lat: f.center[1],
  };
};
