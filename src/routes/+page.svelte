<script lang="ts">
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import Map from '$lib/Map.svelte';
	import Sidebar from '$lib/Sidebar.svelte';
	import { getLatLon } from '$lib/api/weather';

	let input = $state('');
	let response = $state('');
	let loading = $state(false);
	let errorMsg = $state('');

	let userCoords = $state<{ lat: number; lon: number } | null>(null);
	let showMap = $state(false);
	let toCoords: [number, number] = $state([23.0225, 72.5714]);

	let selectedTrip: any = $state(null);
	let trips: any[] = $state([]);
	let sidebarOpen = $state(false);

	onMount(() => {
		detectLocation();
		fetchTrips();
	});

	async function fetchTrips() {
		const res = await fetch('/api/trips');
		trips = await res.json();
	}

	function detectLocation() {
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				userCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
			},
			(err) => {
				console.error('❌ Location access denied:', err);
			}
		);
	}

	function renderMarkdown(md: string) {
		return typeof md === 'string' ? marked.parse(md) : '<p>Invalid markdown</p>';
	}

	async function handlePlan() {
		loading = true;
		const res = await fetch('/?plan', {
			method: 'POST',
			body: JSON.stringify({ input, userCoords }),
			headers: { 'Content-Type': 'application/json' }
		});
		const data = await res.json();
		if (!res.ok) {
			errorMsg = data.error || 'Failed to generate plan';
			loading = false;
			return;
		}
		response = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
		if (data.destinationCoords) {
			toCoords = [data.destinationCoords.lat, data.destinationCoords.lon];
		} else {
			const fallbackCity = extractCityFromText(input);
			const { lat, lon } = await getLatLon(fallbackCity);
			toCoords = [lat, lon];
		}
		if (userCoords) showMap = true;
		input = '';
		loading = false;
		await fetchTrips();
		selectedTrip = trips[0];
	}

	async function handleSelectPastTrip(trip: any) {
		selectedTrip = trip;
		try {
			const parsed = JSON.parse(trip.result);
			response = parsed.output ?? trip.result;
		} catch {
			response = trip.result;
		}
		if (trip.destination_lat && trip.destination_lon) {
			toCoords = [trip.destination_lat, trip.destination_lon];
		} else {
			const city = extractCityFromText(trip.input);
			const { lat, lon } = await getLatLon(city);
			toCoords = [lat, lon];
		}
		if (userCoords) showMap = true;
	}

	function extractCityFromText(text: string): string {
		const match = text.match(/go to (.+?)(\s|$)/i);
		return match?.[1] || 'Ahmedabad';
	}
</script>

<style>
	/* Scrollbars */
	::-webkit-scrollbar { width: 8px; }
	::-webkit-scrollbar-thumb { background: #52525b; border-radius: 4px; }
</style>

<div class="flex h-screen overflow-hidden bg-zinc-950 text-white">
	<!-- 📱  Mobile sidebar trigger  -->
	<button
		class="md:hidden absolute top-4 left-4 z-20 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full focus:ring focus:ring-blue-600"
		aria-label="Toggle Sidebar"
		onclick={() => (sidebarOpen = !sidebarOpen)}>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
	</button>

	<!-- 🗂  Sidebar  -->
	<aside
		class={`fixed md:static inset-y-0 left-0 top-0 z-50 md:z-auto w-72
				transition-transform duration-300 bg-zinc-900 border-r border-zinc-800
				overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
		>
		<Sidebar {trips} onSelect={handleSelectPastTrip} selectedId={selectedTrip?.id} />
	</aside>

	<!-- 🌐 Main area -->
	<div class="flex-1 flex flex-col h-full">
		<header class="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 py-4 shadow-md">
			<h1 class="text-3xl font-bold text-center mb-4 tracking-tight">Smart AI Trip Planner</h1>
			<div class="max-w-2xl mx-auto flex gap-3 px-4">
				<input
					bind:value={input}
					placeholder="Ex: I want to go to Berlin next week"
					class="flex-1 p-3 rounded-lg text-sm bg-zinc-800 placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
				<button class="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 disabled:opacity-50" onclick={handlePlan} disabled={loading}>
					{loading ? 'Planning…' : 'Plan'}
				</button>
			</div>
		</header>

		<main class="flex-1 overflow-y-auto px-4 pb-10">
			{#if response}

				{#if showMap && userCoords}
					<div class="max-w-4xl mx-auto mt-6">
						{#key `${toCoords[0]}-${toCoords[1]}`}
							<Map from={[userCoords.lat, userCoords.lon]} to={toCoords} />
						{/key}
					</div>
				{/if}
				<div class="max-w-4xl mx-auto mt-6 bg-zinc-900 p-6 rounded-xl shadow-lg prose prose-invert prose-headings:text-blue-400">
					{@html renderMarkdown(response)}
				</div>
			{:else if errorMsg}
				<p class="text-center mt-10 text-red-400">Unable to generate plan. Please try again.</p>
			{/if}

			{#if selectedTrip}
				<div class="mt-10">
					<h2 class="text-xl font-semibold mb-4">Past Trip Details</h2>
					<div class="bg-zinc-900 p-6 rounded-xl shadow-lg prose prose-invert">
						<p><strong>Input:</strong> {selectedTrip.input}</p>
						<p><strong>Result:</strong> {@html renderMarkdown(selectedTrip.result)}</p>
						{#if selectedTrip.destination_lat && selectedTrip.destination_lon}
							<p><strong>Destination Coordinates:</strong> {selectedTrip.destination_lat}, {selectedTrip.destination_lon}</p>
						{/if}
					</div>
				</div>
			{:else}
				<p class="text-center mt-10 text-zinc-500 text-sm">Select a past trip from the sidebar to view details.</p>
			{/if}
		</main>
	</div>
</div>

{#if sidebarOpen}
  <div
	role="presentation"
    class="fixed inset-0 z-40 md:hidden bg-black/50"
    onclick={() => (sidebarOpen = false)}
  ></div>
{/if}