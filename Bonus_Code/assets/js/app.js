var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 90,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis="healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
      d3.max(data, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;
}

//function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([0,d3.max(data, d => d[chosenYAxis])])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating YAxis var upon click on axis label
function renderYAxis(newYscale,yAxis){
  var leftAxis=d3.axisLeft(newYscale);
  yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis,newYscale,chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy",d=>newYscale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup,chosenYAxis) {
  var labelx,labely;

  //for x-axis
  if (chosenXAxis === "poverty") {
    labelx = "Poverty:";
  }
  else if(chosenXAxis==="age"){
    labelx="Age :";
  }
  else{
    labelx="Household Income: $";
  }

  //for y-axis
  if(chosenYAxis==="healthcare"){
    labely="Lack healthcare :"
  }
  else if(chosenYAxis==="obesity"){
    labely="Obese :"
  }
  else{
    labely="smokes :"
  }

  //updating tool tip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -90])
    .html(function(d) {
      if(chosenXAxis==="poverty"){
        return (`State: ${d.state}<br>${labelx} ${d[chosenXAxis]}%<br>${labely} ${d[chosenYAxis]}%`);
      }
      else{
      return (`State: ${d.state}<br>${labelx} ${d[chosenXAxis]}<br>${labely} ${d[chosenYAxis]}%`);
      }
    });

  //calling it
  circlesGroup.call(toolTip);

  //for mouse over
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data,this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

//updting state abbreviations based on axis

function updateAbbr(chosenXAxis,newXScale,abbrGroup,newYscale,chosenYAxis){
  abbrGroup.transition()
  .duration(1000)
  .attr("dx",d=>newXScale(d[chosenXAxis])-10)
  .attr("dy",d=>newYscale(d[chosenYAxis])+15 / 2.5);

  return abbrGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(Data, err) {
  if (err) throw err;

  // parse data
  Data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age= +data.age;
    data.income = +data.income;
    data.obesity= +data.obesity;
    data.smokes= +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(Data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(Data,chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis=chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "#03fcca")
    .attr("opacity", ".5");

  // append text inside circle

  let abbrGroup=chartGroup.append("g").selectAll("text")
                .data(Data)
                .enter()
                .append("text")
                .text(function(d){
                  return d.abbr;
                })
                .attr("dx",function(d){
                  return xLinearScale(d[chosenXAxis])-10
                })
                .attr("dy",function(d){
                  return yLinearScale(d[chosenYAxis])+15 / 2.5;
                })
                .attr("font-size",15)

  // Create group for three x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var IncomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  // Create group for three y-axis labels
  
  var YlabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");
  var healthcarelabel=YlabelsGroup.append("text")
                    .attr("y", 50 - margin.left)
                    .attr("x", 0 - (height / 2))
                    .attr("dy", "1em")
                    .classed("axis-text", true)
                    .attr("value", "healthcare") // value to grab for event listener
                    .classed("active", true)
                    .text("Lacks Healthcare (%)");
  var Obesitylabel=YlabelsGroup.append("text")
                    .attr("y", 25 - margin.left)
                    .attr("x", 0 - (height / 2))
                    .attr("dy", "1em")
                    .classed("axis-text", true)
                    .attr("value", "obesity") // value to grab for event listener
                    .classed("inactive", true)
                    .text("Obesity (%)");
  var smokeslabel=YlabelsGroup.append("text")
                    .attr("y", 0 - margin.left)
                    .attr("x", 0 - (height / 2))
                    .attr("dy", "1em")
                    .classed("axis-text", true)
                    .attr("value", "smokes") // value to grab for event listener
                    .classed("inactive", true)
                    .text("Smokes (%)");
                    

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup,chosenYAxis);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis ) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(Data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);
        

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,yLinearScale,chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup,chosenYAxis);

        // updating state abbr

        abbrGroup=updateAbbr(chosenXAxis,xLinearScale,abbrGroup,yLinearScale,chosenYAxis)
        // changes classes to change bold text
        if (chosenXAxis === "income") {
          IncomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active",false)
            .classed("inactive", true)
        }
        else if(chosenXAxis==="age"){
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active",true)
            .classed("inactive", false)
        }
        else {
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active",false)
            .classed("inactive", true)
        }
      }

    });
    YlabelsGroup.selectAll("text")
        .on("click",function(){
          var value = d3.select(this).attr("value");
            if (value !== chosenYAxis ) {
      
              // replaces chosenYAxis with value
              chosenYAxis = value;
              // functions here found above csv import
              // updates y scale for new data
              yLinearScale = yScale(Data, chosenYAxis);
      
              // updates y axis with transition
              yAxis = renderYAxis(yLinearScale, yAxis);
              
              // updates circles with new x values
              circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,yLinearScale,chosenYAxis);
              // updates tooltips with new info
              circlesGroup = updateToolTip(chosenXAxis, circlesGroup,chosenYAxis);
              // updating state abbr

              abbrGroup=updateAbbr(chosenXAxis,xLinearScale,abbrGroup,yLinearScale,chosenYAxis)
      
              // changes classes to change bold text
              if (chosenYAxis === "smokes") {
                smokeslabel
                  .classed("active", true)
                  .classed("inactive", false);
                healthcarelabel
                  .classed("active", false)
                  .classed("inactive", true);
                Obesitylabel
                  .classed("active",false)
                  .classed("inactive", true)
              }
              else if(chosenYAxis==="obesity"){
                smokeslabel
                  .classed("active", false)
                  .classed("inactive", true);
                healthcarelabel
                  .classed("active", false)
                  .classed("inactive", true);
                Obesitylabel
                  .classed("active",true)
                  .classed("inactive", false)
              }
              else {
                smokeslabel
                  .classed("active", false)
                  .classed("inactive", true);
                healthcarelabel
                  .classed("active", true)
                  .classed("inactive", false);
                Obesitylabel
                  .classed("active",false)
                  .classed("inactive", true)
              }
            }
        });
}).catch(function(error) {
  console.log(error);
});