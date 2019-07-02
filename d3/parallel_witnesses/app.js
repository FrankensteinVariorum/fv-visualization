(function () {

  var witnesses = [
    "f1818", "f1823", "f1831", "fThomas"
  ]

  function draw_apps(data) {

    var length_scale = d3.scale.linear().domain([0, maxNchar]).range([0, 600])

    var maxadd = data.stats.addition.max
    var maxdel = data.stats.deletion.max
    var mincombo = data.stats.balance.min
    var maxcombo = data.stats.balance.max

    var add_scale = d3.scaleSequential(d3.interpolateOranges).domain([1, maxadd])
    var del_scale = d3.scaleSequential(d3.interpolatePurples).domain([1, maxdel])
    var mincombo = data.stats.balance.min
    var mag_scale = d3.scaleDiverging(d3.interpolatePuOr).domain([mincombo, 0, maxcombo])
    var agg_scale = d3.scale.linear().domain([0, 1]).range([0.2, 1])

    function diff_scale(type) {
      if (type == "additions") {
        return add_scale
      } else if (type == "deletions") {
        return del_scale
      } else if (type == "balance") {
        return mag_scale
      }
    }



    function app_hover(d) {
      d3.selectAll("div.app#" + d.seg)
        .classed("hovered", true)
      for (i = 0; i < witnesses.length; i++) {
        d3.select("p.text-display#" + witnesses[i]).text(d.seg + ": " + JSON.stringify(d[witnesses[i]].diffs[get_source_witness()].ops) + JSON.stringify(d[witnesses[i]].diffs[get_source_witness()].stats) + truncate_string(d[witnesses[i]].text.content, 20000))
      }
    }

    function app_nohover(d) {
      d3.selectAll("div.app#" + d.seg)
        .classed("hovered", false)
    };

    d3.selectAll("button.witness-button")
      .on("click", witness_button_click);

    d3.selectAll("button.diff-button")
      .on("click", diff_button_click);


    d3.select("svg#")
      .append("g")
      .attr("id", "variorumG")
      .attr("transform", "translate(50, 300)")
      .selectAll("g")
      .data(data.segs)
      .enter()
      .append("g")
      .attr("class", "app")
      .classed("hidden", d => d[witnesses[i]].text.nchar <= 0)
      .attr("id", d => d.seg)
      .style("width", d => width_scale(d[witnesses[i]].text.nchar) + "px")
  }

  d3.json("diffs.json", function (error, data) {
    if (error) {
      console.error(error)
    } else {
      draw_apps(data)
    }
  })

})();
