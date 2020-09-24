<template>
  <div style="height: 500px">
      <div class="example-wrapper">
          <div>
              <div class="button-group">
                  <button v-on:click="saveFilterModel()">Save Filter Model</button>
                  <button v-on:click="restoreFilterModel()">Restore Saved Filter Model</button>
                  <button v-on:click="restoreFromHardCoded()" title="Name = 'Mich%', Country = ['Ireland', 'United States'], Age < 30, Date < 01/01/2010">
                      Set Custom Filter Model
                  </button>
                  <button v-on:click="clearFilters()">Reset Filters</button>
                  <button v-on:click="destroyFilter()">Destroy Filter</button>
              </div>
          </div>
          <div>
              <div class="button-group">
                  Saved Filters: <span id="savedFilters">(none)</span>
              </div>
          </div>
          <ag-grid-vue
          style="width: 100%; height: 500px;"
          class="ag-theme-alpine"
          id="myGrid"
          :gridOptions="gridOptions"
          @grid-ready="onGridReady"
          :columnDefs="columnDefs"
          :defaultColDef="defaultColDef"
          :rowData="rowData"></ag-grid-vue>
      </div>
  </div>
</template>

<script>
    import {AgGridVue} from "ag-grid-vue";
    var filterParams = {
      comparator: function (filterLocalDateAtMidnight, cellValue) {
        var dateAsString = cellValue;
        if (dateAsString == null) return -1;
        var dateParts = dateAsString.split('/');
        var cellDate = new Date(
          Number(dateParts[2]),
          Number(dateParts[1]) - 1,
          Number(dateParts[0])
        );
        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
          return 0;
        }
        if (cellDate < filterLocalDateAtMidnight) {
          return -1;
        }
        if (cellDate > filterLocalDateAtMidnight) {
          return 1;
        }
      },
    };

    var savedFilterModel = null;

    export default {
        name: 'GlGrid1',
        data: function () {
          return {
            gridOptions: null,
            gridApi: null,
            columnApi: null,
            columnDefs: null,
            defaultColDef: null,
            rowData: null,
          };
        },
        components: {
            'ag-grid-vue': AgGridVue,
        },
        beforeMount() {
          this.gridOptions = {};
          this.columnDefs = [
            {
              field: 'athlete',
              filter: 'agTextColumnFilter',
            },
            {
              field: 'age',
              filter: 'agNumberColumnFilter',
              maxWidth: 100,
            },
            { field: 'country' },
            {
              field: 'year',
              maxWidth: 100,
            },
            {
              field: 'date',
              filter: 'agDateColumnFilter',
              filterParams: filterParams,
            },
            { field: 'sport' },
            {
              field: 'gold',
              filter: 'agNumberColumnFilter',
            },
            {
              field: 'silver',
              filter: 'agNumberColumnFilter',
            },
            {
              field: 'bronze',
              filter: 'agNumberColumnFilter',
            },
            {
              field: 'total',
              filter: 'agNumberColumnFilter',
            },
          ];
          this.defaultColDef = {
            flex: 1,
            minWidth: 150,
            filter: true,
            sortable: true,
          };
        },
        mounted() {
          this.gridApi = this.gridOptions.api;
          this.gridColumnApi = this.gridOptions.columnApi;
        },
        methods: {
          clearFilters() {
            this.gridApi.setFilterModel(null);
          },
          saveFilterModel() {
            savedFilterModel = this.gridApi.getFilterModel();
            var keys = Object.keys(savedFilterModel);
            var savedFilters = keys.length > 0 ? keys.join(', ') : '(none)';
            document.querySelector('#savedFilters').innerHTML = savedFilters;
          },
          restoreFilterModel() {
            console.log(savedFilterModel)
            this.gridApi.setFilterModel(savedFilterModel);
          },
          restoreFromHardCoded() {
            var hardcodedFilter = {
              country: {
                type: 'set',
                values: ['Ireland', 'United States'],
              },
              age: {
                type: 'lessThan',
                filter: '30',
              },
              athlete: {
                type: 'startsWith',
                filter: 'Mich',
              },
              date: {
                type: 'lessThan',
                dateFrom: '2010-01-01',
              },
            };
            this.gridApi.setFilterModel(hardcodedFilter);
          },
          destroyFilter() {
            this.gridApi.destroyFilter('athlete');
          },
          onGridReady(params) {
            const httpRequest = new XMLHttpRequest();
            const updateData = (data) => {
              this.rowData = data;
            };

            httpRequest.open(
              'GET',
              'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json'
            );
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
              if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                updateData(JSON.parse(httpRequest.responseText));
              }
            };
          },
        },
    }
</script>