<script lang="ts">
	import { onMount } from 'svelte';
	export let from: [number, number];
	export let to: [number, number];

	let mapEl: HTMLDivElement;
	let leaflet: typeof import('leaflet');

	onMount(async () => {
		if (typeof window === 'undefined') return;
		leaflet = await import('leaflet');
		await import('leaflet/dist/leaflet.css');
		const map = leaflet.map(mapEl, { zoomControl: false }).setView(from, 10);
		leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
		leaflet.marker(from).addTo(map).bindPopup('📍 You').openPopup();
		leaflet.marker(to).addTo(map).bindPopup('📍 Destination');
		leaflet.polyline([from, to], { color: '#2563eb', weight: 4, opacity: 0.7 }).addTo(map);
	});
</script>

<div bind:this={mapEl} class="relative z-0 w-full h-64 sm:h-[400px] rounded-xl shadow-lg border border-zinc-800"></div>
