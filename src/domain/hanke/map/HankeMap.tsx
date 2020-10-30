import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as ol from 'ol';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Draw, Modify, Snap } from 'ol/interaction';
import { TileWMS, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import 'ol/ol.css';
import { useProjects } from '../common/hooks/useProjects';
import styles from './Map.module.scss';

const image = new CircleStyle({
  radius: 5,
  fill: undefined,
  stroke: new Stroke({ color: 'red', width: 1 }),
});

/* const vectorLayerStyles = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: '#ffcc33',
    width: 2,
  }),
  image: new CircleStyle({
    radius: 7,
    fill: new Fill({
      color: '#ffcc33',
    }),
  }),
}); */

const geomStyles = {
  Point: new Style({
    image,
  }),
  LineString: new Style({
    stroke: new Stroke({
      color: 'green',
      width: 1,
    }),
  }),
  MultiLineString: new Style({
    stroke: new Stroke({
      color: 'green',
      width: 1,
    }),
  }),
  MultiPoint: new Style({
    image,
  }),
  MultiPolygon: new Style({
    stroke: new Stroke({
      color: 'yellow',
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.1)',
    }),
  }),
  Polygon: new Style({
    stroke: new Stroke({
      color: 'blue',
      lineDash: [4],
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  }),
  GeometryCollection: new Style({
    stroke: new Stroke({
      color: 'magenta',
      width: 2,
    }),
    fill: new Fill({
      color: 'magenta',
    }),
    image: new CircleStyle({
      radius: 10,
      fill: undefined,
      stroke: new Stroke({
        color: 'magenta',
      }),
    }),
  }),
  Circle: new Style({
    stroke: new Stroke({
      color: 'red',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(255,0,0,0.2)',
    }),
  }),
  LinearRing: {},
};
const styleFunction = (feature: ol.Feature) => geomStyles[feature.getGeometry().getType()];

const OpenLayer: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [map, setMap] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [draw, setDraw] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [snap, setSnap] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [drawSource] = useState<any>(new VectorSource());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectVal, setSelectVal] = useState<any>('Point');
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { projects } = useProjects();

  const setIntercations = useCallback(() => {
    if (!map) return;

    const drawInstance = new Draw({
      source: drawSource,
      type: selectVal,
    });
    map.addInteraction(drawInstance);
    const snapInstance = new Snap({ source: drawSource });
    map.addInteraction(snapInstance);

    setDraw(drawInstance);
    setSnap(snapInstance);
  }, [map, drawSource, selectVal]);

  useEffect(() => {
    if (mapContainerRef.current == null) {
      return;
    }
    const raster = new TileLayer({
      source: new TileWMS({
        url: 'https://kartta.hel.fi/ws/geoserver/avoindata/wms',
        params: {
          LAYERS: 'Kantakartta',
          FORMAT: 'image/jpeg',
          WIDTH: 256,
          HEIGHT: 256,
          VERSION: '1.1.1',
        },
        imageSmoothing: false,
        hidpi: false,
        serverType: 'geoserver',
        transition: 0,
      }),
      minZoom: 12,
      maxZoom: 18,
    });

    drawSource.addFeatures(
      new GeoJSON().readFeatures(projects, {
        featureProjection: 'EPSG:3857', // EPSG:3879
      })
    );

    const vector = new VectorLayer({
      source: drawSource,
      // eslint-disable-next-line
      // @ts-ignore
      style: styleFunction,
    });

    if (!map) {
      const mapInstance = new Map({
        layers: [raster, vector],
        target: mapContainerRef.current,
        view: new View({
          center: [2776000, 8438000],
          zoom: 13,
          minZoom: 12,
          maxZoom: 18,
        }),
      });

      const modify = new Modify({ source: drawSource });
      mapInstance.addInteraction(modify);

      setMap(mapInstance);
    }

    setIntercations();
  }, [map, setIntercations, drawSource, projects]);

  useEffect(() => {
    if (!map) return;
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectVal]);

  return (
    <div>
      <div className={styles.mapContainer}>
        <div className={styles.mapContainer__inner} ref={mapContainerRef} />
      </div>
      <select
        className={styles.mapToolbox}
        onChange={(event) => {
          setSelectVal(event.target.value);
        }}
        value={selectVal}
      >
        <option value="Point">Point</option>
        <option value="LineString">LineString</option>
        <option value="Polygon">Polygon</option>
        <option value="Circle">Circle</option>
      </select>
    </div>
  );
};

export default OpenLayer;
