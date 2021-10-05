/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';

import * as topojson from 'topojson-client';
import { pointer } from 'd3-selection';
import * as d3 from 'd3';

import './App.css';
import DrawCanvas from './Components/DrawCanvas';

export default function App() {
  let geoMeteor =
    'https://gist.githubusercontent.com/DantesSagan/2e4fc3692b9d57bb9d7185d1e6ffedc6/raw/61ff1c1b65639bcd85fe17af4f9a3f2edf61e637/geoWhereMeteorLands.json';
  let geoEarth = 'https://unpkg.com/world-atlas@1.1.4/world/50m.json';

  let dataMeteor;
  let dataEarth;

  const legendRef = useRef(null);
  const { drawCanvas, width, height } = DrawCanvas();

  useEffect(() => {
    const svg = d3.select('svg');

    drawCanvas();

    const drawEarth = () => {
      let projection = d3
        .geoMercator()
        .center([23.09, -49.06])
        .scale(200)
        .translate([width / 1.9, height / 1.5]);

      let path = d3.geoPath().projection(projection);

      // 10 different color's
      // let color = d3.scaleOrdinal(d3.schemeCategory10);

      // 50 different color's
      let colors = [
        '#E52B50',
        '#FFBF00',
        '#9966CC',
        '#FBCEB1',
        '#7FFFD4',
        '#007FFF',
        '#89CFF0',
        '#F5F5DC',
        '#CB4154',
        '#FFFFFF',
        '#0000FF',
        '#0095B6',
        '#8A2BE2',
        '#DE5D83',
        '#CD7F32',
        '#964B00',
        '#800020',
        '#702963',
        '#960018',
        '#DE3163',
        '#007BA7',
        '#F7E7CE',
        '#7FFF00',
        '#7B3F00',
        '#0047AB',
        '#6F4E37',
        '#B87333',
        '#FF7F50',
        '#DC143C',
        '#00FFFF',
        '#EDC9Af',
        '#7DF9FF',
        '#50C878',
        '#00FF3F',
        '#FFD700',
        '#808080',
        '#008000',
        '#3FFF00',
        '#4B0082',
        '#FFFFF0',
        '#00A86B',
        '#29AB87',
        '#B57EDC',
        '#FFF700',
        '#C8A2C8',
        '#BFFF00',
        '#FF00FF',
        '#FF00AF',
        '#800000',
        '#E0B0FF',
        '#000080',
        '#CC7722',
        '#808000',
        '#FF6600',
        '#FF4500',
      ];

      let colorScale = d3.scaleOrdinal().range(colors);

      svg
        .selectAll('path')
        .data(dataEarth)
        .enter()
        .append('path')
        .attr('d', path);

      var longLat = d3
        .geoMercator()
        .center([23.09, -49.06])
        .scale(200)
        .translate([width / 1.9, height / 1.5]);

      const tooltip = d3
        .select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden');

      const formatMass = (num) => {
        return num.toString().replace(/(?=\d)(?=(\d{3})+(?!\d))/g, ' ');
      };

      svg
        .selectAll('.dot')
        .data(dataMeteor)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('data-name', (item) => {
          return item.name;
        })
        .attr('data-recclass', (item) => {
          return item.recclass;
        })
        .attr('data-year', (item) => {
          return item.year;
        })
        .attr('cx', (item) => {
          return longLat([item.reclong, item.reclat])[0];
        })
        .attr('cy', (item) => {
          return longLat([item.reclong, item.reclat])[1];
        })
        .attr('r', 3)
        .style('fill', (item) => {
          return colorScale(item.recclass);
        })
        .on('mouseover', (event, item) => {
          const [x, y] = pointer(event);

          const formatYear = d3.timeFormat('%Y');

          const formatThousands = () => {
            if (item.mass > 10000) {
              return item.mass / 100;
            } else if (item.mass < 10000) {
              return item.mass / 1000;
            }
            //  else if (item.mass > 1000) {
            //   return item.mass ;
            // }
            return item.mass;
          };
          tooltip.transition().duration(200).style('visibility', 'visible');
          tooltip
            .html(
              `Year: ${formatYear(new Date(item.year))}<br /> Name: ${
                item.name
              } <br /> Mass: ${formatMass(formatThousands())} <br /> Class: ${
                item.recclass
              }`
            )
            .style('left', x + 'px')
            .style('top', y - 80 + 'px')
            .style('position', 'absolute');
        })
        .on('mouseout', () => {
          tooltip.transition().duration(200).style('visibility', 'hidden');
        });

      const legendContainer = d3.select(legendRef.current);
      legendContainer.selectAll('g').remove();

      let classes = dataMeteor.map((item) => item.recclass);

      classes = classes.filter(
        (classes, index, self) => self.indexOf(classes) === index
      );

      legendContainer.attr('width', width).attr('height', height);

      const legend = legendContainer
        .selectAll('g')
        .data(classes)
        .join('g')
        .attr('id', 'legend')
        .style('position', 'fixed');

      legend
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('x', 12)
        .attr('y', (item, i) => 12 * 2 * i)
        .attr('fill', (item) => colorScale(item));

      legend
        .append('text')
        .attr('transform', `translate(0, ${12})`)
        .attr('x', 12 * 3)
        .attr('y', (_, i) => 12 * 2 * i)
        .style('font-size', 12)
        .text((item) => item);
    };

    d3.json(geoEarth).then((data, error) => {
      if (error) {
        console.log(error);
      } else {
        dataEarth = topojson.feature(data, data.objects.countries).features;
        console.log(geoEarth);
      }
      d3.json(geoMeteor).then((data, error) => {
        if (error) {
          console.log(error);
        } else {
          dataMeteor = data;
          console.log(dataMeteor);
          drawEarth();
        }
      });
    });
  }, []);
  return (
    <div className='App'>
      <h1>
        Visualization fall of meteors on Earth <br />
        from 1700 year's by 2013 year.
      </h1>
      <svg style={{ border: '1px solid black' }}>
        {' '}
        <svg ref={legendRef} style={{}}></svg>
      </svg>
    </div>
  );
}
