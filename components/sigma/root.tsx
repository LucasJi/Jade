'use client';

import { getGraphDataset } from '@/app/api';
import { SigmaContainer } from '@react-sigma/core';
import { DirectedGraph } from 'graphology';
import { constant, keyBy, mapValues, omit } from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';
import { Settings } from 'sigma/settings';
import { drawHover, drawLabel } from './canvas-utils';
import GraphDataController from './graph-data-controller';
import GraphEventsController from './graph-events-controller';
import GraphSettingsController from './graph-settings-controller';
import SearchField from './search-field';
import './style.css';
import TagsPanel from './tags-panel';
import { Dataset, FiltersState } from './types';

const Root: FC = () => {
  const graph = useMemo(() => new DirectedGraph(), []);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    tags: {},
  });

  const sigmaSettings: Partial<Settings> = useMemo(
    () => ({
      // nodeProgramClasses: {
      //   image: createNodeImageProgram({
      //     size: { mode: 'force', value: 256 },
      //   }),
      // },
      defaultDrawNodeLabel: drawLabel,
      defaultDrawNodeHover: drawHover,
      // defaultNodeType: 'image',
      defaultEdgeType: 'arrow',
      labelDensity: 0.07,
      labelGridCellSize: 60,
      labelRenderedSizeThreshold: 15,
      labelFont: 'Lato, sans-serif',
      zIndex: true,
    }),
    [],
  );

  useEffect(() => {
    getGraphDataset().then(dataset => {
      graph.clear();

      const tags = keyBy(dataset.tags, 'key');

      dataset.nodes.forEach(node =>
        graph.addNode(node.key, {
          ...node,
        }),
      );
      dataset.edges.forEach(([source, target]) =>
        graph.addEdge(source, target, { size: 1 }),
      );

      setFiltersState({
        tags: mapValues(keyBy(dataset.tags, 'key'), constant(true)),
      });
      setDataset(dataset);
      requestAnimationFrame(() => setDataReady(true));
    });
  }, []);

  if (!dataset) {
    return null;
  }

  return (
    <div id="app-root" className={'show-contents'}>
      <SigmaContainer graph={DirectedGraph} settings={sigmaSettings}>
        <GraphSettingsController hoveredNode={hoveredNode} />
        <GraphEventsController setHoveredNode={setHoveredNode} />
        <GraphDataController dataset={dataset} filters={filtersState} />

        {dataReady && (
          <>
            <div className="controls">
              {/*<FullScreenControl className="ico">*/}
              {/*  <BsArrowsFullscreen />*/}
              {/*  <BsFullscreenExit />*/}
              {/*</FullScreenControl>*/}

              {/*<ZoomControl className="ico">*/}
              {/*  <BsZoomIn />*/}
              {/*  <BsZoomOut />*/}
              {/*  <BiRadioCircleMarked />*/}
              {/*</ZoomControl>*/}
            </div>
            <div className="contents">
              <div className="panels">
                <SearchField filters={filtersState} />
                <TagsPanel
                  tags={dataset.tags}
                  filters={filtersState}
                  setTags={tags =>
                    setFiltersState(() => ({
                      tags,
                    }))
                  }
                  toggleTag={tag => {
                    setFiltersState(filters => ({
                      ...filters,
                      tags: filters.tags[tag]
                        ? omit(filters.tags, tag)
                        : { ...filters.tags, [tag]: true },
                    }));
                  }}
                />
              </div>
            </div>
          </>
        )}
      </SigmaContainer>
    </div>
  );
};

export default Root;
