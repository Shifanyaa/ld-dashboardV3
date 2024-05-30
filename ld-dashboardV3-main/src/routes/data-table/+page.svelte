<script>
    // Imports
    import Sun from 'svelte-radix/Sun.svelte';
    import Moon from 'svelte-radix/Moon.svelte';
    import CaretSort from 'svelte-radix/CaretSort.svelte';
    import { toggleMode } from 'mode-watcher';
    import { Button } from '$lib/components/ui/button';
    import { onMount, onDestroy } from 'svelte';
    import * as Table from '$lib/components/ui/table';
    import ChevronLeft from 'svelte-radix/ChevronLeft.svelte';
    import * as Pagination from '$lib/components/ui/pagination';
    import Reload from 'svelte-radix/Reload.svelte';
    import { Label } from '$lib/components/ui/label';
    import * as Select from '$lib/components/ui/select';

    // Variables
    // let items = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let rowsPerPageOptions = [5, 10, 20, 50];
    let websocketIndicatorColor = 'red';
    let isLoading = false;
    let latestStrike = '';
    let sortBy = 'time'; // Default sorting by time
    let sortOrder = 'ASC'; // Default sorting order

    // Export to CSV
    let tableHeader = ["ID", "Time", "Distance", "Intensity"];

    // Data retrieval
    import { strikesresult } from '$lib/stores/strikes.ts';
    import { dbstatus } from '$lib/stores/dbstatus.ts';

    // watch $dbstatus
    $: console.log($dbstatus);

    // Functions
    function formatDate(date) {
        return date.toLocaleString();
    }

    // watch $strikesresult for latest strike
    $: latestStrike = $strikesresult.length ? $strikesresult[$strikesresult.length - 1] : null;



    function handleItemsPerPageChange(event) {
        itemsPerPage = parseInt(event.target.value);
        currentPage = 1; // Reset to the first page
    }

    function exportToCSV() {
    try {
        if (!$strikesresult.length) {
            console.error('No data to export');
            return;
        }
        
        // Get unique headers from all objects
        const headers = Array.from(new Set($strikesresult.flatMap(Object.keys)));
        
        // Create CSV content with headers and values
        const csvContent = [
            headers.join(','), // header row
            ...$strikesresult.map(item => 
                headers.map(header => 
                    item[header] != null ? String(item[header]).replace(/"/g, '""') : ''
                ).join(',')
            )
        ].join('\n');
        
        // Encode the CSV content
        const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        // Create a temporary link element
        const link = document.createElement('a');
        // Set the download attribute with a filename
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'data.csv');
        // Append the link to the document body
        document.body.appendChild(link);
        // Programmatically click the link to trigger the download
        link.click();
        // Remove the link from the document body
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
    }
}


    function handleSort(column) {
        if (sortBy === column) {
            sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
        } else {
            sortBy = column;
            sortOrder = 'ASC';
        }

        $strikesresult = $strikesresult.slice().sort((a, b) => {
            if (sortOrder === 'ASC') {
                return a[column] > b[column] ? 1 : -1;
            } else {
                return a[column] < b[column] ? 1 : -1;
            }
        });
    }

    // watch $strikesresult for pagination
    $: paginatedItems = $strikesresult.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
</script>

<div class="mb-2 flex flex-col sm:flex-row items-center justify-between">
    <div class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        <a href="/dashboard" class="w-full sm:w-auto">
            <Button class="flex items-center space-x-1 w-full sm:w-auto">
                <ChevronLeft class="h-4 w-4" />
                Back to Dashboard
            </Button>
        </a>
        <Button on:click={exportToCSV} class="mt-2 sm:mt-0" variant="secondary">Export to CSV</Button>
    </div>

    <div class="flex items-center space-x-2 mt-2 sm:mt-0">
        <span class="text-sm text-gray-600 dark:text-gray-200 w-full sm:w-auto">
            {#if latestStrike}
                Latest Strike: {latestStrike.time}
            {/if}
        </span>
        <span class="flex items-center space-x-1">
            <span class="text-sm text-gray-500">DB:</span>
            <span class="h-3 w-3 rounded-full" style="background-color: {$dbstatus};"></span>
        </span>
        <Button on:click={toggleMode} variant="outline" size="icon">
            <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
            <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
            <span class="sr-only">Toggle theme</span>
        </Button>
    </div>
</div>

<div class="">
    {#if isLoading}
        <div class="mt-8 flex items-center justify-center">
            <Reload class="r-2 h-4 w-4 animate-spin" />
            <span class="ml-2 text-gray-900">Loading...</span>
        </div>
    {:else}
        <div class="mb-2 flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-400 text-sm">Total Items: {$strikesresult.length}</span>
            <div class="flex items-center space-x-1 w-auto sm:w-auto">
                <label for="itemsPerPage" class="mr-2 text-gray-700 dark:text-gray-400 text-sm">Rows per page:</label>
                <Select.Root >
                    <Select.Trigger class="w-auto">
                        <Select.Value placeholder="10" />
                    </Select.Trigger>
                    <Select.Content on:change={handleItemsPerPageChange}>
                        {#each rowsPerPageOptions as option}
                            <Select.Item value={option} selected={option === itemsPerPage} >{option}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>
        </div>

        
        <div class="overflow-x-auto rounded-md border">
            <Table.Root class="text-md w-full">
                <Table.Header>
                    <Table.Row>
                        <Table.Head class="text-left">ID</Table.Head>
                        <Table.Head class="text-left">
                            <Button class="text-left pl-0" variant="ghost" on:click={() => handleSort('time')}>
                                Time<CaretSort class="ml-2 h-4 w-4" />
                            </Button>
                        </Table.Head>
                        <Table.Head class="text-left"> 
                            <Button class="text-left pl-0" variant="ghost" on:click={() => handleSort('distance')}>
                                Distance<CaretSort class="h-4 w-4" />
                            </Button>
                        </Table.Head>
                        <Table.Head class="text-left"> 
                            <Button class="text-left pl-0" variant="ghost" on:click={() => handleSort('intensity')}>
                                Intensity<CaretSort class="h-4 w-4" />
                            </Button>
                        </Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#if !$strikesresult || $strikesresult.length === 0}
                        <Table.Row>
                            <Table.Cell colspan="4" class="items-center">
                                <div class="flex items-center space-x-2">
                                    <Reload class="mr-2 h-4 w-4 animate-spin" id="reload" />
                                    <Label for="reload" class="text-lg">Loading Data ...</Label>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    {:else}
                        {#each paginatedItems as strike}
                            <Table.Row>
                                <Table.Cell class="text-left">{strike.id}</Table.Cell>
                                <Table.Cell class="text-left">{strike.time}</Table.Cell>
                                <Table.Cell class="text-left">{strike.distance} km</Table.Cell>
                                <Table.Cell class="text-left">{strike.intensity}</Table.Cell>
                            </Table.Row>
                        {/each}
                    {/if}
                </Table.Body>
            </Table.Root>
        </div>
        <div class="flex flex-col items-center justify-center">
            <div class="mt-4">
                <Pagination.Root count={$strikesresult.length} perPage={itemsPerPage} let:pages>
                    <Pagination.Content>
                        <Pagination.Item>
                            <Pagination.PrevButton
                                on:click={() => (currentPage = currentPage - 1)}
                                disabled={currentPage === 1}
                            />
                        </Pagination.Item>
                        {#each pages as page (page.key)}
                            {#if page.type === 'ellipsis'}
                                <Pagination.Item>
                                    <Pagination.Ellipsis />
                                </Pagination.Item>
                            {:else}
                                <Pagination.Item>
                                    <Pagination.Link
                                        {page}
                                        on:click={() => (currentPage = page.value)}
                                        isActive={currentPage == page.value}
                                    >
                                        {page.value}
                                    </Pagination.Link>
                                </Pagination.Item>
                            {/if}
                        {/each}
                        <Pagination.Item>
                            <Pagination.NextButton
                                on:click={() => (currentPage = currentPage + 1)}
                                disabled={currentPage === pages.length}
                            />
                        </Pagination.Item>
                    </Pagination.Content>
                </Pagination.Root>
            </div>
        </div>
    {/if}
</div>
