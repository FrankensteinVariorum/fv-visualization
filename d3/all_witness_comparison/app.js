(function () {

  var witnesses = [
    "fMS", "f1818", "f1823", "f1831", "fThomas"
  ]

  var source_witness = "fMS"

  function get_source_witness() {
    return source_witness
  };

  function set_source_witness(id) {
    source_witness = id
    return true
  };

  function draw_apps(data) {
    var maxNchar = data.nchars.max
    var width_scale = d3.scale.linear().domain([0, maxNchar]).range([0, 100])

    var minchange = data.range.min
    var maxchange = data.range.max

    var col_scale = d3.scaleDiverging(d3.interpolatePuOr).domain([minchange, 0, maxchange])

    // function witness_shift(new_source) {
    //   console.log(from + ">" + to)
    //   d3.select("#source-wrapper")
    //     .selectAll("div.app")
    //     .transition()
    //     .duration(1000)
    //     .style("background-color", d => col_scale(from + "_" + to)]))

    //   d3.select("#target-wrapper")
    //     .selectAll("div.app")
    //     .transition()
    //     .duration(1000)
    //     .style("background-color", d => col_scale(d[(to + "_" + from)]))
    //     .style("width", d => width_scale(d[to + "_nchar"]) + "px")
    //   return
    // };

    // function source_input_click() {
    //   set_source_witness(this.getAttribute("id"))
    //   d3.selectAll("#source-witness button")
    //     .classed("active", false)
    //   this.classList.add("active")
    //   input_change(get_source_witness(), get_target_witness())
    // }

    // function input_change(from, to) {
    //   witness_shift(from, to)
    //   return
    // }

    // function app_hover(d) {
    //   var divs = d3.select(this)
    //     .classed("hovered", true)
    //     .append("div")
    //     .classed("tt", true)

    //   if (d3.select(this.parentNode).attr("id") == "target-wrapper") {
    //     divs.html(t => t[get_target_witness() + "_text"])
    //   }
    //   else {
    //     divs.html(t => t[get_source_witness() + "_text"])
    //   }
    // }

    function app_nohover(d) {
      d3.select(this)
        .classed("hovered", false)
        .select("div.tt")
        .remove()
    };

    // d3.selectAll("#source-witness button")
    //   .on("click", source_input_click);

    // d3.selectAll("#target-witness button")
    //   .on("click", target_input_click);


    for (i = 0; i < witnesses.length; i++) {
      d3.select("#" + witnesses[i])
        .selectAll("div.app")
        .data(data.data)
        .enter()
        .append("div")
        .classed("app", true)
        .attr("app", d => d.app)
        .style("width", d => width_scale(d[witnesses[i]].text.nchar) + "px")
        .style("background-color", d => col_scale(d[witnesses[i]].additions[get_source_witness()]))
    }

      // d3.selectAll("div.app")
      //   .on("mouseover", app_hover)
      //   .on("mouseout", app_nohover)
    }


  d3.json("data.json", function (error, data) {
    if (error) {
      console.error(error)
    } else {
      draw_apps(data)
    }
  })

})();
