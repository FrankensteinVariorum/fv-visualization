(function () {

  d3.json("data.json", function (error, data) {
    if (error) {
      console.error(error)
    } else {
      draw_apps(data)
    }
  });

  function typeset(x, y, length, limit, height) {
    var startlength = limit - x;
    var remlength = length - startlength;
    var nbars = parseInt(remlength / limit);
    var extra = remlength % limit;
  };

  function highlight(e) {

  };

  function draw_apps(data) {
    var maxNchar = d3.max(data, d => d3.max([d.fMS, d.f1818, d.f1823, d.f1831, d.fThomas]))
    var width_scale = d3.scale.linear().domain([0, maxNchar]).range([0.1, 800]);

    var minchange = d3.min(data, d => d.fMS - d.fThomas)
    var maxchange = d3.max(data, d => d.fThomas - d.fMS)

    var col_scale = d3.scale.linear().domain([minchange, 0, maxchange]).range(["red", "gray", "green"]);

    d3.select("svg")
      .selectAll("div.app")
      .data(data)
      .enter()
      .append("rect")
      .classed("app", true)
      .attr("transform", (d, i) => "translate(10," + (i * 12) + ")")
      .attr("height", 10)
      .attr("width", 7)
      .attr("app", d => d.app)
      .attr("witness", d => d.witness)
      .transition()
      .duration(2000)
      .delay(2000)
      .attr("width", d => width_scale(d.f1818))
      .style("fill", d => col_scale(d.f1818))
      .transition()
      .duration(2000)
      .delay(6000)
      .attr("width", d => width_scale(d.f1831))
      .style("fill", d => col_scale(d.f1818 - d.f1831))

    d3.selectAll("rect.app")
      .on("mouseover", e => d3.selectAll("rect.app").classed("active", p => p.app === e.app ? true : false));
  }


})();
