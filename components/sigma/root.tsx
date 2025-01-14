'use client';

import { SigmaContainer } from '@react-sigma/core';
import { createNodeImageProgram } from '@sigma/node-image';
import { DirectedGraph } from 'graphology';
import { omit } from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';
import { Settings } from 'sigma/settings';
import { drawHover, drawLabel } from './canvas-utils';
import ClustersPanel from './clusters-panel';
import GraphDataController from './graph-data-controller';
import GraphEventsController from './graph-events-controller';
import GraphSettingsController from './graph-settings-controller';
import SearchField from './search-field';
import './style.css';
import TagsPanel from './tags-panel';
import { Dataset, FiltersState } from './types';

// const Fa2: FC = () => {
//   const { start, kill } = useWorkerLayoutForceAtlas2({
//     settings: { slowDown: 3 },
//   });
//
//   useEffect(() => {
//     // start FA2
//     start();
//
//     // Kill FA2 on unmount
//     return () => {
//       kill();
//     };
//   }, [start, kill]);
//
//   return null;
// };

const Root: FC = () => {
  const graph = useMemo(() => new DirectedGraph(), []);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
  });

  const sigmaSettings: Partial<Settings> = useMemo(
    () => ({
      nodeProgramClasses: {
        image: createNodeImageProgram({
          size: { mode: 'force', value: 256 },
        }),
      },
      defaultDrawNodeLabel: drawLabel,
      defaultDrawNodeHover: drawHover,
      defaultNodeType: 'image',
      defaultEdgeType: 'arrow',
      labelDensity: 0.07,
      labelGridCellSize: 60,
      labelRenderedSizeThreshold: 15,
      labelFont: 'Lato, sans-serif',
      zIndex: true,
    }),
    [],
  );

  // Load data on mount:
  useEffect(() => {
    fetch('./dataset.json')
      .then(res => res.json())
      .then((dataset: Dataset) => {
        // graph.clear();
        // const tags = keyBy(dataset.tags, 'key');
        // const clusters = keyBy(dataset.clusters, 'key');
        //
        // dataset.nodes.forEach(node => {
        //   graph.addNode(node.key, {
        //     ...node,
        //     ...omit(clusters[node.cluster], 'key'),
        //     // image: `./images/${tags[node.tag].image}`,
        //   });
        // });
        // dataset.edges.forEach(([source, target]) =>
        //   graph.addEdge(source, target, { size: 1 }),
        // );
        //
        // // Use degrees as node sizes:
        // const scores = graph
        //   .nodes()
        //   .map(node => graph.getNodeAttribute(node, 'score'));
        // const minDegree = Math.min(...scores);
        // const maxDegree = Math.max(...scores);
        // const MIN_NODE_SIZE = 3;
        // const MAX_NODE_SIZE = 30;
        // graph.forEachNode(node =>
        //   graph.setNodeAttribute(
        //     node,
        //     'size',
        //     ((graph.getNodeAttribute(node, 'score') - minDegree) /
        //       (maxDegree - minDegree)) *
        //       (MAX_NODE_SIZE - MIN_NODE_SIZE) +
        //       MIN_NODE_SIZE,
        //   ),
        // );
        //
        // setFiltersState({
        //   clusters: mapValues(keyBy(dataset.clusters, 'key'), constant(true)),
        //   tags: mapValues(keyBy(dataset.tags, 'key'), constant(true)),
        // });
        setDataset(dataset);
        requestAnimationFrame(() => setDataReady(true));
      });
  }, []);

  if (!dataset) {
    return null;
  }

  return (
    <div id="app-root" className={'show-contents'}>
      <SigmaContainer
        // graph={DirectedGraph}
        settings={sigmaSettings}
        className=""
      >
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
                <ClustersPanel
                  clusters={dataset.clusters}
                  filters={filtersState}
                  setClusters={clusters =>
                    setFiltersState(filters => ({
                      ...filters,
                      clusters,
                    }))
                  }
                  toggleCluster={cluster => {
                    setFiltersState(filters => ({
                      ...filters,
                      clusters: filters.clusters[cluster]
                        ? omit(filters.clusters, cluster)
                        : { ...filters.clusters, [cluster]: true },
                    }));
                  }}
                />
                <TagsPanel
                  tags={dataset.tags}
                  filters={filtersState}
                  setTags={tags =>
                    setFiltersState(filters => ({
                      ...filters,
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

        {/*<Fa2 />*/}
      </SigmaContainer>
    </div>
  );
};

export default Root;
