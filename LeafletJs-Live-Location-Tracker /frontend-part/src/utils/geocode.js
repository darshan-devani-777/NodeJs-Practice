export const geocodePlace = async (place) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
  );
  const data = await res.json();

  if (!data.length) throw new Error("Location not found");

  return {
    name: data[0].display_name,
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
  };
};
