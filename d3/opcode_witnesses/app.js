(function () {

  var witnesses = [
    "f1818", "f1823", "f1831", "fThomas"
  ]

  var source_witness = "f1818"
  var diff_type = "magnitude"

  function get_source_witness() {
    return source_witness
  };

  function set_source_witness(id) {
    source_witness = id
    return true
  };

  function get_diff_type() {
    return diff_type
  }

  function set_diff_type(type) {
    diff_type = type
    return true
  }

  function draw_apps(data) {
    var maxNchar = data.stats.nchar.max
    var width_scale = d3.scale.linear().domain([0, maxNchar]).range([0, 300])

    var maxadd = data.stats.addition.max
    var maxdel = data.stats.deletion.max
    var mincombo = data.stats.magnitude.min
    var maxcombo = data.stats.magnitude.max

    var add_scale = d3.scale.log().domain([1, maxadd]).range(["white", "purple"])
    var del_scale = d3.scale.log().domain([1, maxdel]).range(["white", "orange"])
    var mincombo = data.stats.magnitude.min
    var mag_scale = d3.scaleDiverging(d3.interpolatePuOr).domain([mincombo, 0, maxcombo])

    function diff_scale(type) {
      if (type == "additions") {
        return add_scale
      } else if (type == "deletions") {
        return del_scale
      } else if (type == "magnitude") {
        return mag_scale
      }
    }

    function witness_shift(base_witness, reference_witness, difftype) {
      d3.select(".wrapper#" + base_witness)
        .selectAll("div.app")
        .transition()
        .duration(500)
        .style("background-color", d => diff_scale(difftype)(d[base_witness].diffs[reference_witness].stats[difftype]))
    }

    function witness_button_click() {
      set_source_witness(this.getAttribute("id"))
      d3.selectAll("button.witness-button")
        .classed("active", false)
      this.classList.add("active")
      for (i = 0; i < witnesses.length; i++) {
        witness_shift(witnesses[i], get_source_witness(), get_diff_type())
      }
    }

    function diff_button_click() {
      set_diff_type(this.getAttribute("id"))
      d3.selectAll("button.diff-button")
        .classed("active", false)
      this.classList.add("active")
      for (i = 0; i < witnesses.length; i++) {
        witness_shift(witnesses[i], get_source_witness(), get_diff_type())
      }
    }

    function truncate_string(s, max) {
      if (s == null) {
        return ""
      }
      if (s.length > max) {
        return s.substring(0, max) + "..."
      } else {
        return s
      }
    }

    function app_hover(d) {
      d3.selectAll("div.app#" + d.seg)
        .classed("hovered", true)
      for (i = 0; i < witnesses.length; i++) {
        d3.select("p.text-display#" + witnesses[i]).text(d.seg + ": " + truncate_string(d[witnesses[i]].text.content, 20000))
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

    for (i = 0; i < witnesses.length; i++) {
      d3.select(".wrapper#" + witnesses[i])
        .selectAll("div.app")
        .data(data.segs)
        .enter()
        .append("div")
        .classed("app", true)
        .attr("id", d => d.seg)
        .style("width", d => width_scale(d[witnesses[i]].text.nchar) + "px");

      witness_shift(witnesses[i], get_source_witness(), get_diff_type());
    }

    d3.selectAll("div.app")
      .on("mouseover", app_hover)
      .on("mouseout", app_nohover)
  }

  d3.json("diffs.json", function (error, data) {
    if (error) {
      console.error(error)
    } else {
      draw_apps(data)
    }
  })

})();
