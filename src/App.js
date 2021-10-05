/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';

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

      let color = d3.scaleOrdinal(d3.schemeCategory10);
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
          return color(item.recclass);
        })
        .on('mouseover', (event, item) => {
          const [x, y] = pointer(event);

          const formatYear = d3.timeFormat('%Y');

          const formatMass = (num) => {
            return num.toString().replace(/(?=\d)(?=(\d{3})+(?!\d))/g, ' ');
          };
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
      <h1>Visualization fall of meteors on Earth </h1>
      <svg style={{ border: '1px solid black' }}></svg>
    </div>
  );
}
