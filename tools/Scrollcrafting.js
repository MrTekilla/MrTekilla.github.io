function callFetchScrolls(refresh = false) {
	document.getElementById("scrollingTable").getElementsByClassName("table")[0].tBodies[0].innerHTML = "<p>Fetching data from <a href=\"https://idlescape.xyz\">https://idlescape.xyz</a></p>";
	fetch('https://api.idlescape.xyz/scrolls')
		.then(response => response.json())
		.then(json => traitementDataScrolls(json, refresh));
}

//-------------------------------------------
//Calculs
var finalResultsScrolls = [], selectScrollRecipe = [], overviewScrollCrafting = [];
var actualSortScrolls = "prix_1xp";
var sortOrderScrolls = false;
var sortingScrollName = null;
var customScrollLevel = 0;

function traitementDataScrolls(json, refresh) {
	finalResultsScrolls = [];
	json.scrolls.forEach(e => {
		var totalPrice = 0;
		var compos = [];
		var mindRune = false;
		e.resources[0].forEach(c => {
			totalPrice += c.price * c.quantity;
			if (c.name == "Mind Rune") {
				mindRune = true;
			}
			compos.push({ "name": c.name, "price": c.price, "quantity": c.quantity, "img": c.image });
			//console.log({"name":c.name,"price" : c.price, "quantity":c.quantity});
		});

		var tmpBenef = e.price - totalPrice;
		var benef = tmpBenef - Math.abs((e.price * 0.05))
		var tmpResult = {
			"id": finalResultsScrolls.length,
			"img": e.image,
			"name": e.name,
			"level": e.level,
			"CraftingPrice": totalPrice,
			"MarketPrice": e.price,
			"exp": e.exp,
			"Benefits": benef,
			"prix_1xp": (totalPrice / e.exp).toFixed(2),
			"mindRune": mindRune ? "Yes" : "No",
			"ppxBenef": ((((e.price  - Math.abs((e.price * 0.05))) - totalPrice) * 100) / totalPrice).toFixed(2),
			"compos": compos
		}
		//Percentage profits formula : ((v2 - v1)*100)/v1 -> V2 : Selling price (Including marketplace fees) | V1 : Crafting price

		finalResultsScrolls.push(tmpResult);
		compos = [];

	});

	selectScrollRecipe = finalResultsScrolls;
	sortByValueScrolls(actualSortScrolls, refresh);
	fillScrollcraftingOverview();
	sortByString(selectScrollRecipe);
	populateSelectScroll(selectScrollRecipe);
}


function sortByValueScrolls(value, refresh) {
	if (!refresh) {
		if (actualSortScrolls == value) {
			sortOrderScrolls = !sortOrderScrolls;
		} else {
			sortOrderScrolls = false;
		}

		actualSortScrolls = value
	}

	finalResultsScrolls.sort(function (a, b) {
		return parseFloat(sortOrderScrolls ? a[value] : b[value]) - parseFloat(sortOrderScrolls ? b[value] : a[value]);
	});

	populateScrolls(sortingScrollName, customScrollLevel);

}


function populateScrolls(craftName, sortingLevel) {
	var i = 1;
	var tmpDoc = document.getElementById("scrollingTable").getElementsByClassName("table")[0].tBodies[0];
	tmpDoc.innerHTML = "";
	finalResultsScrolls.forEach(e => {
		if (craftName != null && !e.name.toLowerCase().match(craftName)) {
			return;
		}
		if (sortingLevel != 0 && parseInt(e.level) > sortingLevel) {
			return;
		}
		tmpDoc.innerHTML +=
			"<tr><th scope=\"row\" class=\"thImg\"><img src=\"" + (websiteURL + e.img) + "\" class=\"widthSet\">" +
			"</th><td><a class=\"btn btn-primary\" data-toggle=\"collapse\" href=\"#collapseScrolls" + i + "\" role=\"button\" aria-expanded=\"false\" aria-controls=\"collapseScrolls" + i + "\"><i class=\"glyphicon glyphicon-triangle-right\"></i>\t " + e.name + "</a>" +
			//"<div class=\"collapse\" id=\"collapseScrolls" + i + "\"><div class=\"card card-body\">" + generateComposHtml(e.compos) + "</div></div>" +
			"</td><td>" + e.level +
			"</td><td>" + e.mindRune +
			"</td><td>" + millionFormate(e.CraftingPrice) +
			"</td><td>" + millionFormate(e.MarketPrice) +
			"</td><td class=\"" + (e.Benefits > 0 ? "positive" : "negative") + "\"" + "><b>" + millionFormate(e.Benefits) + "</b>" +
			"</td><td class=\"" + (e.ppxBenef > 0 ? "positive" : "negative") + "\"" + "><b>" + (e.ppxBenef > 0 ? "+" : "") + millionFormate(e.ppxBenef) + "%</b>" +
			"</td><td>" + millionFormate(e.exp) +
			"</td><td>" + e.prix_1xp +
			"</td></tr>" +
			"<tr style=\"pointer-events: none;\">" +
			"<td></td>" +
			"<td colspan=\"3\">" +
				"<div id=\"collapseScrolls" + i + "\" class=\"collapse in\">" +
					generateComposHtml(e.compos) +
				"</div>" +
			"</td>" +
			"</tr>";
		//console.log(e.name + " -> Prix craft: " + e.prix + " | exp : " + e.exp + " | prix 1xp : " + e.prix_1xp);
		i++;
	});
}

function findScrollName(value) {
	if (value == "") {
		sortingScrollName = null;
	}
	populateScrolls(value, customCraftingLevel);
	sortingScrollName = value;
}

function fillScrollcraftingOverview(){
	overviewScrollCrafting = [];
	for(var i = 0 ; i < maxOverview ; i++){
		overviewScrollCrafting.push(finalResultsScrolls[i]);
	}
	populateScrollsOverview();
}

function findScrollByLevel(value) {
	if (parseInt(value) > 99) {
		value = 99;
	} else if (parseInt(value) < 0) {
		value = 0;
	}
	customScrollLevel = value;
	populateScrolls(sortingScrollName, customScrollLevel);
}

function populateSelectScroll(list) {
	document.getElementById("selectedScrollRecipe").innerHTML = "";
	list.forEach(e => {
		document.getElementById("selectedScrollRecipe").innerHTML +=
			"<option>" + e.name + "</option>";
	});

}
