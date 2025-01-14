'use client';
import {
  ControlsContainer,
  FullScreenControl,
  SearchControl,
  SigmaContainer,
  ZoomControl,
} from '@react-sigma/core';

import { drawHover, drawLabel } from '@/components/sigma/canvas-utils';
import '@react-sigma/core/lib/react-sigma.min.css';
import { CSSProperties, FC, useMemo } from 'react';
import { Settings } from 'sigma/settings';
import { LayoutsControl } from './layouts-control';
import { SampleGraph } from './sample-graph';
import './style.css';

export const Graph: FC<{ style?: CSSProperties }> = ({ style }) => {
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
  return (
    <SigmaContainer settings={sigmaSettings} style={style}>
      <SampleGraph />
      <ControlsContainer position={'bottom-right'}>
        <ZoomControl />
        <FullScreenControl />
        <LayoutsControl />
      </ControlsContainer>
      <ControlsContainer position={'top-right'}>
        <SearchControl style={{ width: '200px' }} />
      </ControlsContainer>
    </SigmaContainer>
  );
};
