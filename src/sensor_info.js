function id_to_HSV(n){
	var rotate = ((n / 6) % 6) * 10
	var H = rotate + (n % 6)*60
	var S = 1, V = 1
	return [H, S, V]
}

function HSV_to_RGB(hsv){
	var Hd = hsv[0] / 60
	var C = hsv[1]
	var X = C*(1 - Math.abs(Hd % 2 - 1))
	var V = hsv[2]
	switch (parseInt(Hd) % 6){
		case 0:
			rgb = [V, V - C + X, V - C]
			break;
		case 1:
			rgb = [V - C + X, V, V - C]
			break;
		case 2:
			rgb = [V - C, V, V - C + X]
			break;
		case 3:
			rgb = [V - C, V - C + X, V]
			break;
		case 4:
			rgb = [V - C + X, V - C, V]
			break;
		case 5:
			rgb = [V, V - C, V - C + X]
			break;
	}
	return rgb.map(function(value){
		return parseInt(value * 255)
	})
}

function RGB_to_HEX (rgb) {
	return "#" + rgb.map(function(value) {
		return ("0" + value.toString(16)).slice(-2);
	}).join("") ;
}

function get_color_code(i){
	return RGB_to_HEX(HSV_to_RGB(id_to_HSV(i)))
}

function put_markers(data, icon_prop, label_prop){
	var json_data = JSON.parse(data)
	var sensor_counter = 0
	var group_counter = 0
	var latlng = new google.maps.LatLng(35.66666, 139.766766)
	var mapOptions = {
		zoom: 6,
		center: latlng
	}
	$("#map").empty()
	var gmap = new google.maps.Map($("#map")[0], mapOptions)
	var meanLng = 0
	var meanLat = 0
	for (var group of json_data["groups"]){
		for (var sensor of group){
			latlng = new google.maps.LatLng(sensor["log"], sensor["lat"])
			meanLng += sensor["log"]
			meanLat += sensor["lat"]

			var color_code = get_color_code(group_counter)
			icon_prop.fillColor = color_code
			icon_prop.strokeColor = color_code
			label_prop.text = sensor["attribute"][0]

			marker = new google.maps.Marker({
				position: latlng,
				icon: icon_prop,
				label: label_prop
			})
			marker.setMap(gmap)
			sensor_counter++
		}
		group_counter++
	}
	meanLng /= sensor_counter
	meanLat /= sensor_counter
	console.log(meanLng, meanLat)
	gmap.setCenter(new google.maps.LatLng(meanLng, meanLat))
	console.log(json_data["dataset"])
};

$("#go").click(function(){
	  var icon_prop = {
	    fillColor: "#FF0000",
	    fillOpacity: 1.0,
	    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
	    scale: 8,
	    strokeColor: "#FF0000",
	    strokeWeight: 1.0,
	    labelOrigin: new google.maps.Point(0, -2.2)
	  }
	  var label_prop = {
	    text: 'A',
	    color: "#FFFFFF",
	    fontSize: '12px'
	  }

	console.log("send request")
	var dataset = $("#dataset").val()
	var maxAtt = $("#maxAtt").val()
	var minSup = $("#minSup").val()
	var evoRate = $("#evoRate").val()
	var distance = $("#distance").val()
	var url = `http://10.0.16.7:8000/api/miscela/${dataset}/${maxAtt}/${minSup}/${evoRate}/${distance}`
	console.log(url)

	$.ajax({
		url: url,
		type: "GET",
		datatype: "json",
	}).done(function(data){
		put_markers(data, icon_prop, label_prop)
	})
	.fail(function(data){
		console.log("Error")
	});

})