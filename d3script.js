window.onload = function() {

	d3.csv('./data/congress-age.csv')
		.then(data => {
			visualizeData(data);
		});

	function visualizeData(data) {
		delete data.columns;

		const meanAll = d3.mean(data, x => x.age)
		const allByState = groupByProp(data, 'state')
		const stateStats = statsByState(allByState)

		const xTickSize = 450;
		const yTickSize = 1100;
		
		const height = 450;
		const width = 1120;

		const margin = { top: 30, right: 55, bottom: 10, left: 15 };
		
		const svg = d3.select('#dataviz')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		
		const xScale = d3.scalePoint()
			.domain(data.map(entry => entry.state))
			.range([margin.left, width - margin.right])
	
		const yScale = d3.scaleLinear()
			.domain([20, 100])
			.range([height - margin.bottom, margin.top])

		const xAxis = d3.axisBottom()
			.scale(xScale)
			.tickSize(-xTickSize)

		const yAxis = d3.axisRight()
			.scale(yScale)
			.tickSize(-yTickSize)
			.ticks(20)

		svg
			.append('g')
			.attr('id', 'xAxisG')
			.attr('transform', `translate(0, ${xTickSize + 10})`)
			.call(xAxis)

		svg
			.append('g')
			.attr('id', 'yAxisG')
			.attr('transform', `translate(${yTickSize}, 0)`)
			.call(yAxis)

		svg
			.selectAll('g.box')
			.data(stateStats)
			.enter()
			.append('g')
			.attr('class', 'box')
			.attr('transform', d => `translate(${xScale(d.state)}, ${yScale(d.median)})`)
			.each(function(d, i) {
				d3.select(this)
					.append('line')
					.attr('class', 'range')
					.attr('x1', 0)
					.attr('y1', d => yScale(d.max) - yScale(d.median))
					.attr('x2', 0)
					.attr('y2', d => yScale(d.min) - yScale(d.median))
					.style('stroke', 'black')
					.style('stroke-width', '2px')
					.style('opacity', 0.8)

				d3.select(this)
					.append('line')
					.attr('class', 'max')
					.attr('x1', -2)
					.attr('y1', d => yScale(d.max) - yScale(d.median))
					.attr('x2', 2)
					.attr('y2', d => yScale(d.max) - yScale(d.median))
					.style('stroke', 'black')
					.style('stroke-width', '1px')
				
				d3.select(this)
					.append('line')
					.attr('class', 'min')
					.attr('x1', -2)
					.attr('y1', d => yScale(d.min) - yScale(d.median))
					.attr('x2', 2)
					.attr('y2', d => yScale(d.min) - yScale(d.median))
					.style('stroke', 'black')
					.style('stroke-width', '1px')
				
				d3.select(this)
					.append('rect')
					.attr('class', 'q-range')
					.attr('x', -2)
					.attr('y', d => yScale(d.q3) - yScale(d.median))
					.attr('width', 4)
					.attr('height', d => yScale(d.q1) - yScale(d.q3))
					.style('stroke', 'black')
					.style('stroke-width', '1px')
					.style('fill', 'darkseagreen')


			})

		const avgG = svg
			.append('g')
			.attr('id', 'avg-line')
			.attr('transform', `translate(${margin.left - 10}, ${yScale(meanAll)})`)

		avgG
			.append('line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', yTickSize + 18)
			.attr('y2', 0)
			.style('stroke', 'orange')
			.style('stroke-width', '1px')
			.style('opacity', 0.6)

		const avgText = avgG
			.append('text')
			.attr('x', yTickSize + 24)
			.attr('y', 0)
			.attr('font-size', '0.72rem')
			.attr('dominant-baseline', 'middle')
			.style('fill', 'darkorange')

		avgText
			.append('tspan')
			.text('avg')
			.attr('x', yTickSize + 24)
			.attr('dx', 0)
			.attr('dy', -6)
		
		avgText
			.append('tspan')
			.text(d3.format('.3')(meanAll))
			.attr('x', yTickSize + 24)
			.attr('dx', 0)
			.attr('dy', 14)
			
		svg
			.selectAll('circle.median')
			.data(stateStats)
			.enter()
			.append('circle')
			.attr('class', 'median')
			.attr('cx', d => xScale(d.state))
			.attr('cy', d => yScale(d.median))
			.attr('r', 1)
			.style('fill', 'white')


		function groupByProp(objArr, prop) {
			return objArr.reduce((acc, entry) => {
				if (!acc.hasOwnProperty(entry[prop])) {
					acc[entry[prop]] = [];
				}
				acc[entry[prop]].push(entry);
				return acc;
			}, {});
		}

		function statsByState(allByState) {
			const statsByState = [];

			for (state in allByState) {
				const ages = allByState[state].map(s => s.age).sort((a, b) => {
					return a < b ? -1 : 0
				})
				const obj = { 
								state: state, 
								min: ages[0], 
								max: ages[ages.length - 1],
								median: d3.median(ages), 
								q1: d3.quantile(ages, 0.25),
								q3: d3.quantile(ages, 0.75)
							}
				statsByState.push(obj);
			}

			return statsByState.sort((a, b) => {
				return a.state < b.state ? -1 : 0 
			});
		}
	}
}