(function () {

  source_witness = "fMS"
  target_witness = "f1818"

  function get_source_witness() {
    return source_witness
  };

  function set_source_witness(id) {
    source_witness = id
    return true
  };

  function get_target_witness() {
    return target_witness
  };

  function set_target_witness(id) {
    target_witness = id
    return true
  };



  function draw_apps(data) {
    var maxNchar = d3.max(data, d => d3.max([d.fMS_nchar, d.f1818_nchar, d.f1823_nchar, d.f1831_nchar, d.fThomas_nchar]))
    var width_scale = d3.scale.linear().domain([0, maxNchar]).range([0, 400])

    var minchange = d3.min(data, d => d3.min([d.f1818_f1818, d.f1818_f1823, d.f1818_f1831, d.f1818_fMS, d.f1818_fThomas, d.f1823_f1818, d.f1823_f1823, d.f1823_f1831, d.f1823_fMS, d.f1823_fThomas, d.f1831_f1818, d.f1831_f1823, d.f1831_f1831, d.f1831_fMS, d.f1831_fThomas, d.fMS_f1818, d.fMS_f1823, d.fMS_f1831, d.fMS_fMS, d.fMS_fThomas, d.fThomas_f1818, d.fThomas_f1823, d.fThomas_f1831, d.fThomas_fMS, d.fThomas_fThomas]))
    var maxchange = d3.max(data, d => d3.max([d.f1818_f1818, d.f1818_f1823, d.f1818_f1831, d.f1818_fMS, d.f1818_fThomas, d.f1823_f1818, d.f1823_f1823, d.f1823_f1831, d.f1823_fMS, d.f1823_fThomas, d.f1831_f1818, d.f1831_f1823, d.f1831_f1831, d.f1831_fMS, d.f1831_fThomas, d.fMS_f1818, d.fMS_f1823, d.fMS_f1831, d.fMS_fMS, d.fMS_fThomas, d.fThomas_f1818, d.fThomas_f1823, d.fThomas_f1831, d.fThomas_fMS, d.fThomas_fThomas]))

    var col_scale = d3.scaleDiverging(d3.interpolatePuOr).domain([minchange, 0, maxchange])

    function witness_shift(from, to) {
      console.log(from + ">" + to)
      d3.select("#source-wrapper")
        .selectAll("div.app")
        .transition()
        .duration(1000)
        .style("background-color", d => col_scale(d[(from + "_" + to)]))
        .style("width", d => width_scale(d[from + "_nchar"]) + "px")

      d3.select("#target-wrapper")
        .selectAll("div.app")
        .transition()
        .duration(1000)
        .style("background-color", d => col_scale(d[(to + "_" + from)]))
        .style("width", d => width_scale(d[to + "_nchar"]) + "px")
      return
    };

    function source_input_click() {
      set_source_witness(this.getAttribute("id"))
      d3.selectAll("#source-witness button")
        .classed("active", false)
      this.classList.add("active")
      input_change(get_source_witness(), get_target_witness())
    }

    function target_input_click() {
      set_target_witness(this.getAttribute("id"))
      d3.selectAll("#target-witness button")
        .classed("active", false)
      this.classList.add("active")
      input_change(get_source_witness(), get_target_witness())
    }

    function input_change(from, to) {
      witness_shift(from, to)
      return
    }

    function app_hover(d) {
      var divs = d3.select(this)
        .classed("hovered", true)
        .append("div")
        .classed("tt", true)

      if (d3.select(this.parentNode).attr("id") == "target-wrapper") {
        divs.html(t => t[get_target_witness() + "_text"])
      }
      else {
        divs.html(t => t[get_source_witness() + "_text"])
      }
    }

    function app_nohover(d) {
      d3.select(this)
        .classed("hovered", false)
        .select("div.tt")
        .remove()
    }

    d3.selectAll("#source-witness button")
      .on("click", source_input_click);

    d3.selectAll("#target-witness button")
      .on("click", target_input_click);

    d3.select("#source-wrapper")
      .selectAll("div.app")
      .data(data)
      .enter()
      .append("div")
      .classed("app", true)
      .attr("app", d => d.app)
      .style("width", d => width_scale(d[get_source_witness() + "_nchar"]) + "px")

    d3.select("#target-wrapper")
      .selectAll("div.app")
      .data(data)
      .enter()
      .append("div")
      .classed("app", true)
      .attr("app", d => d.app)
      .style("width", d => width_scale(d[get_target_witness() + "_nchar"]) + "px")

    d3.selectAll("div.app")
      .on("mouseover", app_hover)
      .on("mouseout", app_nohover)

    input_change(get_source_witness(), get_target_witness())
  };

  d3.json("data.json", function (error, data) {
    if (error) {
      console.error(error)
    } else {
      draw_apps(data)
    }
  });

})();
