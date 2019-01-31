var S1_DEFAULTS = {"a": "7000"}
var S2_DEFAULTS = {"a": "5000", "b": "0.5", "c": "1"}
var CHART_LABELS = ["","First quartile, dependent","Second quartile, dependent","Third quartile, dependent","Fourth quartile, dependent","Independent students","High school diploma or less","Associate&rsquo;s degree or some college","Bachelor&rsquo;s degree","Master&rsquo;s degree or higher","White","Black/African American","Hispanic/Latino","Asian","Another race","Public 4-year","Private nonprofit 4-year","Public 2-year","Private for profit","Other","No","Yes","Without children","With children"]
var BAR_HEIGHT = 60,
	BAR_RATIO = .65;

var THOUSANDS = d3.format("$,.0f")
var PERCENT = d3.format(".0%")

var PERCENT_FINE = d3.format(".1%")

var BILLIONS = function(val){
	var b = d3.format("$.3s")(val)
	return(b.replace(/G/," billion").replace(/M/, " million").replace(/k/, " thousand"))
}
var BIG_BILLIONS = function(val){
	var b = d3.format("$.4s")(val)
	return(b.replace(/G/," billion").replace(/M/, " million").replace(/k/, " thousand"))
}

var PRINT = false;
var isIE = false;

function IS_1200(){
  if(PRINT){ return false }
  else { return d3.select("#breakpoint1200").style("display") == "block"; }
}
function IS_1000(){
  if(PRINT){ return false }
  else { return d3.select("#breakpoint1000").style("display") == "block"; }
}
function IS_MOBILE(){
  if(PRINT){ return false }
  else { return d3.select("#isMobile").style("display") == "block"; }
}
function IS_PHONE(){
  if(PRINT){ return false }
  else { return d3.select("#isPhone").style("display") == "block"; }
}
function IS_SMALL_PHONE(){
  if(PRINT){ return false }
  else { return d3.select("#isSmallPhone").style("display") == "block"; }
}
function IS_VERY_SMALL_PHONE(){
  if(PRINT){ return false }
  else { return d3.select("#isVerySmallPhone").style("display") == "block"; }
}




var BASELINE_KEY_PERCENT = "s1_4000_percent_baseline"
var BASELINE_KEY_DOLLARS = "s1_4000_dollars_baseline"


function getQueryString(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};




function getScenario(){
	return (d3.select(".scenarioTab.s1").classed("active")) ? "s1" : "s2"
}

function getUnits(scenario){
	return (d3.select("#percent-" +  scenario).node().checked) ? "percent" : "dollars"
	// return "percent"
}

function getInputs(scenario){
	var units = getUnits(scenario);

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
	if (+s < 10){
		return d3.format(".1f")(s)
	}else{
		return s;
	}
}

function getKey(scenario){
	var units = getUnits(scenario)
	var inputs = getInputs(scenario)

	if (PRINT){
		if (scenario == "s1"){
			return scenario + "_" + toKeyString(inputs["a"]) + "_" + units
		}else{
			return scenario + "_" + toKeyString(inputs["a"]) + "_" + toKeyString(inputs["b"]) + "_" + toKeyString(inputs["c"]) + "_" + units
		}

	}else{
		if (scenario == "s1"){
			return scenario + "_" + toKeyString(inputs["a"]) + "_" + units
		}else{
			return scenario + "_" + toKeyString(inputs["a"]) + "_" + toKeyString(inputs["b"]) + "_" + toKeyString(inputs["c"]) + "_" + units
		}
	}
}

function getChartWidth(){
	if(IS_MOBILE()){
		console.log("foo")
		return (d3.select(".chartContainer").node().getBoundingClientRect().width + 50);
	}
	else if(IS_1000()){
		return (d3.select(".chartContainer").node().getBoundingClientRect().width * .5 + 20);
	}
	else if(IS_1200()){
		return 650;
	}
	else{
		return 400
	}
}

function buildChart(allData, category, scenario){
	var chartContainer = d3.select(".barContainer." + category + "." + scenario + " .chart")

	var data = allData
		.filter(function(o){ return o.category == category })
		.reverse()

	if(category == "benefits" || category == "indep"){
		data = data.reverse()
	}

	data.forEach(function(d){
		d["label"] = CHART_LABELS[+d.subcategory]
	})

 	var w = getChartWidth();

	var h = data.length * (BAR_HEIGHT + 10) + 40;
	var svg = chartContainer.append("svg").attr("width", w).attr("height",h)

	var mL = (PRINT) ? 110 : 155;

    var margin = {top: 20, right: 120, bottom: 30, left: mL},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;
  
  
	var x = d3.scaleLinear().range([0, width]);
	var y = d3.scaleBand().range([height, 0]);

	var g = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	x.domain([0, .85]);
	y.domain(data.map(function(d) { return d.label; }));

	chartContainer.selectAll(".tickLabel")
		.data(data)
		.enter().append("div")
		.attr("class", "tickLabel chartLabel")
		.style("top", function(d){ return (y(d.label) + BAR_HEIGHT * .4) + "px" })
		.html(function(d){ return d.label })


	g.selectAll(".baselineBar")
		.data(data)
		.enter().append("rect")
			.attr("class", scenario + " " + "baselineBar")
			.attr("x", 0)
			.attr("height", BAR_HEIGHT*BAR_RATIO)
			.attr("y", function(d) { return y(d.label); })
			.attr("width", function(d) { return x(d[BASELINE_KEY_PERCENT]); })

	g.selectAll(".bar")
		.data(data)
		.enter().append("rect")
			.attr("class", scenario + " " + category + " " + "bar")
			.attr("x", 0)
			.attr("height", BAR_HEIGHT*BAR_RATIO)
			.attr("y", function(d) { return y(d.label); })
			.attr("width", function(d) { return x(d[getKey(scenario)]); })

	g.selectAll(".baselineLine")
		.data(data)
		.enter().append("line")
			.attr("class", scenario + " " + "baselineLine")
			.attr("x1", function(d) { return x(d[BASELINE_KEY_PERCENT]); })
			.attr("x2", function(d) { return x(d[BASELINE_KEY_PERCENT]); })
			.attr("y1", function(d) { return y(d.label); })
			.attr("y2", function(d) { return y(d.label) + BAR_HEIGHT*BAR_RATIO; })

	g.selectAll(".baselineDot")
		.data(data)
		.enter().append("circle")
			.attr("class", scenario + " " + "baselineDot")
			.attr("cx", function(d) { return x(d[BASELINE_KEY_PERCENT]); })
			.attr("cy", function(d) { return y(d.label) + BAR_HEIGHT*BAR_RATIO*.5; })
			.attr("r", 5)

	g.selectAll(".baseLineLabel")
		.data(data)
		.enter().append("text")
			.attr("class", scenario + " " + "baseLineLabel")
			.attr("x", function(d) { return x(d[BASELINE_KEY_PERCENT]) - xScootch(d[BASELINE_KEY_PERCENT], "percent"); })
			.attr("y", function(d) { return y(d.label) + BAR_HEIGHT*BAR_RATIO*.5 - 25; })
			.text(function(d){ return PERCENT_FINE(d[BASELINE_KEY_PERCENT]) })

	g.selectAll(".barLabel")
		.data(data)
		.enter().append("text")
			.attr("class", scenario + " " + "barLabel")
			.attr("x", function(d) { return x(d[getKey(scenario)]) + 10; })
			.attr("y", function(d) { return y(d.label) + BAR_HEIGHT*BAR_RATIO*.5 + 4.5; })
			.text(function(d){ return PERCENT_FINE(d[getKey(scenario)]) })

}

function xScootch(val, unit){
	if(unit == "percent"){
		if (val < .1){
			return 8
		}else{
			return 15
		}
	}else{
		if (val < 10){
			return 11
		}
		else if( val < 999){
			return 18
		}else{
			return 25
		}
	}

}

function updateCostData(scenario){
	var oneYear = d3.select(".oneYear." + scenario).datum()
	var tenYear = d3.select(".tenYear." + scenario).datum()

	var key = getKey(scenario)
	var units = getUnits(scenario)

	var baseline1 = +oneYear[BASELINE_KEY_PERCENT] * 1000000000
	var baseline10 = +tenYear[BASELINE_KEY_PERCENT] * 1000000000
	var val1 = +oneYear[key] * 1000000000
	var val10 = +tenYear[key] * 1000000000

	d3.select(".oneYear." + scenario + " .costVal").text(BILLIONS(val1))
	d3.select(".tenYear." + scenario + " .costVal").text(BIG_BILLIONS(val10))

	d3.select(".oneYear." + scenario + " .baselineText").text(function(){
		var diff = val1 - baseline1
		var sign = (diff < 0) ? "-" : "+"
		if(diff > 0){
			return sign + BILLIONS(Math.abs(diff)) + " from current policy"
		}
		else if(diff < 0){
			return sign + BILLIONS(Math.abs(diff)) + " from current policy"
		}
		else{
			return "Equal to current cost"
		}
	})

	d3.select(".tenYear." + scenario + " .baselineText").text(function(){
		var diff = val10 - baseline10
		var sign = (diff < 0) ? "-" : "+"
		if(diff > 0){
			return sign + BIG_BILLIONS(Math.abs(diff)) + " from current policy"
		}
		else if(diff < 0){
			return sign + BIG_BILLIONS(Math.abs(diff)) + " from current policy"
		}
		else{
			return "Equal to current policy"
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

function updateAverageData(scenario){
	var unit = getUnits(scenario)
	var key = getKey(scenario)
	var formatter = (unit == "percent") ? PERCENT_FINE : THOUSANDS;

	d3.select(".avg." + scenario).text(function(d){
		console.log(d)
		return formatter(d[key])
	})
}

function buildAverageData(allData, scenario){
	var datum = allData
		.filter(function(o){ return o.category == "avg" })

	d3.select(".avg." + scenario).data(datum)

	updateAverageData(scenario)
}

function buildScenarioMenu(){
	     $("#scenarioMenu" ).selectmenu({
      change: function(event, d){
      	showScenario(d.item.value)
      }
    })
}

function updateCharts(scenario){
	var unit = getUnits(scenario);
	var formatter = (unit == "percent") ? PERCENT_FINE : THOUSANDS;
	var baseline_key = (unit == "percent") ? BASELINE_KEY_PERCENT : BASELINE_KEY_DOLLARS;
	var key = getKey(scenario);

	var w = getChartWidth();

    var margin = {top: 20, right: 120, bottom: 30, left: 155},
    width = w - margin.left - margin.right


    var domain = (unit == "percent") ? [0, .85] : [0, 6300]

	var x = d3.scaleLinear().range([0, width]);
	x.domain(domain);

	d3.selectAll(".bar." + scenario)
	.transition()
	.attr("width", function(d) {
		return x(d[key]);
	})

	d3.selectAll(".barLabel." + scenario)
		.text(function(d){ return formatter(d[key]) })
		.transition()
			.attr("x", function(d) { return x(d[key]) + 10; })

	d3.selectAll(".baselineBar." + scenario)
	.transition()
	.attr("width", function(d) {
		return x(d[baseline_key]);
	})


	d3.selectAll(".baselineLine." + scenario)
	.transition()
	.attr("x1", function(d) { return x(d[baseline_key]); })
	.attr("x2", function(d) { return x(d[baseline_key]); })


	d3.selectAll(".baselineDot." + scenario)
	.transition()
	.attr("cx", function(d) { return x(d[baseline_key]); })

	d3.selectAll(".baseLineLabel." +  scenario)
		.text(function(d){ return formatter(d[baseline_key])} )
		.transition()
			.attr("x", function(d) { return x(d[baseline_key]) - xScootch(d[baseline_key], unit); })
			


}

function getInputSelector(obj){
	var a = (d3.select(obj).classed("a")) ? ".a" : ""
	var b = (d3.select(obj).classed("b")) ? ".b" : ""
	var c = (d3.select(obj).classed("c")) ? ".c" : ""
	var s1 = (d3.select(obj).classed("s1")) ? ".s1" : ""
	var s2 = (d3.select(obj).classed("s2")) ? ".s2" : ""

	return "input" + a + b + c + s1 + s2
}
function getFormatter(obj){
	var a = (d3.select(obj).classed("a")) ? ".a" : ""
	var formatter = (a == ".a") ? THOUSANDS : PERCENT;
	return formatter

}

function updateInputs(scenario){
	d3.selectAll(".sliderMin").text(function(){
		var formatter = getFormatter(this)	
		return formatter(d3.select(getInputSelector(this)).attr("min"))
	})

	d3.selectAll(".sliderMax").text(function(){
		var formatter = getFormatter(this)
		return formatter(d3.select(getInputSelector(this)).attr("max"))
	})

	d3.selectAll(".sliderValue").text(function(){
		var formatter = getFormatter(this)
		return formatter(d3.select(getInputSelector(this)).node().value)
	})
	.style("left", function(){
		var scootch = ((d3.select(d3.select(this).node().parentNode).select(".sliderValue").node().getBoundingClientRect().width) * .5),
			val = d3.select(getInputSelector(this)).node().value,
			min = d3.select(getInputSelector(this)).attr("min"),
			max = d3.select(getInputSelector(this)).attr("max"),
			width = d3.select(getInputSelector(this)).node().getBoundingClientRect().width - 14


		// console.log(d3.select(d3.select(this).node().parentNode).select(".sliderValue"))
		scootch -= 4;
		if(d3.select(this).classed("a") == false){ scootch -= 8}

		return (width * ((val - min)/ (max - min)) - scootch) + "px"

	})


	if(scenario == "s2"){
		var phaseEndsVal = d3.select(".slider.c.s2").node().value
		var phaseBegins = d3.select(".slider.b.s2")

		var val = (phaseEndsVal - phaseBegins.attr("min") ) / (phaseBegins.attr('max') - phaseBegins.attr('min'))

		if(val >= 1){
			phaseBegins.attr("id","fullTrack")

		}else{
			//for phase out vals of:
			//200 -> .8
			//150 -> .6
			//100 -> .4

			phaseBegins.attr("id", d3.format(".2f")(val).replace("0.","pt"))
		}

	}
}

function checkInputs(){
	if(d3.select("input.s2.b").node().value > d3.select("input.s2.c").node().value){
		d3.select("input.s2.b").node().value = d3.select("input.s2.c").node().value
	}
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

	$("#scenarioMenu").val(scenario).selectmenu("refresh")

	d3.select(".scenarioTab." + scenario).classed("active", true)
	d3.select(".scenarioTab." + other).classed("active", false)
	d3.select("#scenarioTabs").attr("class", scenario)
}


function openPrintView(){
	var s1 = getInputs("s1"),
		s2 = getInputs("s2"),
		a1 = s1["a"],
		a2 = s2["a"],
		b = s2["b"],
		c = s2["c"];
	var url = "index.html?print=print&a1=" + a1 + "&a2=" + a2 + "&b=" + b + "&c=" + c
	window.open(url, '_blank');

}
function buildPrintView(){
	d3.select("body").classed("print", true)
	PRINT = true;
	// d3.select("body").append("div").attr("class", "print cover")

	d3.selectAll(".printStart").text("The")

}

var counter = 0;
function checkReady() {
  counter += 1;
  var drawn = d3.select(".bar").node();
  if (drawn == null) {
    if(counter >= 7){
        d3.select("#loadingText")
          .html("Almost done&#8230; thanks for your patience!")
    }
    setTimeout("checkReady()", 100);
  } else {
    setTimeout(function(){
        d3.select("#loadingContainer")
          .transition()
          .style("opacity", 0)
          .on("end", function(){
          	d3.select(this).remove()
          })
    },500);
  }

  // d3.select("#loadingContainer").remove();
}


function init(data){
	if(getQueryString("print") == "print"){
		buildPrintView()
	}
	buildChart(data, "income", "s1")
	buildChart(data, "parentsEd", "s1")
	buildChart(data, "race", "s1")
	buildChart(data, "instType", "s1")
	buildChart(data, "benefits", "s1")
	buildChart(data, "indep", "s1")

	buildChart(data, "income", "s2")
	buildChart(data, "parentsEd", "s2")
	buildChart(data, "race", "s2")
	buildChart(data, "instType", "s2")
	buildChart(data, "benefits", "s2")
	buildChart(data, "indep", "s2")

	buildCostData(data, "s1")
	buildCostData(data, "s2")

	buildAverageData(data, "s1")
	buildAverageData(data, "s2")

	buildScenarioMenu();

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
	updateCostData("s1");
	updateAverageData("s1");
})
d3.selectAll(".slider.s2").on("input", function(){
	checkInputs()
	updateCharts("s2");
	updateInputs("s2");
	updateCostData("s2");
	updateAverageData("s2");

})
d3.selectAll(".radioInput.s1").on("input", function(){
	updateCharts("s1")
	updateAverageData("s1")
})
d3.selectAll(".radioInput.s2").on("input", function(){
	updateCharts("s2")
	updateAverageData("s2")
})

d3.selectAll(".button.print").on("click", openPrintView)


d3.csv("data/data.csv", function(data){
	init(data)
})
checkReady();

$(window).resize(function(){
	if(!PRINT){
		updateCharts("s1")
		updateCharts("s2")
	}
})