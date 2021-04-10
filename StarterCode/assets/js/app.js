// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then(function(data_csv) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    data_csv.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data_csv,d=>d.poverty)*0.9, d3.max(data_csv, d => d.poverty)*1.1])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data_csv, d => d.healthcare)])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(data_csv)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "15")
    .attr("fill", "#03fcca")
    .attr("opacity", ".5");

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -90])
      .html(function(d) {
        return (`State: ${d.state}<br>Poverty: ${d.poverty}<br>Lack Healthcare: ${d.healthcare}`);
      });

    // Step 7: Adding the abbreviation of the state
    // ============================================
   
    textGroup=chartGroup.append("g")
    textGroup.selectAll("text")
            .data(data_csv)
            .enter()
            .append("text")
            .text(function(d){
                return d.abbr;
            })
            .attr("dx",function(d){
                return xLinearScale(d.poverty)-10;
            })
            .attr("dy",function(d){
                return yLinearScale(d.healthcare)+15/2.5;
            })
            .attr("font-size",15)
            .call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lack Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");
  }).catch(function(error) {
    console.log(error);
  });