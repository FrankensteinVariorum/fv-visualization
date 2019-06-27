(function () {

  var witnesses = [
    "f1818", "f1823", "f1831", "fThomas"
  ]

  var source_witness = "f1818"
  var diff_type = "additions"

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
    var width_scale = d3.scale.linear().domain([0, maxNchar]).range([0, 200])

    var maxadd = data.stats.addition.max
    var maxdel = data.stats.deletion.max

    var add_scale = d3.scale.log().domain([1, maxadd]).range("white", "purple")
    var delscale = d3.scale.log().domain([1, maxdel]).range("white", "orange")

    function witness_shift(base_witness, reference_witness, difftype) {
      d3.select(".wrapper#" + base_witness)
        .selectAll("div.app")
        .transition()
        .duration(1000)
        .style("background-color", d => col_scale(d[base_witness][difftype][reference_witness]))
    };

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
        d3.select("p.text-display#" + witnesses[i]).text(truncate_string(d[witnesses[i]].text.content, 100))
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

      // witness_shift(witnesses[i], get_source_witness(), get_diff_type());
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
