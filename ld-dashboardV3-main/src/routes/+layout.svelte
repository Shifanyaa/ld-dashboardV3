<script lang="ts">
	import '../app.css';
	import socket from '$lib/socket';

	// import { io } from 'socket.io-client';
	// import { dbstatus } from '$lib/stores/dbstatus';
	// import { strikesresult, updateStrikesResult } from '$lib/stores/strikes.ts';

	// const socket = io('http://localhost:3000/');

	// socket.on('connect', () => {
	// 	socket.on('getfirst', (data) => {
	// 		if (data) {
	// 			updateStrikesResult(data);
	// 		}
	// 	});
	// 	socket.on('hasilnya', (data) => {
	// 		if (data) {
	// 			updateStrikesResult(data.data);
	// 		}
	// 	});
	// 	console.log('svelte is connected');
	// 	dbstatus.set("connected");
	// });

	// socket.on('disconnect', () => {
	// 	console.log('svelte is DISKONEK !!!'); 
	// 	dbstatus.set("disconnected");
	// });

	import { dbstatus } from '$lib/stores/dbstatus';
	import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher />
<slot></slot>

<style></style>
