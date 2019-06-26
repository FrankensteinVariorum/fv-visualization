(function () {

  var witnesses = [
    "fMS", "f1818", "f1823", "f1831", "fThomas"
  ]

  var source_witness = "fMS"
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
    var maxNchar = data.nchars.max
    var width_scale = d3.scale.linear().domain([0, maxNchar]).range([0, 100])

    var minchange = data.range.min
    var maxchange = data.range.max

    var col_scale = d3.scale.linear().domain([minchange, maxchange]).range(["white", "red"])

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

    function app_hover(d) {
      var divs = d3.select(this)
        .classed("hovered", true)
        .append("div")
        .classed("tt", true)

      divs.html(t => t[d3.select(this.parentNode).attr("id")].text.content)
    }

    function app_nohover(d) {
      d3.select(this)
        .classed("hovered", false)
        .select("div.tt")
        .remove()
    };

    d3.selectAll("button.witness-button")
      .on("click", witness_button_click);

    d3.selectAll("button.diff-button")
      .on("click", diff_button_click);

    for (i = 0; i < witnesses.length; i++) {
      d3.select(".wrapper#" + witnesses[i])
        .selectAll("div.app")
        .data(data.data)
        .enter()
        .append("div")
        .classed("app", true)
        .attr("app", d => d.app)
        .style("width", d => width_scale(d[witnesses[i]].text.nchar) + "px");

      witness_shift(witnesses[i], get_source_witness(), get_diff_type());
    }

    d3.selectAll("div.app")
      .on("mouseover", app_hover)
      .on("mouseout", app_nohover)
  }

  d3.json("data.json", function (error, data) {
    if (error) {
      console.error(error)
    } else {
      draw_apps(data)
    }
  })

})();
