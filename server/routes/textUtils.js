exports = module.exports = {
	
	convertCategory: function(e) {
		if(e.publish.category === "sc")
			e.publish.category = "Star Citizen";
		else if(e.publish.category === "hd")
			e.publish.category = "Hardware";
		else if(e.publish.category === "jv")
			e.publish.category = "Jeux vidéo";
		else if(e.publish.category === "bn")
			e.publish.category = "Bad Neighbor";
	}
	
};
