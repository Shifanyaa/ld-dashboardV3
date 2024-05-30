<script lang="ts">
	import { io } from 'socket.io-client';
	const socket = io('http://localhost:3000');

	let adminresult = [];

	socket.on('connect', () => {
		socket.on('getfirst', (data) => {
			if (data) {
				console.log(JSON.stringify(data));
				adminresult = data;
			}
		});
    socket.on('hasilnya', (data) => {
			if (data) {
				console.log(JSON.stringify(data));
				adminresult = data.data;
			}
		});
		console.log('Svelte Connected!');
	});
	socket.on('disconnect', () => {
		console.log('Svelte Disconnected!');
	});
</script>

<div>
  main

  {JSON.stringify(adminresult)}
</div>
