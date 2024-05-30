<script lang="ts">
    import { dbstatus } from '$lib/stores/dbstatus';
    import { strikesresult } from '$lib/stores/strikes';
  
    // Watch the dbstatus value
    $: console.log($dbstatus);
    $: console.log($strikesresult);
  </script>
  
  <div>
    <h1>Page Content</h1>
    <p>Connection status: {$dbstatus}</p>
    <ul>
        {#each $strikesresult as strike}
        <li>{strike.id} - {strike.time} - {strike.distance} - {strike.intensity}</li>
        {/each}
    </ul>
  </div>
  