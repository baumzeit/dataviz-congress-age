window.onload = function() {

	d3.csv('./data/congress-age.csv')
		.then(data => {
			const vizData = transformData(data);
			visualizeData(vizData);
		});

	function transformData(data) {
		delete data.columns;

		data.forEach(entry => {
			entry.termstart = entry.termstart.slice(0,4);
		});

		const groupByProp = (prop) => data.reduce((acc, entry) => {
			if (!acc.hasOwnProperty(entry[prop])) {
				acc[entry[prop]] = [];
			}
			acc[entry[prop]].push(entry);
			return acc;
		}, {});
		
		const dataByState = groupByProp('state');
		const statsByState = [];

		for (state in dataByState) {
			const sData = dataByState[state];
			const obj = { 
							name: state, 
							min: +d3.min(sData, d => d.age), 
							max: +d3.max(sData, d => d.age),
							median: +d3.median(sData, d => d.age), 
							q1: +d3.quantile(sData, 0.25, d => d.age),
							q3: +d3.quantile(sData, 0.75, d => d.age)
						}
			statsByState.push(obj);
		}

		return statsByState.sort((a, b) => {
			return a.name < b.name ? -1 : 0 
		});
	}

	function visualizeData(data) {
		const xTickSize = 400;
		const yTickSize = 860;
		
		const height = 400;
		const width = 840;

		const margin = { top: 10, right: 30, bottom: 30, left: 10 };
		
		const svg = d3.select('#dataviz')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		
		const xScale = d3.scalePoint()
			.domain([''].concat(data.map(entry => entry.name)))
			.range([0, width])

		const yScale = d3.scaleLinear()
			.domain([d3.min(data, d => d.min), d3.max(data, d => d.max)])
			.range([height, 0])

		const xAxis = d3.axisBottom()
			.scale(xScale)
			.tickSize(-xTickSize)

		const yAxis = d3.axisRight()
			.scale(yScale)
			.tickSize(-yTickSize)

		svg
			.append('g')
			.attr('id', 'xAxisG')
			.attr('transform', `translate(0, ${height})`)
			.call(xAxis)

		svg
			.append('g')
			.attr('id', 'yAxisG')
			.attr('transform', `translate(${width + 20}, 0)`)
			.call(yAxis)

		svg
			.selectAll('circle.median')
			.data(data)
			.enter()
			.append('circle')
			.attr('class', 'median')
			.attr('cx', d => xScale(d.name))
			.attr('cy', d => yScale(d.median))
			.attr('r', 5)
	}
}