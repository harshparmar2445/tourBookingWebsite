/*eslint-disable*/
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaGFyc2hwYXJtYXIiLCJhIjoiY20wM296ZWVhMDAxbDJyc2dkNjE3dTM4ZiJ9.p7fPdWn2uiOTLGYD0IBoew';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/harshparmar/cm03qzn7400df01qsepea4b3j', // style URL
    scrollZoom: false
    // center: [-118.113491,34.111745], // starting position [lng, lat]
    // zoom: 9, // starting zoom
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //Create Marker
    const eliment = document.createElement('div');
    eliment.className = 'marker';

    //Add Marker
    new mapboxgl.Marker({
      element: eliment,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //Extend Map bounds to inclued current locations
    bounds.extend(loc.coordinates);
  });

  // Fit map to the bounds

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
