(function () {

  var witnesses = [
    "f1818", "f1823", "f1831", "fThomas"
  ]

  function draw_apps(data) {
    
    var segs_by_wit = d3.nest()
    .key(d => d.source_witness)
    .key(d => d.seg)
    .rollup(function(l) {
      return {
        "text": d3.max(l, d => d.source_text),
        "index": d3.max(l, d => d.source_index),
        "pos": d3.max(l, d => d.source_pos)
      }
    })
    .sortValues(function(a, b) { return a.pos - b.pos })
    .entries(data)
    console.log(JSON.stringify(segs_by_wit))

    var max_nchar = d3.max(data, d => d.source_text.length)
    var max_pos = d3.max(data, d => d.source_pos)
    var length_scale = d3.scale.linear().domain([0, max_pos]).range([2, 800])
    var collength_scale = d3.scaleSequential(d3.interpolatePlasma).domain([0, max_nchar])
    var wit_scale = d3.scaleBand().domain(witnesses).range([0, 900])
    var radius_scale = d3.scale.linear().domain([0, max_nchar]).range([0, 100])
    var pos_scale = d3.scaleSequential(d3.interpolatePlasma).domain([0, max_pos])

    d3.select("svg#pc")
      .append("g")
      .attr("id", "variorumG")
      // .attr("transform", "translate(50, 300)")
      .selectAll("g")
      .data(data)
      .enter()
      .append("rect")
      .filter(d => d.source_pos > 0)
      .attr("class", "seg")
      .attr("id", d => d.source_witness + d.seg)
      .attr("x", (d, i) => wit_scale(d.source_witness))
      .attr("y", (d, i) => length_scale(d.source_pos))
      .attr("height", d => radius_scale(d.source_text.length))
      .attr("width", 40)
      .style("fill", d => collength_scale(d.source_text.length))
      .style("stroke", )
  }

  d3.json("out.json", function (error, data) {
    if (error) {
      console.error(error)
    } else {
      draw_apps(data)
    }
  })

})();
