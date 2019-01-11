var S1_DEFAULTS = {"a": "7000"}
var S2_DEFAULTS = {"a": "5000", "b": "0.5", "c": "1"}
var CHART_LABELS = ["","First quartile, dependent","Second quartile, dependent","Third quartile, dependent","Fourth quartile, dependent","Independent students","High school diploma or less","Associate’s degree or some college","Bachelor’s degree","Master’s or higher","White students","Black or African American","Hispanic or Latino","Asian","Another race","Public 4-year","Private nonprofit 4-year","Public 2-year","Private for profit","Other","No benefits","Receiving some benefits"]
var BAR_HEIGHT = 50;

var THOUSANDS = d3.format("$,")
var PERCENT = d3.format(".0%")
var BILLIONS = function(val){
	var b = d3.format("$.3s")(val)
	return(b.replace(/G/," billion").replace(/M/, " million").replace(/k/, " thousand"))
}
var BIG_BILLIONS = function(val){
	var b = d3.format("$.4s")(val)
	return(b.replace(/G/," billion").replace(/M/, " million").replace(/k/, " thousand"))
}

var BASELINE_KEY = "s1_4000_percent_baseline"







function getScenario(){
	return (d3.select(".scenarioTab.s1").classed("active")) ? "s1" : "s2"
}

function getUnits(){
	var scenario = getScenario();
	return "percent"
}

function getInputs(scenario){
	var units = getUnits();

	if(scenario == "s1"){
		return {"a": d3.select(".slider.a.s1").node().value }
	}else{
		return {
			"a": d3.select(".slider.a.s2").node().value,
			"b": d3.select(".slider.b.s2").node().value,
			"c": d3.select(".slider.c.s2").node().value
		}
	}
}

function toKeyString(s){
	return s;
}

function getKey(scenario){
	var units = getUnits()
	var inputs = getInputs(scenario)

	if (scenario == "s1"){
		return scenario + "_" + toKeyString(inputs["a"]) + "_" + units
	}else{
		return scenario + "_" + toKeyString(inputs["a"]) + "_" + toKeyString(inputs["b"]) + "_" + toKeyString(inputs["c"]) + "_" + units
	}
}


function buildChart(allData, category, scenario){
	var chartContainer = d3.select(".barContainer." + category + "." + scenario + " .chart")

	var data = allData
		.filter(function(o){ return o.category == category })
		.reverse()

	data.forEach(function(d){
		d["label"] = CHART_LABELS[+d.subcategory]
	})

	var w = 300,
		h = data.length * (BAR_HEIGHT + 10) + 40;
	var svg = chartContainer.append("svg").attr("width", w).attr("height",h)

    var margin = {top: 20, right: 20, bottom: 30, left: 170},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;
  
  
	var x = d3.scaleLinear().range([0, width]);
	var y = d3.scaleBand().range([height, 0]);

	var g = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	x.domain([0, .85]);
	y.domain(data.map(function(d) { return d.label; })).padding(0.4);

	chartContainer.selectAll(".tickLabel")
		.data(data)
		.enter().append("div")
		.attr("class", "tickLabel chartLabel")
		.style("top", function(d){ return (y(d.label) + BAR_HEIGHT * .5) + "px" })
		.text(function(d){ return d.label })


	g.selectAll(".baselineBar")
	.data(data)
	.enter().append("rect")
	.attr("class", scenario + " " + "baselineBar")
	.attr("x", 0)
	.attr("height", BAR_HEIGHT*.75)
	.attr("y", function(d) { return y(d.label); })
	.attr("width", function(d) { return x(d[BASELINE_KEY]); })

	g.selectAll(".bar")
	.data(data)
	.enter().append("rect")
	.attr("class", scenario + " " + category + " " + "bar")
	.attr("x", 0)
	.attr("height", BAR_HEIGHT*.75)
	.attr("y", function(d) { return y(d.label); })
	.attr("width", function(d) { return x(d[getKey(scenario)]); })

	g.selectAll(".baselineLine")
	.data(data)
	.enter().append("line")
	.attr("class", scenario + " " + "baselineLine")
	.attr("x1", function(d) { return x(d[BASELINE_KEY]); })
	.attr("x2", function(d) { return x(d[BASELINE_KEY]); })
	.attr("y1", function(d) { return y(d.label); })
	.attr("y2", function(d) { return y(d.label) + BAR_HEIGHT*.75; })

	g.selectAll(".baselineDot")
	.data(data)
	.enter().append("circle")
	.attr("class", scenario + " " + "baselineDot")
	.attr("cx", function(d) { return x(d[BASELINE_KEY]); })
	.attr("cy", function(d) { return y(d.label) + BAR_HEIGHT*.75*.5; })
	.attr("r", 5)

}

function updateCostData(scenario){
	var oneYear = d3.select(".oneYear." + scenario).datum()
	var tenYear = d3.select(".tenYear." + scenario).datum()

	console.log(oneYear, tenYear)

	var key = getKey(scenario)

	var baseline1 = +oneYear[BASELINE_KEY] * 1000000000
	var baseline10 = +tenYear[BASELINE_KEY] * 1000000000
	var val1 = +oneYear[key] * 1000000000
	var val10 = +tenYear[key] * 1000000000

	console.log(key, val1, oneYear)

	d3.select(".oneYear." + scenario + " .costVal").text(BILLIONS(val1))
	d3.select(".tenYear." + scenario + " .costVal").text(BIG_BILLIONS(val10))

	d3.select(".oneYear." + scenario + " .baselineText").text(function(){
		var diff = val1 - baseline1
		if(diff > 0){
			return BILLIONS(Math.abs(diff)) + " above current cost"
		}
		else if(diff < 0){
			return BILLIONS(Math.abs(diff)) + " below current cost"
		}
		else{
			return "Equal to current cost"
		}
	})

	d3.select(".tenYear." + scenario + " .baselineText").text(function(){
		var diff = val10 - baseline10
		if(diff > 0){
			return BIG_BILLIONS(Math.abs(diff)) + " above current cost"
		}
		else if(diff < 0){
			return BIG_BILLIONS(Math.abs(diff)) + " below current cost"
		}
		else{
			return "Equal to current cost"
		}
	})
	

}

function buildCostData(allData, scenario){
	var data = allData
		.filter(function(o){ return o.category == "cost" })

	var oneYear = data.filter(function(o){ return o.subcategory == "1yr" })[0]
	var tenYear = data.filter(function(o){ return o.subcategory == "10yr" })[0]

	d3.select(".oneYear." + scenario).datum(oneYear)
	d3.select(".tenYear." + scenario).datum(tenYear)

	updateCostData(scenario)
}

function buildAverageData(data, scenario){

}

function updateCharts(scenario){
	var unit = getUnits();
	var key = getKey(scenario);

	var w = 300

    var margin = {top: 20, right: 20, bottom: 30, left: 180},
    width = w - margin.left - margin.right


	var x = d3.scaleLinear().range([0, width]);
	x.domain([0, .85]);

	d3.selectAll(".bar." + scenario)
	.transition()
	.attr("width", function(d) {
		return x(d[key]);
	})

	//update baseline, since units might change too

}

function updateInputs(scenario){
	if(scenario == "s1"){
		d3.select(".sliderLabel.a.s1").text(THOUSANDS(d3.select("input.s1.a").node().value))
	}else{
		d3.select(".sliderLabel.a.s2").text(THOUSANDS(d3.select("input.s2.a").node().value))
		d3.select(".sliderLabel.b.s2").text(PERCENT(d3.select("input.s2.b").node().value))
		d3.select(".sliderLabel.c.s2").text(PERCENT(d3.select("input.s2.c").node().value))
	}
}

function checkInputs(){
	if(d3.select("input.s2.b").node().value > d3.select("input.s2.c").node().value){
		d3.select("input.s2.b").node().value = d3.select("input.s2.c").node().value
	}
}


function updateAverageData(){

}

function updateScenario(scenario){

}

function showScenario(scenario){
	var show = d3.select("#" + scenario + "Container")
	var other = (scenario == "s1") ? "s2" : "s1"
	var hide = d3.select("#" + other + "Container");

	show
		.transition()
		.duration(1000)
		.style("opacity",1)
		.on("end", function(){
			show.classed("hidden", false)
		})
	hide
		.transition()
		.duration(1000)
		.style("opacity",0)
		.on("end", function(){
			hide.classed("hidden", true)
		})

	d3.select(".scenarioTab." + scenario).classed("active", true)
	d3.select(".scenarioTab." + other).classed("active", false)
}

function init(data){
	buildChart(data, "income", "s1")
	buildChart(data, "parentsEd", "s1")
	buildChart(data, "race", "s1")
	buildChart(data, "instType", "s1")
	buildChart(data, "benefits", "s1")

	buildChart(data, "income", "s2")
	buildChart(data, "parentsEd", "s2")
	buildChart(data, "race", "s2")
	buildChart(data, "instType", "s2")
	buildChart(data, "benefits", "s2")

	buildCostData(data, "s1")
	buildCostData(data, "s2")

	buildAverageData(data, "s1")
	// buildAverageData("s2")

	updateInputs("s1");
	updateInputs("s2");


}

d3.select(".scenarioTab.s1").on("click", function(){
	showScenario("s1")
})
d3.select(".scenarioTab.s2").on("click", function(){
	showScenario("s2")
})

d3.selectAll(".slider.s1").on("input", function(){
	updateCharts("s1");
	updateInputs("s1");
	updateCostData("s1")
})
d3.selectAll(".slider.s2").on("input", function(){
	checkInputs()
	updateCharts("s2");
	updateInputs("s2");
	updateCostData("s2")
})



d3.csv("data/data.csv", function(data){
	init(data)
})