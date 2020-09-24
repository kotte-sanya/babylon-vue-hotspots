import Vue from 'vue';

export default Vue.extend({
  template: `
    <input type="range"
      :value="currentValue"
      min="0"
      :max="maxValue"
      step="1"
      @change="valueChanged($event)"/>
    `,
  data: function () {
    return {
      maxValue: 0,
      currentValue: 0,
    };
  },
  beforeMount() {
    this.maxValue = this.params.maxValue;
  },
  mounted() {},
  methods: {
    valueChanged(event) {
      this.currentValue = event.target.value;
      let valueToUse = this.currentValue === '0' ? null : this.currentValue;
      this.params.parentFilterInstance(function (instance) {
        instance.onFloatingFilterChanged('lessThanWithNulls', valueToUse);
        // const filter ={
        //   filter:valueToUse,
        //   filterTo:5,
        //   filterType: "number",
        //   type: "inRange",
        // }
        // instance.setModel(filter);

        // console.log(instance);
      });
        // this.params.api.onFilterChanged();
        // console.log(this.params.filterParams.filterOptions)
    },

    onParentModelChanged(parentModel) {
      // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
      // so just read off the value and use that
      this.currentValue = !parentModel ? 0 : parentModel.filter;
    },
  },
});