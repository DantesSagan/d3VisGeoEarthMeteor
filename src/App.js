/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';

import * as topojson from 'topojson-client';
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

      svg
        .selectAll('path')
        .data(dataEarth)
        .enter()
        .append('path')
        .attr('d', path);
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
      <svg style={{border:'1px solid black'}}></svg>
    </div>
  );
}
