<script lang="ts">
    import { onMount, onDestroy, setContext, createEventDispatcher, tick } from 'svelte';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    import { strikesresult } from '$lib/stores/strikes.ts';

    export let bounds: L.LatLngBoundsExpression | undefined = undefined;
    export let view: L.LatLngExpression | undefined = undefined;
    export let zoom: number | undefined = undefined;

    export { map };

    const dispatch = createEventDispatcher();

    let map: L.Map | undefined;
    let mapElement: HTMLElement;

    // watch $strikesresult for conditional rendering
    let strikesdata = [];

    onMount(() => {
        if (!bounds && (!view || !zoom)) {
            throw new Error('Must set either bounds, or view and zoom.');
        }

        map = L.map(mapElement, { zoomControl: false })
            .on('zoom', (e) => dispatch('zoom', e))
            .on('popupopen', async (e) => {
                await tick();
                e.popup.update();
            });

        L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ).addTo(map);

        let Stadia_StamenTerrainLabels = L.tileLayer(
            'https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/{z}/{x}/{y}{r}.{ext}',
            {
                minZoom: 0,
                maxZoom: 20,
                ext: 'png'
            }
        ).addTo(map);

        let center = [51.5, -0.09]; // Default center if not provided

        // Use provided view or bounds if available
        if (view && zoom) {
            map.setView(view, zoom);
            center = view; // Set center to view
        } else if (bounds) {
            map.fitBounds(bounds);
            center = bounds.getCenter(); // Set center to bounds center
        }

        const strikeLayerGroup = L.layerGroup().addTo(map);

        const unsubscribe = strikesresult.subscribe((strikesData) => {
            let delay = 0;

            strikesData.forEach((strike, index) => {
                delay += 1000; // Delay for each data point to simulate real-time

                setTimeout(() => {
                    const radius = calculateRadius(strike.distance);
                    const color = getColorByIntensity(strike.intensity);
                    const circle = L.circle(center, {
                        color: color, // Border color based on intensity
                        opacity: 1, // Border opacity
                        fillColor: color, // Fill color based on intensity
                        fillOpacity: 0.4, // Increased fill opacity
                        radius: radius
                    });

                    // Create popup content
                    let popupContent = `Radius: ${strike.distance} km, Intensity: ${strike.intensity}`;

                    // Bind popup to circle
                    circle.bindPopup(popupContent);

                    // Add circle to the layer group
                    circle.addTo(strikeLayerGroup);

                    // Fade out animation after 5 seconds
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            circle.setStyle({ opacity: 0, fillOpacity: 0 });
                            circle.animate({ radius: 0 }, { duration: 2000 });
                        });
                    }, 5000);
                }, delay);
            });
        });
    });

    onDestroy(() => {
        map?.remove();
        map = undefined;
    });

    setContext('map', {
        getMap: () => map
    });

    // Function to calculate radius
    function calculateRadius(distance) {
        // Logic to calculate radius based on distance
        return distance * 1000; // Adjust the multiplier as needed
    }

    // Function to get color based on intensity
    function getColorByIntensity(intensity) {
        if (intensity <= 1) {
            return 'green';
        } else if (intensity > 1 && intensity <= 10) {
            return 'yellow';
        } else {
            return 'red';
        }
    }
</script>

<style>
    @keyframes fadeInOut {
        0% {
            opacity: 0;
            transform: translateY(-20px);
        }

        50% {
            opacity: 1;
            transform: translateY(0);
        }

        100% {
            opacity: 0;
            transform: translateY(-20px);
        }
    }

    .leaflet-popup-content-wrapper {
        animation: fadeInOut 5s ease forwards;
    }
</style>

<div class="z-0 h-full w-full" bind:this={mapElement}>
    {#if map}
        <slot />
    {/if}
</div>
