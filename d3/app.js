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
    var maxNchar = d3.max(data, d => d3.max([d.fMS_nchar, d.f1818_nchar, d.f1823_nchar, d.f1831_nchar, d.fThomas_nchar]))
    var width_scale = d3.scale.linear().domain([0, maxNchar]).range([0, 600]);

    var minchange = d3.min(data, d => d3.min([d.f1818_f1818, d.f1818_f1823, d.f1818_f1831, d.f1818_fMS, d.f1818_fThomas, d.f1823_f1818, d.f1823_f1823, d.f1823_f1831, d.f1823_fMS, d.f1823_fThomas, d.f1831_f1818, d.f1831_f1823, d.f1831_f1831, d.f1831_fMS, d.f1831_fThomas, d.fMS_f1818, d.fMS_f1823, d.fMS_f1831, d.fMS_fMS, d.fMS_fThomas, d.fThomas_f1818, d.fThomas_f1823, d.fThomas_f1831, d.fThomas_fMS, d.fThomas_fThomas]))
    var maxchange = d3.max(data, d => d3.max([d.f1818_f1818, d.f1818_f1823, d.f1818_f1831, d.f1818_fMS, d.f1818_fThomas, d.f1823_f1818, d.f1823_f1823, d.f1823_f1831, d.f1823_fMS, d.f1823_fThomas, d.f1831_f1818, d.f1831_f1823, d.f1831_f1831, d.f1831_fMS, d.f1831_fThomas, d.fMS_f1818, d.fMS_f1823, d.fMS_f1831, d.fMS_fMS, d.fMS_fThomas, d.fThomas_f1818, d.fThomas_f1823, d.fThomas_f1831, d.fThomas_fMS, d.fThomas_fThomas]))

    var col_scale = d3.scale.linear().domain([minchange, 0, maxchange]).range(["green", "lightgray", "red"]);

    d3.select("#wrapper")
      .selectAll("div.app")
      .data(data)
      .enter()
      .append("div")
      .classed("app", true)
      .attr("app", d => d.app)
      .transition()
      .duration(2000)
      .delay(2000)
      .style("width", d => width_scale(d.fMS_nchar) + "px")
      .transition()
      .duration(2000)
      .delay(6000)
      .style("width", d => width_scale(d.f1818_nchar) + "px")
      .style("background-color", d => col_scale(d.fMS_f1818))
      .transition()
      .duration(2000)
      .delay(10000)
      .style("width", d => width_scale(d.f1823_nchar) + "px")
      .style("background-color", d => col_scale(d.f1818_f1823)).transition()
      .duration(2000)
      .delay(14000)
      .style("width", d => width_scale(d.f1831_nchar) + "px")
      .style("background-color", d => col_scale(d.f1823_f1831))
      .transition()
      .duration(2000)
      .delay(18000)
      .style("width", d => width_scale(d.fThomas_nchar) + "px")
      .style("background-color", d => col_scale(d.f1831_fThomas))
  }


})();
