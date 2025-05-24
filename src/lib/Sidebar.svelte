<script lang="ts">
  import { onMount } from 'svelte';
  import { X } from 'lucide-svelte';
  export let selectedId: number | null = null;
  export let onSelect: (trip: any) => void;
  export let trips: any[] = [];

  async function fetchTrips() {
    const res = await fetch('/api/trips');
    trips = await res.json();
  }

  async function deleteTrip(id: number) {
    if (!confirm('Delete this trip?')) return;
    const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
    if (res.ok) trips = trips.filter(t => t.id !== id);
  }

  onMount(fetchTrips);
</script>

<!-- wrapper -->
<div class="h-full flex flex-col gap-4 p-6">
  <h2 class="text-xl font-semibold text-zinc-200">Planned Trips</h2>
  <p class="text-xs leading-relaxed text-zinc-400">
    Browse your saved itineraries below or plan a new one from the top bar.
  </p>

  <!-- list -->
  <div class="space-y-1 pr-1 overflow-y-auto flex-1">
    {#each trips as trip}
      <div
        role="presentation"
        onclick={() => onSelect(trip)}
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer
               hover:bg-zinc-800 hover:text-white
               {trip.id === selectedId ? 'bg-blue-700 text-white' : 'text-zinc-200'}"
      >
        <span class="truncate flex-1 text-sm">Trip to {trip.destination}</span>

        <button
          onclick={(e) => { e.stopPropagation(); deleteTrip(trip.id); }}
          class="p-[3px] rounded hover:bg-zinc-700 focus:outline-none"
          title="Delete trip"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    {/each}
  </div>
</div>