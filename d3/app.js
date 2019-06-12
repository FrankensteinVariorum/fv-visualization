(function () {

  function get_source_witness() {
    return d3.select("#source-witness button[disabled]").attr("id")
  };

  function set_source_witness(id) {
    return d3.select("#source-witness button[id='" + id + "']")
  };

  function draw_apps(data) {
    var maxNchar = d3.max(data, d => d3.max([d.fMS_nchar, d.f1818_nchar, d.f1823_nchar, d.f1831_nchar, d.fThomas_nchar]))
    var width_scale = d3.scale.linear().domain([0, maxNchar]).range([0, 500])

    var minchange = d3.min(data, d => d3.min([d.f1818_f1818, d.f1818_f1823, d.f1818_f1831, d.f1818_fMS, d.f1818_fThomas, d.f1823_f1818, d.f1823_f1823, d.f1823_f1831, d.f1823_fMS, d.f1823_fThomas, d.f1831_f1818, d.f1831_f1823, d.f1831_f1831, d.f1831_fMS, d.f1831_fThomas, d.fMS_f1818, d.fMS_f1823, d.fMS_f1831, d.fMS_fMS, d.fMS_fThomas, d.fThomas_f1818, d.fThomas_f1823, d.fThomas_f1831, d.fThomas_fMS, d.fThomas_fThomas]))
    var maxchange = d3.max(data, d => d3.max([d.f1818_f1818, d.f1818_f1823, d.f1818_f1831, d.f1818_fMS, d.f1818_fThomas, d.f1823_f1818, d.f1823_f1823, d.f1823_f1831, d.f1823_fMS, d.f1823_fThomas, d.f1831_f1818, d.f1831_f1823, d.f1831_f1831, d.f1831_fMS, d.f1831_fThomas, d.fMS_f1818, d.fMS_f1823, d.fMS_f1831, d.fMS_fMS, d.fMS_fThomas, d.fThomas_f1818, d.fThomas_f1823, d.fThomas_f1831, d.fThomas_fMS, d.fThomas_fThomas]))

    var col_scale = d3.scaleDiverging(d3.interpolatePuOr).domain([minchange, 0, maxchange])

    function witness_shift(from, to) {
      // set_source_witness(to)
      console.log(from + ">" + to)
      d3.select("#wrapper")
        .selectAll("div.app")
        .transition()
        .duration(1000)
        .style("background-color", d => col_scale(d[(from + "_" + to)]))
        .transition()
        .duration(2000)
        .delay(2000)
        .style("width", d => width_scale(d[to + "_nchar"]) + "px")
      return
    };

    function update_heading(from, to) {
      d3.select("h2#witness")
        .html(from + " -> " + to)
      return
    }

    function input_click() {
      var new_witness = this.getAttribute("id")
      console.log(new_witness)
      // disable button
      // d3.selectAll("#button-container button")
      //   .button("enable")
      // this.button("disable")
      update_heading(get_source_witness(), new_witness)
      witness_shift(get_source_witness(), new_witness)
      return
    }

    d3.selectAll("button")
      .on("click", input_click);

    d3.select("#wrapper")
      .selectAll("div.app")
      .data(data)
      .enter()
      .append("div")
      .classed("app", true)
      .attr("app", d => d.app)
      .style("width", d => width_scale(d[get_source_witness() + "_nchar"]) + "px")

    update_heading(get_source_witness())

    witness_shift("fMS", "f1818")
  };



  d3.json("data.json", function (error, data) {
    if (error) {
      console.error(error)
    } else {
      draw_apps(data)
    }
  });

})();
