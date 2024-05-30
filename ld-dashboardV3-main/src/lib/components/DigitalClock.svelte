<script>
	import { onMount, onDestroy } from 'svelte';

	let time = new Date();

	// Function to update time every second
	const updateTime = () => {
		time = new Date();
	};

	// Start updating time when the component is mounted
	const interval = setInterval(updateTime, 1000);

	// Stop updating time when the component is destroyed
	onMount(() => {
		updateTime(); // Update time immediately when component is mounted
	});

	onDestroy(() => {
		clearInterval(interval); // Clear interval when component is destroyed
	});
</script>

<div class="digital-clock-wrapper space-y-0">
	<h3 class="text- font-regular scroll-m-20 tracking-tight mb-0">
		{time.toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric' })}
	</h3>
	<h4 class="scroll-m-20 text-xl font-semibold tracking-tight mt-0">
		{time.toLocaleTimeString()}
	</h4>
</div>
