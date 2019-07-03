(function () {

  var witnesses = [
    "f1818", "f1823", "f1831", "fThomas"
  ]

  function draw_apps(data) {

    var segs_by_wit = d3.nest()
      .key(d => d.source_witness)
      .key(d => d.seg)
      .rollup(function (l) {
        return {
          "text": d3.max(l, d => d.source_text),
          "index": d3.max(l, d => d.source_index),
          "pos": d3.max(l, d => d.source_pos)
        }
      })
      .sortValues(function (a, b) { return a.pos - b.pos })
      .entries(data)

    function seq_wit_filter(d) {
      return (d.source_witness == "f1818" && d.target_witness == "f1823") || (d.source_witness == "f1823" && d.target_witness == "f1831") || (d.source_witness == "f1831" && d.target_witness == "fThomas")
    }

    var max_nchar = d3.max(data, d => d.source_text.length)
    var max_pos = d3.max(data, d => d.source_pos)
    var min_balance = d3.min(data, d => d.diff_stats.balance)
    var max_balance = d3.max(data, d => d.diff_stats.balance)
    console.log(min_balance)
    console.log(max_balance)

    var length_scale = d3.scaleLinear().domain([0, max_pos]).range([2, 850])
    var wit_scale = d3.scalePoint().domain(witnesses).range([0, 1200])
    var change_scale = d3.scaleDiverging(d3.interpolatePuOr).domain([min_balance, 0, max_balance])
    var width_scale = d3.scaleLinear().domain([min_balance, max_balance]).range([0.5, 4])
    var opacity_scale = d3.scaleLinear().domain([min_balance, max_balance]).range([0.1, 0.8])

    var wit_axis = d3.axisBottom(wit_scale)
    var word_axis = d3.axisLeft(length_scale)

    d3.select("svg#pc")
      .attr("width", 1440)
      .attr("height", 900)
      .append("g")
      .attr("id", "var_x")
      .attr("transform", "translate(60, 880)")
      .call(wit_axis)

    d3.select("svg#pc")
      .append("g")
      .attr("id", "var_y")
      .attr("transform", "translate(40, 10)")
      .call(word_axis)

    d3.select("svg#pc")
      .append("g")
      .attr("id", "var_content")
      .attr("transform", "translate(60, 10)")
      .selectAll("line")
      .data(data)
      .enter()
      .append("line")
      .filter(d => d.target_text.length > 0 && d.source_text.length > 0)
      .filter(d => seq_wit_filter(d))
      .attr("class", d => "seg_comparison " + d.seg)
      .attr("id", d => d.seg + "-" + d.source_witness + "-" + d.target_witness)
      .attr("x1", d => wit_scale(d.source_witness))
      .attr("x2", d => wit_scale(d.target_witness))
      .attr("y1", d => length_scale(d.source_pos))
      .attr("y2", d => length_scale(d.target_pos))
      .attr("stroke", d => change_scale(d.diff_stats.balance))
      .style("opacity", d => opacity_scale(Math.abs(d.diff_stats.balance)))
      .style("stroke-width", d => width_scale(Math.abs(d.diff_stats.balance)))

    function line_hover(d) {
      d3.selectAll("line." + d.seg)
        .style("stroke-width", "10px")
        .style("opacity", 1)
    }

    function line_no_hover(d) {
      d3.selectAll("line." + d.seg)
        .style("opacity", d => Math.abs(d.diff_stats.balance))
        .style("stroke-width", d => width_scale(Math.abs(d.diff_stats.balance)))
    }

    d3.selectAll("line.seg_comparison")
      .on("mouseover", line_hover)
      .on("mouseout", line_no_hover)
  }



  d3.json("out.json", function (error, data) {
    if (error) {
      console.error(error)
    } else {
      draw_apps(data)
    }
  })

})();
