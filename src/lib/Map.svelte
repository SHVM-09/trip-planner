<script lang="ts">
	import { onMount } from 'svelte';
	export let from: [number, number];
	export let to: [number, number];

	let mapEl: HTMLDivElement;
	let leaflet: typeof import('leaflet');

  // ➊ SVGs copied from lucide “map-pin” / “flag” (24 × 24)
  const pinSvg  = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        fill="#2563eb" viewBox="0 0 24 24">
                     <path d="M12 2C8.13 2 5 5.13 5 9c0 4.25 5.77 11.53 6 11.82.19.24.52.24.71 0C13.23 20.53 19 13.25 19 9c0-3.87-3.13-7-7-7zm0 10.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/>
                   </svg>`;
  const flagSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        fill="#ef4444" viewBox="0 0 24 24">
                     <path d="M6 3v18M6 4h11l-1 4 1 4H6"/>
                   </svg>`;

	onMount(async () => {
		if (typeof window === 'undefined') return;
		leaflet = await import('leaflet');
		await import('leaflet/dist/leaflet.css');

		// ➋ Build Leaflet DivIcons
		const userIcon = leaflet.divIcon({
		html: pinSvg, className: 'marker-pin', iconSize: [24, 24], iconAnchor: [12, 24]
		});
		const destIcon = leaflet.divIcon({
		html: flagSvg, className: 'marker-flag', iconSize: [24, 24], iconAnchor: [12, 24]
		});

		const map = leaflet.map(mapEl, { zoomControl: false }).setView(from, 10);
		leaflet
		.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		})
		.addTo(map);

		leaflet.marker(from, { icon: userIcon }).addTo(map).bindPopup('Your location').openPopup();
		leaflet.marker(to,   { icon: destIcon }).addTo(map).bindPopup('Destination');
		leaflet.polyline([from, to], { color: '#2563eb', weight: 4, opacity: 0.7 }).addTo(map);
	});
</script>

<div bind:this={mapEl} class="relative z-0 w-full h-64 sm:h-[400px] rounded-xl shadow-lg border border-zinc-800"></div>
