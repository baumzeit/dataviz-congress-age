window.onload = function() {

	d3.csv('./data/congress-age.csv')
		.then(data => {
			const vizData = transformData(data);
			visualizeData(vizData);
		});

	function transformData(data) {
		delete data.columns;
		return data.map(entry => {
			entry.termstart = entry.termstart.slice(0,4);
			return entry;
		});
	}

	function visualizeData(data) {
		
		const q1q3 = (data) => [ d3.quantile(data, 0.25, d => d.age), d3.quantile(data, 0.75, d => d.age) ];
		const minMedMax = (data) => [+d3.min(data, d => d.age), +d3.median(data, d => d.age), +d3.max(data, d => d.age)];
		const rep = data.filter(entry => entry.party == 'r');
		const dem = data.filter(entry => entry.party == 'd');

		const groupByProp = (prop) => data.reduce((acc, entry) => {
			if (!acc.hasOwnProperty(entry[prop])) {
				acc[entry[prop]] = [];
			}
			acc[entry[prop]].push(entry);
			return acc;
		}, {});

		console.log(data);
		console.log(minMedMax(rep), minMedMax(dem));
		groupByState = groupByProp('state');
		const statsByState = {};
		for (state in groupByState) {
			const obj = { 
							name: state, 
							minMedMax: minMedMax(groupByState[state]), 
							q1q3: q1q3(groupByState[state])
						}
			statsByState[state] = obj;

		}
		console.log(statsByState);
	}
}