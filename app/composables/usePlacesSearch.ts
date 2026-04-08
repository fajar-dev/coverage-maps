import { ref, shallowRef } from 'vue';

export function usePlacesSearch(mapRef: any, onLocationSelected: (lat: number, lng: number) => void) {
  const searchQuery = ref("");
  const searchSuggestions = ref<any[]>([]);
  const showSuggestions = ref(false);
  const autocompleteService = shallowRef<any>(null);
  const placesService = shallowRef<any>(null);
  let searchTimeout: any = null;

  function initServices() {
    const google = (window as any).google;
    if (google?.maps?.places && mapRef.value) {
      autocompleteService.value = new google.maps.places.AutocompleteService();
      placesService.value = new google.maps.places.PlacesService(mapRef.value);
    }
  }

  function onSearchInput() {
    if (searchTimeout) clearTimeout(searchTimeout);

    if (!searchQuery.value || searchQuery.value.length < 3) {
      searchSuggestions.value = [];
      showSuggestions.value = false;
      return;
    }

    searchTimeout = setTimeout(searchPlaces, 300);
  }

  function searchPlaces() {
    if (!autocompleteService.value || !searchQuery.value || !mapRef.value) return;

    const request = {
      input: searchQuery.value,
      componentRestrictions: { country: "id" },
      location: mapRef.value.getCenter(),
      radius: 50000,
    };

    autocompleteService.value.getPlacePredictions(request, (predictions: any, status: any) => {
      const google = (window as any).google;
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        searchSuggestions.value = predictions;
        showSuggestions.value = true;
      } else {
        searchSuggestions.value = [];
        showSuggestions.value = false;
      }
    });
  }

  function selectSuggestion(suggestion: any) {
    showSuggestions.value = false;
    searchQuery.value = suggestion.description;

    if (!placesService.value) return;

    const request = {
      placeId: suggestion.place_id,
      fields: ["geometry"],
    };

    placesService.value.getDetails(request, (place: any, status: any) => {
      const google = (window as any).google;
      if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const location = place.geometry.location;
        onLocationSelected(location.lat(), location.lng());
      }
    });
  }

  function clearSearch() {
    searchQuery.value = "";
    searchSuggestions.value = [];
    showSuggestions.value = false;
    if (searchTimeout) clearTimeout(searchTimeout);
  }

  function destroy() {
    if (searchTimeout) clearTimeout(searchTimeout);
  }

  return {
    searchQuery,
    searchSuggestions,
    showSuggestions,
    initServices,
    onSearchInput,
    selectSuggestion,
    clearSearch,
    destroy
  };
}
